// Hồ sơ cách học của từng thành viên: ghi nhớ cách học nào hiệu quả với bạn,
// rồi gợi ý và tự xoay chế độ ôn để mỗi lần gặp lại một từ là một cách khác.
// Dữ liệu nhỏ gọn, nằm trong progress.learner nên đồng bộ cùng tiến độ.

export type StudyMode = 'han2vi' | 'vi2han' | 'pick' | 'choice' | 'rev' | 'recall';
export const EXAM_MODES = ['han2vi', 'vi2han', 'pick'] as const;
export type ExamMode = (typeof EXAM_MODES)[number];

type Pair = [number, number]; // [lần, đúng]

export type Learner = {
  v: 1;
  n: number; // tổng số lần trả lời đã ghi
  modes: Record<string, [number, number, number, number]>; // [lần, đúng, tổng ms, số lần có đo ms]
  hours: Pair[]; // 24 phần tử
  groups: Record<string, Pair>;
  w: Record<string, number[]>; // hanzi → [n0,ok0,n1,ok1,n2,ok2,lastModeIndex(-1 nếu chưa)]
  days: Record<string, number>; // yyyy-mm-dd → số lần trả lời (30 ngày gần nhất)
};

export const MIN_EVENTS = 20;

export function emptyLearner(): Learner {
  return { v: 1, n: 0, modes: {}, hours: Array.from({ length: 24 }, () => [0, 0] as Pair), groups: {}, w: {}, days: {} };
}

export function normalizeLearner(raw: any): Learner {
  const base = emptyLearner();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const out: Learner = {
    v: 1,
    n: Number(raw.n) > 0 ? Math.floor(Number(raw.n)) : 0,
    modes: raw.modes && typeof raw.modes === 'object' ? raw.modes : {},
    hours: Array.isArray(raw.hours) && raw.hours.length === 24 ? raw.hours : base.hours,
    groups: raw.groups && typeof raw.groups === 'object' ? raw.groups : {},
    w: raw.w && typeof raw.w === 'object' ? raw.w : {},
    days: raw.days && typeof raw.days === 'object' ? raw.days : {}
  };
  return out;
}

function dayKey(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

export function recordAnswer(
  l: Learner,
  a: { hanzi: string; group: string; mode: StudyMode; ok: boolean; ms?: number; now?: Date }
) {
  const now = a.now || new Date();
  l.n += 1;
  const m = (l.modes[a.mode] ||= [0, 0, 0, 0]);
  m[0] += 1;
  if (a.ok) m[1] += 1;
  if (a.ms && a.ms > 0) { m[2] += Math.min(a.ms, 60000); m[3] += 1; }
  const hr = (l.hours[now.getHours()] ||= [0, 0]);
  hr[0] += 1;
  if (a.ok) hr[1] += 1;
  if (a.group) {
    const g = (l.groups[a.group] ||= [0, 0]);
    g[0] += 1;
    if (a.ok) g[1] += 1;
  }
  const idx = (EXAM_MODES as readonly string[]).indexOf(a.mode);
  if (idx >= 0) {
    const w = (l.w[a.hanzi] ||= [0, 0, 0, 0, 0, 0, -1]);
    w[idx * 2] += 1;
    if (a.ok) w[idx * 2 + 1] += 1;
    w[6] = idx;
  }
  const k = dayKey(now);
  l.days[k] = (l.days[k] || 0) + 1;
  const keys = Object.keys(l.days).sort();
  while (keys.length > 30) delete l.days[keys.shift() as string];
}

const smooth = (n: number, ok: number, prior = 0.7, weight = 2) => (ok + prior * weight) / (n + weight);

function modeAcc(l: Learner, mode: string) {
  const m = l.modes[mode];
  return m ? smooth(m[0], m[1]) : 0.7;
}

/**
 * Chọn chế độ cho lần ôn tiếp theo của một từ.
 * Ưu tiên chế độ bạn còn yếu với CHÍNH từ đó (nếu chưa đủ dữ liệu thì dùng mức yếu chung của chế độ),
 * luôn giảm khả năng lặp lại đúng cách vừa dùng, và thỉnh thoảng thử cách chưa dùng.
 */
export function pickMode(l: Learner, hanzi: string, rng: () => number, avoid?: string): ExamMode {
  const w = l.w[hanzi];
  const weights = EXAM_MODES.map((mode, i) => {
    const wn = w ? w[i * 2] : 0;
    const wok = w ? w[i * 2 + 1] : 0;
    const accWord = wn >= 1 ? smooth(wn, wok, modeAcc(l, mode), 2) : modeAcc(l, mode);
    let weight = 0.35 + (1 - accWord) * 1.6;
    if (wn === 0) weight += 0.35;
    if (w && w[6] === i) weight *= 0.35;
    if (avoid === mode) weight *= 0.1;
    return Math.max(weight, 0.03);
  });
  const total = weights.reduce((x, y) => x + y, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return EXAM_MODES[i];
  }
  return EXAM_MODES[0];
}

export type Insight = { id: string; text: string; apply?: { group?: string; size?: number; remindTime?: string; label: string } };

const MODE_NAME: Record<string, string> = {
  han2vi: 'nhìn chữ Hán đoán nghĩa',
  vi2han: 'nhìn nghĩa nhớ chữ Hán',
  pick: 'chọn đáp án đúng trong 4 lựa chọn'
};

const BUCKETS: [string, number, number][] = [
  ['sáng (5–11h)', 5, 11],
  ['trưa – chiều (11–17h)', 11, 17],
  ['tối (17–22h)', 17, 22],
  ['khuya (22–5h)', 22, 29]
];

function bucketOf(hour: number) {
  const h = hour < 5 ? hour + 24 : hour;
  return BUCKETS.findIndex(b => h >= b[1] && h < b[2]);
}

export function insights(l: Learner): Insight[] {
  const out: Insight[] = [];
  if (l.n < MIN_EVENTS) return out;

  // 1. Chế độ nào hợp với bạn nhất / yếu nhất
  const rated = EXAM_MODES.map(m => ({ m, d: l.modes[m] })).filter(x => x.d && x.d[0] >= 8);
  if (rated.length >= 2) {
    const sorted = rated.map(x => ({ m: x.m, a: x.d![1] / x.d![0], n: x.d![0] })).sort((p, q) => q.a - p.a);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (best.a - worst.a >= 0.12) {
      out.push({
        id: 'mode',
        text:
          'Bạn nhớ tốt nhất khi ' + MODE_NAME[best.m] + ' (' + Math.round(best.a * 100) + '%), còn yếu ở cách ' +
          MODE_NAME[worst.m] + ' (' + Math.round(worst.a * 100) + '%). App sẽ cho cách yếu xuất hiện nhiều hơn, nhưng luôn đổi cách giữa các lần gặp lại một từ.'
      });
    }
  }

  // 2. Khung giờ nhớ tốt nhất
  const agg = BUCKETS.map(() => [0, 0] as Pair);
  l.hours.forEach((p, h) => { const b = bucketOf(h); if (b >= 0 && p) { agg[b][0] += p[0]; agg[b][1] += p[1]; } });
  const goodBuckets = agg.map((p, i) => ({ i, n: p[0], a: p[0] ? p[1] / p[0] : 0 })).filter(x => x.n >= 12);
  if (goodBuckets.length >= 2) {
    goodBuckets.sort((p, q) => q.a - p.a);
    const best = goodBuckets[0];
    const worst = goodBuckets[goodBuckets.length - 1];
    if (best.a - worst.a >= 0.1) {
      const mid = Math.floor((BUCKETS[best.i][1] + Math.min(BUCKETS[best.i][2], 29)) / 2) % 24;
      const hhmm = String(mid).padStart(2, '0') + ':00';
      out.push({
        id: 'time',
        text: 'Bạn nhớ chắc nhất vào buổi ' + BUCKETS[best.i][0] + ' (' + Math.round(best.a * 100) + '% đúng, so với ' + Math.round(worst.a * 100) + '% ở buổi ' + BUCKETS[worst.i < 0 ? 0 : worst.i][0] + '). Nên đặt giờ nhắc học vào khung này.',
        apply: { remindTime: hhmm, label: 'Đặt nhắc lúc ' + hhmm }
      });
    }
  }

  // 3. Chủ đề yếu nhất
  const weakG = Object.entries(l.groups)
    .filter(([, p]) => p[0] >= 8)
    .map(([g, p]) => ({ g, a: p[1] / p[0], n: p[0] }))
    .filter(x => x.a < 0.7)
    .sort((x, y) => x.a - y.a)[0];
  if (weakG) {
    out.push({
      id: 'group',
      text: 'Chủ đề bạn hay sai nhất: ' + weakG.g + ' (' + Math.round(weakG.a * 100) + '% đúng sau ' + weakG.n + ' lần). Nên ôn riêng chủ đề này trước.',
      apply: { group: weakG.g, label: 'Ôn riêng chủ đề này' }
    });
  }

  // 4. Tốc độ trả lời → độ dài lượt ôn
  const timed = Object.values(l.modes).reduce((s, m) => s + (m[3] || 0), 0);
  const totalMs = Object.values(l.modes).reduce((s, m) => s + (m[2] || 0), 0);
  const accAll = (() => { let n = 0, ok = 0; for (const m of Object.values(l.modes)) { n += m[0]; ok += m[1]; } return n ? ok / n : 0; })();
  if (timed >= 10) {
    const sec = totalMs / timed / 1000;
    const size = accAll < 0.6 ? 10 : accAll >= 0.85 ? 30 : 20;
    out.push({
      id: 'size',
      text: 'Trung bình ' + sec.toFixed(1) + ' giây mỗi thẻ, đúng ' + Math.round(accAll * 100) + '%. ' +
        (size === 10 ? 'Đang sai khá nhiều — nên học lượt ngắn 10 thẻ để nhớ chắc.' : size === 30 ? 'Đang nhớ tốt — có thể tăng lên 30 thẻ mỗi lượt.' : 'Lượt 20 thẻ là vừa sức.'),
      apply: { size, label: 'Dùng ' + size + ' thẻ/lượt' }
    });
  }

  // 5. Đều đặn
  const last7 = Object.keys(l.days).filter(k => {
    const t = new Date(k + 'T00:00:00').getTime();
    return Date.now() - t < 7 * 86400000;
  }).length;
  out.push({ id: 'streak', text: 'Bạn đã học ' + last7 + '/7 ngày gần đây' + (last7 < 4 ? ' — học ít mà đều mỗi ngày sẽ nhớ lâu hơn học dồn.' : '.') });
  return out;
}

export function learnerSummary(l: Learner) {
  const parts = EXAM_MODES.map(m => {
    const d = l.modes[m];
    return { m, name: MODE_NAME[m], n: d ? d[0] : 0, a: d && d[0] ? Math.round((d[1] / d[0]) * 100) : null };
  });
  return { n: l.n, parts };
}
