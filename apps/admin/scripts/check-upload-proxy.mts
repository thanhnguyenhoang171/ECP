import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { default: loadConfig } = require('next/dist/server/config') as {
  default: (phase: string, directory: string) => Promise<{
    experimental: { proxyClientMaxBodySize: number; proxyTimeout: number };
  }>;
};
const { getCloneableBody } = require('next/dist/server/body-streams') as {
  getCloneableBody: (stream: Readable, limit: number) => {
    cloneBodyStream: () => Readable;
  };
};

const directory = fileURLToPath(new URL('../', import.meta.url));
const config = await loadConfig('phase-production-build', directory);
const { proxyClientMaxBodySize, proxyTimeout } = config.experimental;
assert.equal(proxyClientMaxBodySize, 500 * 1024 * 1024);
assert.equal(proxyTimeout, 300000);

// Exercise Next's actual request-body cloning with complete multipart payloads.
// A truncated clone leaves the upstream waiting for the advertised Content-Length.
for (const sizeMiB of [12, 50]) {
  const prefix = Buffer.from('--test\r\nContent-Disposition: form-data; name="file"; filename="test.bin"\r\n\r\n');
  const suffix = Buffer.from('\r\n--test--\r\n');
  const chunk = Buffer.alloc(64 * 1024, 0x61);
  const chunks = [prefix, ...Array<Buffer>(sizeMiB * 16).fill(chunk), suffix];
  const expected = createHash('sha256');
  for (const part of chunks) {
    expected.update(part);
  }

  const clone = getCloneableBody(Readable.from(chunks), proxyClientMaxBodySize).cloneBodyStream();
  const received = createHash('sha256');
  let bytes = 0;
  for await (const part of clone) {
    const buffer = Buffer.from(part as Uint8Array);
    received.update(buffer);
    bytes += buffer.length;
  }
  assert.equal(bytes, prefix.length + sizeMiB * 1024 * 1024 + suffix.length);
  assert.equal(received.digest('hex'), expected.digest('hex'));
  process.stdout.write(`PASS: ${sizeMiB} MiB multipart forwarded without truncation\n`);
}
