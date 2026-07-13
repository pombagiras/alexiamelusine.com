import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const MIGRATE_DIR = dirname(__filename);
const ROOT = dirname(MIGRATE_DIR);
const BACKUP_DIR = join(MIGRATE_DIR, 'backup_html');

console.log('⚡ FASE 4 — APLICANDO substituições nos HTMLs');
console.log(`   CDN Base: https://cdn.pombagiras.com`);
console.log('');

mkdirSync(BACKUP_DIR, { recursive: true });

// 1. Escanear todos os HTMLs
const SKIP_DIRS = new Set(['node_modules', '.git', 'migrate_r2', '.agents', 'backup_html']);

function scanHtml(dir, results = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) scanHtml(fullPath, results);
    else if (entry.name.endsWith('.html')) results.push(fullPath);
  }
  return results;
}

const htmlFiles = scanHtml(ROOT);
console.log(`   HTMLs encontrados: ${htmlFiles.length}`);
console.log('');

let totalModified = 0;
let totalReplacements = 0;

for (const filePath of htmlFiles) {
  const relPath = filePath.replace(ROOT + '\\', '').replace(/\\/g, '/');
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;

  let fileReplacements = 0;

  // Rule 1: GitHub Raw references for current repo
  const githubRawRegex = /https:\/\/raw\.githubusercontent\.com\/pombagiras\/alexiamelusine\.com\/(?:refs\/heads\/)?main\//gi;
  if (githubRawRegex.test(content)) {
    const matches = content.match(githubRawRegex).length;
    content = content.replace(githubRawRegex, 'https://cdn.pombagiras.com/');
    fileReplacements += matches;
  }

  // Rule 2: Absolute self-referential domain asset references
  const absDomainRegex = /https:\/\/alexiamelusine\.com\/assets\//gi;
  if (absDomainRegex.test(content)) {
    const matches = content.match(absDomainRegex).length;
    content = content.replace(absDomainRegex, 'https://cdn.pombagiras.com/assets/');
    fileReplacements += matches;
  }

  // Rule 3: Local relative/absolute references to assets folder in src or href
  // Evitar substituir caminhos de manifest.webmanifest
  const relativeAssetsRegex = /(href|src)=["'](?:\.\.\/|\/)?assets\/([^"'\?]+)(?:\?v=[\d\.]+)?["']/gi;
  if (relativeAssetsRegex.test(content)) {
    const matches = content.match(relativeAssetsRegex).length;
    content = content.replace(relativeAssetsRegex, (match, attr, fileName) => {
      // Manter os manifestos locais, mas favicons e imagens de perfil vão para o CDN
      return `${attr}="https://cdn.pombagiras.com/assets/${fileName}"`;
    });
    fileReplacements += matches;
  }

  // Rule 4: Pride specific local files (only for files in pride/ folder)
  if (relPath.startsWith('pride/')) {
    const prideMediaFiles = [
      'vida_pride_8.webp',
      'gente_pride_1.webp',
      'gente_pride_3.webp',
      'Mpride%20(10).png',
      'Mpride%20(114).png',
      'Mpride (10).png',
      'Mpride (114).png'
    ];

    for (const fileName of prideMediaFiles) {
      // Escapar para regex de correspondência exata
      const escaped = fileName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const prideMediaRegex = new RegExp(`(src|href|data-full)=["'](?:\\.\\.\\/|\\/)?${escaped}["']`, 'gi');
      if (prideMediaRegex.test(content)) {
        const matches = content.match(prideMediaRegex).length;
        // Normalizar o nome do arquivo para URL
        const normalizedName = fileName.replace(/ /g, '%20');
        content = content.replace(prideMediaRegex, `$1="https://cdn.pombagiras.com/pride/${normalizedName}"`);
        fileReplacements += matches;
      }
    }

    // Rule 5: Active video tag structure replacement in pride/index.html & live_index.html
    const videoBlockRegex = /<video autoplay loop muted playsinline controls width="100%">[\s\S]+?VPRIDE\.mp4[\s\S]+?<\/video>/gi;
    if (videoBlockRegex.test(content)) {
      content = content.replace(
        videoBlockRegex,
        `<video autoplay loop muted playsinline controls width="100%" poster="https://cdn.pombagiras.com/pride/pride-video-poster.jpg" class="w-full rounded-3xl object-cover">
                  <source src="https://cdn.pombagiras.com/pride/pride-video.webm" type="video/webm">
                  <source src="https://cdn.pombagiras.com/pride/pride-video-optimized.mp4" type="video/mp4">
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>`
      );
      fileReplacements++;
    }
  }

  if (content !== originalContent) {
    totalModified++;
    totalReplacements += fileReplacements;

    // Criar backup antes de modificar
    const backupPath = join(BACKUP_DIR, relPath.replace(/\//g, '__'));
    writeFileSync(backupPath, originalContent, 'utf8');

    // Salvar modificação
    writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ MODIFICADO: ${relPath} (${fileReplacements} substituições)`);
  }
}

console.log('\n✅ FASE 4 CONCLUÍDA');
console.log('───────────────────────────────────');
console.log(`   HTMLs modificados : ${totalModified}`);
console.log(`   Substituições totais : ${totalReplacements}`);
console.log(`   📦 Backups salvos em : migrate_r2/backup_html/`);
