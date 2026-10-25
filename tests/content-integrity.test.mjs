// Kiểm toàn vẹn dữ liệu học liệu. Chạy: node --test tests/
// Chỉ đọc các file dữ liệu thuần (không import, không DOM) nên không cần build.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const dir = new URL('../src/', import.meta.url);
const files = readdirSync(dir).filter(f => f.endsWith('.ts') && !/^import /m.test(readFileSync(new URL(f, dir), 'utf8')));

const quizzes = [];
const termLists = [];
const readingLists = [];
for (const f of files) {
  const mod = await import(new URL(f, dir));
  for (const [name, value] of Object.entries(mod)) {
    if (!Array.isArray(value) || !value.length || typeof value[0] !== 'object') continue;
    const keys = Object.keys(value[0]);
    if (keys.includes('q') && keys.includes('o') && keys.includes('a')) quizzes.push([`${f}:${name}`, value]);
    else if (keys.includes('hanzi') && keys.includes('meaning')) termLists.push([`${f}:${name}`, value]);
    else if (keys.includes('q') && keys.includes('options') && keys.includes('answer')) readingLists.push([`${f}:${name}`, value]);
  }
}

const text = v => typeof v === 'string' && v.trim().length > 0;

test('tìm thấy đủ các bộ dữ liệu (phát hiện file bị đổi tên hoặc mất)', () => {
  assert.ok(quizzes.length >= 15, `quiz: ${quizzes.length}`);
  assert.ok(termLists.length >= 8, `terms: ${termLists.length}`);
  assert.ok(readingLists.length >= 5, `readings: ${readingLists.length}`);
});

test('mọi câu trắc nghiệm có đáp án hợp lệ', () => {
  const bad = [];
  for (const [name, list] of quizzes) {
    list.forEach((item, i) => {
      const ok = text(item.q) && Array.isArray(item.o) && item.o.length >= 2 && item.o.every(text)
        && new Set(item.o.map(s => s.trim())).size === item.o.length
        && Number.isInteger(item.a) && item.a >= 0 && item.a < item.o.length;
      if (!ok) bad.push(`${name}[${i}]`);
    });
  }
  assert.deepEqual(bad, []);
});

test('mọi từ vựng có chữ Hán và nghĩa', () => {
  const bad = [];
  for (const [name, list] of termLists) {
    list.forEach((t, i) => { if (!text(t.hanzi) || !text(t.meaning)) bad.push(`${name}[${i}]`); });
  }
  assert.deepEqual(bad, []);
});

test('mọi bài đọc có câu hỏi và đáp án hợp lệ', () => {
  const bad = [];
  for (const [name, list] of readingLists) {
    list.forEach((r, i) => {
      const ok = text(r.title) && text(r.han) && text(r.q) && Array.isArray(r.options) && r.options.length >= 2
        && Number.isInteger(r.answer) && r.answer >= 0 && r.answer < r.options.length;
      if (!ok) bad.push(`${name}[${i}]`);
    });
  }
  assert.deepEqual(bad, []);
});
