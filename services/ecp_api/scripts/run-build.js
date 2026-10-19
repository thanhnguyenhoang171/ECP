const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

// Tự động load file .env từ thư mục gốc của Monorepo
const rootDir = path.resolve(__dirname, '../../..');
loadEnvFile(path.join(rootDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.local'));
loadEnvFile(path.resolve(__dirname, '../.env.local'));
loadEnvFile(path.resolve(__dirname, '../.env'));

const isWin = os.platform() === 'win32';
let cmd = isWin ? 'mvnw.cmd' : './mvnw';
const serviceDir = path.resolve(__dirname, '..');

if (!isWin && !fs.existsSync(path.join(serviceDir, 'mvnw'))) {
  cmd = 'mvn';
}

const result = spawnSync(cmd, ['clean', 'package', '-DskipTests'], {
  stdio: 'inherit',
  shell: true,
  cwd: serviceDir,
  env: process.env,
});

process.exit(result.status || 0);
