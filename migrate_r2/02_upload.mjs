import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const MIGRATE_DIR = dirname(__filename);
const ROOT = dirname(MIGRATE_DIR);

const {
  CLOUDFLARE_R2_ACCESS_KEY_ID: accessKeyId,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: secretAccessKey,
  CLOUDFLARE_R2_BUCKET_NAME: bucketName,
  CLOUDFLARE_R2_ENDPOINT: endpoint,
} = process.env;

if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
  console.error('❌ Variáveis de ambiente do R2 não encontradas. Verifique se o arquivo .env existe e contém as credenciais corretas.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

const inventory = JSON.parse(readFileSync(join(MIGRATE_DIR, 'inventory.json'), 'utf8'));
const uploadLog = [];

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mimeMap = {
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ico': 'image/x-icon',
  };
  if (mimeMap[ext]) return mimeMap[ext];
  try {
    const type = mime.lookup(filePath);
    if (type) return type;
  } catch {}
  return 'application/octet-stream';
}

async function existsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(file) {
  if (file.isDuplicate) {
    return { path: file.path, status: 'SKIPPED_DUPLICATE', cdnUrl: file.cdnUrl };
  }

  const key = file.path;
  const mimeType = getMimeType(file.path);
  const fileContent = readFileSync(join(ROOT, file.path));

  const alreadyExists = await existsInR2(key);
  if (alreadyExists) {
    console.log(`   ⏭️  JÁ EXISTE: ${key}`);
    return { path: file.path, status: 'ALREADY_EXISTS', cdnUrl: file.cdnUrl, key };
  }

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    return { path: file.path, status: 'UPLOADED', cdnUrl: file.cdnUrl, key, size: file.size };
  } catch (err) {
    console.error(`   ❌ ERRO: ${key} — ${err.message}`);
    return { path: file.path, status: 'ERROR', error: err.message, cdnUrl: file.cdnUrl, key };
  }
}

// Ordem de upload: favicons/ícones primeiro, mídias gerais depois
function uploadPriority(file) {
  if (file.path.match(/favicon|apple-touch|android-chrome/)) return 1;
  if (file.path.startsWith('assets/')) return 2;
  if (file.path.startsWith('pride/')) return 3;
  return 4;
}

const filesToUpload = inventory.files
  .filter(f => !f.isDuplicate)
  .sort((a, b) => uploadPriority(a) - uploadPriority(b));

console.log('🚀 FASE 2 — Upload para Cloudflare R2');
console.log(`   Bucket  : ${bucketName}`);
console.log(`   Endpoint: ${endpoint}`);
console.log(`   Arquivos a enviar: ${filesToUpload.length}`);
console.log('');

let uploaded = 0;
let skipped = 0;
let errors = 0;
let alreadyExists = 0;

for (let i = 0; i < filesToUpload.length; i++) {
  const file = filesToUpload[i];
  const progress = `[${String(i + 1).padStart(3, '0')}/${filesToUpload.length}]`;

  process.stdout.write(`${progress} ${file.path} ... `);
  const result = await uploadFile(file);

  switch (result.status) {
    case 'UPLOADED':
      console.log(`✅ OK (${(result.size / 1024).toFixed(0)} KB)`);
      uploaded++;
      break;
    case 'ALREADY_EXISTS':
      console.log(`⏭️  já existe`);
      alreadyExists++;
      break;
    case 'SKIPPED_DUPLICATE':
      console.log(`⚠️  duplicata — ignorado`);
      skipped++;
      break;
    case 'ERROR':
      console.log(`❌ ERRO: ${result.error}`);
      errors++;
      break;
    default:
      console.log(`— ${result.status}`);
  }

  uploadLog.push(result);
}

writeFileSync(join(MIGRATE_DIR, 'upload_log.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  summary: { uploaded, skipped, alreadyExists, errors, total: filesToUpload.length },
  files: uploadLog,
}, null, 2), 'utf8');

console.log('\n✅ FASE 2 CONCLUÍDA');
console.log('───────────────────────────────────');
console.log(`   Enviados com sucesso : ${uploaded}`);
console.log(`   Já existiam no R2   : ${alreadyExists}`);
console.log(`   Ignorados (dup)     : ${skipped}`);
console.log(`   Erros               : ${errors}`);

if (errors > 0) {
  console.log('\n   ⛔ Existem erros. Revise upload_log.json antes de prosseguir.');
  process.exit(1);
}
console.log('\n   📦 Log salvo em: migrate_r2/upload_log.json');
