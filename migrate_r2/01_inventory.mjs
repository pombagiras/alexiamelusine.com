import { createHash } from 'crypto';
import { readFileSync, writeFileSync, statSync, mkdirSync, readdirSync } from 'fs';
import { join, relative, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const MIGRATE_DIR = dirname(__filename);
const ROOT = dirname(MIGRATE_DIR);

mkdirSync(MIGRATE_DIR, { recursive: true });
const MEDIA_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp4', '.webm', '.ico']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'migrate_r2', '.agents', 'backup_html']);

console.log('🔍 FASE 1 — Inventário de Ativos de Mídia');
console.log('Root:', ROOT);
console.log('');

// 1. Escanear arquivos de mídia
function scanMedia(dir, results = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanMedia(fullPath, results);
    } else if (MEDIA_EXTS.has(extname(entry.name).toLowerCase())) {
      const rel = relative(ROOT, fullPath).replace(/\\/g, '/');
      const stat = statSync(fullPath);
      const content = readFileSync(fullPath);
      const hash = createHash('md5').update(content).digest('hex');
      results.push({
        path: rel,
        size: stat.size,
        ext: extname(entry.name).toLowerCase(),
        md5: hash,
        referencedIn: []
      });
    }
  }
  return results;
}

// 2. Escanear arquivos HTML/JS
function scanHtmlRefs(dir, htmlFiles = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { return htmlFiles; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanHtmlRefs(fullPath, htmlFiles);
    } else if (['.html', '.js'].includes(extname(entry.name).toLowerCase())) {
      htmlFiles.push({
        path: relative(ROOT, fullPath).replace(/\\/g, '/'),
        fullPath,
        content: readFileSync(fullPath, 'utf8')
      });
    }
  }
  return htmlFiles;
}

console.log('📁 Escaneando arquivos de mídia...');
const mediaFiles = scanMedia(ROOT);
console.log(`   → ${mediaFiles.length} arquivos de mídia encontrados`);

console.log('📄 Escaneando arquivos HTML/JS...');
const htmlFiles = scanHtmlRefs(ROOT);
console.log(`   → ${htmlFiles.length} arquivos HTML/JS encontrados`);

// 3. Detectar duplicatas por MD5
const hashMap = new Map();
const duplicates = [];

for (const file of mediaFiles) {
  if (hashMap.has(file.md5)) {
    duplicates.push({
      canonical: hashMap.get(file.md5),
      duplicate: file.path,
      md5: file.md5
    });
    file.isDuplicate = true;
    file.canonicalPath = hashMap.get(file.md5);
  } else {
    hashMap.set(file.md5, file.path);
    file.isDuplicate = false;
  }
}

console.log(`\n⚠️  Duplicatas encontradas: ${duplicates.length}`);
for (const dup of duplicates) {
  console.log(`   DUPLICATE: ${dup.duplicate}`);
  console.log(`          == ${dup.canonical}`);
}

// 4. Mapear referências de URL (tanto locais quanto GitHub)
console.log('\n🔗 Mapeando referências nos arquivos HTML/JS...');

const GITHUB_RAW_PATTERNS = [
  /https:\/\/raw\.githubusercontent\.com\/pombagiras\/alexiamelusine\.com\/main\/([^\s"'<>#]+)/g,
  /https:\/\/raw\.githubusercontent\.com\/pombagiras\/alexiamelusine\.com\/refs\/heads\/main\/([^\s"'<>#]+)/g,
];

const refMap = {};
const githubRawRefs = [];

for (const html of htmlFiles) {
  let matchCount = 0;
  for (const pattern of GITHUB_RAW_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.source, 'g');
    while ((match = regex.exec(html.content)) !== null) {
      const assetPath = decodeURIComponent(match[1]);
      if (!refMap[assetPath]) refMap[assetPath] = [];
      if (!refMap[assetPath].includes(html.path)) {
        refMap[assetPath].push(html.path);
      }
      matchCount++;
    }
  }

  // Verificar referências relativas a mídias locais
  for (const media of mediaFiles) {
    // Escapar caracteres para regex
    const escapedPath = media.path.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const localRegex = new RegExp(`(["'])(?:\\.\\./|/)?${escapedPath}(?:\\?v=[\\d\\.]+)?\\1`, 'g');
    if (localRegex.test(html.content)) {
      if (!refMap[media.path]) refMap[media.path] = [];
      if (!refMap[media.path].includes(html.path)) {
        refMap[media.path].push(html.path);
      }
      matchCount++;
    }
  }

  if (matchCount > 0) {
    githubRawRefs.push({ file: html.path, count: matchCount });
  }
}

// Associar referências de volta ao inventário de mídia
for (const file of mediaFiles) {
  file.referencedIn = refMap[file.path] || [];
}

// 5. Gerar inventário final
const totalSize = mediaFiles.reduce((s, f) => s + f.size, 0);
const nonDuplicates = mediaFiles.filter(f => !f.isDuplicate);

const inventory = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalFiles: mediaFiles.length,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    duplicates: duplicates.length,
    htmlFilesWithRefs: githubRawRefs.length,
    uniqueAssetsToUpload: nonDuplicates.length,
  },
  duplicates,
  htmlRefsSummary: githubRawRefs,
  files: mediaFiles.map(f => ({
    path: f.path,
    size: f.size,
    ext: f.ext,
    md5: f.md5,
    isDuplicate: f.isDuplicate,
    canonicalPath: f.canonicalPath || null,
    referencedIn: f.referencedIn,
    cdnUrl: `https://cdn.pombagiras.com/${f.isDuplicate ? (f.canonicalPath || f.path) : f.path}`,
  }))
};

writeFileSync(join(MIGRATE_DIR, 'inventory.json'), JSON.stringify(inventory, null, 2), 'utf8');

console.log('\n✅ FASE 1 CONCLUÍDA');
console.log('───────────────────────────────────');
console.log(`   Total de arquivos de mídia : ${inventory.summary.totalFiles}`);
console.log(`   Tamanho total              : ${inventory.summary.totalSizeMB} MB`);
console.log(`   Duplicatas identificadas   : ${inventory.summary.duplicates}`);
console.log(`   HTMLs com refs mapeadas    : ${inventory.summary.htmlFilesWithRefs}`);
console.log(`   Ativos únicos p/ upload    : ${inventory.summary.uniqueAssetsToUpload}`);
console.log('\n   📦 Inventário salvo em: migrate_r2/inventory.json');
