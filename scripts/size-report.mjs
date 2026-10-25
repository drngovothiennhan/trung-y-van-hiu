// In dung lượng bản build (raw và gzip) vào log và GitHub step summary.
// Chỉ đo, không làm fail build. Chạy sau `npm run build`.
import { readdirSync, readFileSync, statSync, appendFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const root = process.argv[2] || 'dist';
if (!existsSync(root)) { console.error(`Không thấy thư mục ${root}`); process.exit(1); }

const rows = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(js|css|html)$/.test(name)) continue;
    const buf = readFileSync(p);
    rows.push({ file: p, raw: buf.length, gzip: gzipSync(buf).length });
  }
})(root);

rows.sort((a, b) => b.raw - a.raw);
const kb = n => (n / 1024).toFixed(1);
const total = rows.reduce((s, r) => ({ raw: s.raw + r.raw, gzip: s.gzip + r.gzip }), { raw: 0, gzip: 0 });
const lines = ['| File | Raw KB | Gzip KB |', '|---|---:|---:|', ...rows.slice(0, 15).map(r => `| ${r.file} | ${kb(r.raw)} | ${kb(r.gzip)} |`), `| **Tổng js/css/html (${rows.length} file)** | ${kb(total.raw)} | ${kb(total.gzip)} |`];
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Dung lượng bản build\n\n${lines.join('\n')}\n`);
