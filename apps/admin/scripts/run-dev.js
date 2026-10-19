const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (val.includes('#')) {
        val = val.split('#')[0].trim();
      }
      val = val.replace(/^["']|["']$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

const adminDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(adminDir, '../..');

// Thứ tự ưu tiên nạp file env: .env.development.local -> .env.local -> .env.development -> .env (admin rồi root)
loadEnvFile(path.join(adminDir, '.env.development.local'));
loadEnvFile(path.join(adminDir, '.env.local'));
loadEnvFile(path.join(adminDir, '.env.development'));
loadEnvFile(path.join(adminDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.development.local'));
loadEnvFile(path.join(rootDir, '.env.local'));
loadEnvFile(path.join(rootDir, '.env'));

const port = process.env.PORT || process.env.ADMIN_PORT || '3001';
const args = process.argv.slice(2);
const hasPortArg = args.includes('-p') || args.includes('--port');
const spawnArgs = hasPortArg ? ['dev', ...args] : ['dev', '-p', port, ...args];

const nextBin = path.join(adminDir, 'node_modules/.bin/next');
const cmd = fs.existsSync(nextBin) ? nextBin : 'next';

console.log(`> [Admin] Starting dev server on port ${port}...`);

const child = spawn(cmd, spawnArgs, {
  stdio: 'inherit',
  shell: true,
  cwd: adminDir,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code || 0);
  }
});
