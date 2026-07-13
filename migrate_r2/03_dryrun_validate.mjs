import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const MIGRATE_DIR = dirname(__filename);

const uploadLog = JSON.parse(readFileSync(join(MIGRATE_DIR, 'upload_log.json'), 'utf8'));
const CDN_BASE = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://cdn.pombagiras.com';

console.log('🔍 FASE 3 — Validação HTTP 200 via CDN');
console.log(`   CDN Base: ${CDN_BASE}`);
console.log('');

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    return { url, status: response.status, ok: response.status === 200 };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message };
  }
}

const filesToCheck = uploadLog.files.filter(f =>
  f.status === 'UPLOADED' || f.status === 'ALREADY_EXISTS'
);

console.log(`   Arquivos a validar: ${filesToCheck.length}`);
console.log('');

const results = [];
let passed = 0;
let failed = 0;

for (let i = 0; i < filesToCheck.length; i++) {
  const file = filesToCheck[i];
  const cdnUrl = file.cdnUrl || `${CDN_BASE}/${file.key}`;
  const progress = `[${String(i + 1).padStart(3, '0')}/${filesToCheck.length}]`;

  process.stdout.write(`${progress} ${cdnUrl} ... `);
  const result = await checkUrl(cdnUrl);

  if (result.ok) {
    console.log(`✅ 200`);
    passed++;
  } else {
    console.log(`❌ ${result.status}${result.error ? ` — ${result.error}` : ''}`);
    failed++;
  }

  results.push({ ...file, cdnUrl, httpStatus: result.status, valid: result.ok, error: result.error });
}

writeFileSync(join(MIGRATE_DIR, 'validation_report.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  cdnBase: CDN_BASE,
  summary: { total: filesToCheck.length, passed, failed },
  files: results,
}, null, 2), 'utf8');

console.log('\n✅ FASE 3 CONCLUÍDA');
console.log('───────────────────────────────────');
console.log(`   ✅ Válidos (HTTP 200) : ${passed}`);
console.log(`   ❌ Falhas             : ${failed}`);

if (failed > 0) {
  console.log('\n   ⛔ BLOQUEIO: Existem URLs inválidas. Revise validation_report.json.');
  console.log('   ⚠️  Não execute a Fase 4 até que todas as URLs retornem HTTP 200.');
  process.exit(1);
} else {
  console.log('\n   🟢 TODOS OS ARQUIVOS ESTÃO ACESSÍVEIS VIA CDN!');
  console.log('   ✅ Liberado para executar a Fase 4 (substituição de referências nos HTMLs).');
  console.log('\n   📦 Relatório salvo em: migrate_r2/validation_report.json');
}
