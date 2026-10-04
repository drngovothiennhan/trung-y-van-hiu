// Exam-prep helpers for Trung Y Văn HIU:
// - smartOptions: distractors that look/sound/belong close to the target word
// - exam config (exam date, topic filter, deck size) kept on this device only
// - buildExamDeck: picks the words most worth reviewing first
// - examIntervalCap: compresses the spaced-review schedule when an exam date is set

export type Term = { hanzi: string; pinyin: string; hv: string; meaning: string; group: string };

const HAN = /\p{Script=Han}/u;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function seededRandom(seed: number) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rng: () => number) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hanChars(text: string) {
  return new Set(Array.from(text || '').filter(char => HAN.test(char)));
}

function syllables(text: string) {
  return String(text || '').toLowerCase().split(/[\s·,;()/]+/).filter(Boolean);
}

function similarity(target: Term, candidate: Term, weak: Set<string>) {
  let score = 0;
  const a = hanChars(target.hanzi);
  for (const char of hanChars(candidate.hanzi)) if (a.has(char)) score += 4;
  if (target.group && target.group === candidate.group) score += 3;
  if (Array.from(target.hanzi).length === Array.from(candidate.hanzi).length) score += 1;
  const hv = new Set(syllables(target.hv));
  for (const part of syllables(candidate.hv)) if (hv.has(part)) { score += 2; break; }
  if (syllables(target.pinyin)[0] && syllables(target.pinyin)[0] === syllables(candidate.pinyin)[0]) score += 1;
  if (weak.has(candidate.hanzi)) score += 1;
  return score;
}

/**
 * Four shuffled options (the answer + 3 distractors).
 * Distractors come from the closest-looking / closest-topic words, so the learner
 * must recognise the exact word instead of eliminating obviously unrelated ones.
 * Deterministic for a given seed so a re-render does not reshuffle the options.
 */
export function smartOptions(
  terms: Term[],
  index: number,
  mapper: (term: Term) => string,
  options: { seed: number; weak?: Set<string> },
) {
  const rng = seededRandom(options.seed);
  const weak = options.weak || new Set<string>();
  const target = terms[index];
  const answer = mapper(target);

  const scored: { value: string; score: number }[] = [];
  for (let j = 0; j < terms.length; j++) {
    if (j === index) continue;
    const value = mapper(terms[j]);
    if (!value || value === answer) continue;
    scored.push({ value, score: similarity(target, terms[j], weak) + rng() * 2 });
  }
  scored.sort((x, y) => y.score - x.score);

  const pool: string[] = [];
  for (const item of scored) {
    if (!pool.includes(item.value)) pool.push(item.value);
    if (pool.length >= 8) break;
  }
  const picked = shuffled(pool, rng).slice(0, 3);
  return shuffled([answer, ...picked], rng);
}

// ---------- exam config ----------

export type ExamConfig = { date: string; group: string; size: number; remindTime: string; notify: boolean };

const EXAM_KEY = 'trung-y-van-hiu-exam-v1';
const DEFAULT_CONFIG: ExamConfig = { date: '', group: 'all', size: 20, remindTime: '19:00', notify: false };

export function loadExamConfig(): ExamConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(EXAM_KEY) || '{}');
    const size = [10, 20, 30, 50].includes(Number(raw.size)) ? Number(raw.size) : DEFAULT_CONFIG.size;
    return {
      date: typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : '',
      group: typeof raw.group === 'string' && raw.group ? raw.group : 'all',
      size,
      remindTime: typeof raw.remindTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.remindTime) ? raw.remindTime : DEFAULT_CONFIG.remindTime,
      notify: raw.notify === true,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveExamConfig(config: ExamConfig) {
  try { localStorage.setItem(EXAM_KEY, JSON.stringify(config)); } catch { /* storage unavailable */ }
}

/** Whole days left until the end of the exam day (local time); null when unset or already past. */
export function daysUntil(date: string, now = Date.now()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
  const [y, m, d] = date.split('-').map(Number);
  const end = new Date(y, m - 1, d, 23, 59, 59).getTime();
  if (Number.isNaN(end) || end < now) return null;
  return Math.max(0, Math.ceil((end - now) / DAY) - 1);
}

/** Longest allowed gap between two reviews so every word is seen several times before the exam. */
export function examIntervalCap(daysLeft: number | null): number | null {
  if (daysLeft === null) return null;
  return Math.max(6 * HOUR, (daysLeft * DAY) / 3);
}

// ---------- deck builder ----------

export type ExamContext = {
  stage: (hanzi: string) => number;
  meta: (hanzi: string) => { level: number; lapses: number; due: number } | undefined;
  difficult: string[];
  priority?: (hanzi: string) => number;
  now: number;
};

export type ExamCard = { hanzi: string; dir: 'han2vi' | 'vi2han'; again?: boolean };

export function buildExamDeck(terms: Term[], config: ExamConfig, context: ExamContext, rng: () => number): ExamCard[] {
  const hard = new Set(context.difficult);
  const pool = terms.filter(term => config.group === 'all' || term.group === config.group);
  const ranked = pool
    .map(term => {
      const stage = context.stage(term.hanzi);
      const meta = context.meta(term.hanzi);
      let score = rng() * 8;
      if (hard.has(term.hanzi)) score += 100;
      if (meta?.lapses) score += Math.min(meta.lapses, 5) * 10;
      if (meta && meta.due > 0 && meta.due <= context.now) score += 60;
      if (stage < 4) score += 40 - stage * 5;
      if (meta) score -= meta.level * 3;
      if (context.priority && stage < 4) score += context.priority(term.hanzi);
      return { term, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, config.size)
    .map(item => item.term);

  const order = shuffled(ranked, rng);
  const first = rng() < 0.5 ? 'han2vi' : 'vi2han';
  return order.map((term, i) => ({
    hanzi: term.hanzi,
    dir: (i % 2 === 0 ? first : first === 'han2vi' ? 'vi2han' : 'han2vi') as ExamCard['dir'],
  }));
}

// ---------- study plan from the exam date ----------

export type StudyPlan = {
  days: number;
  unlearned: number;
  learnDays: number;
  reviewDays: number;
  newPerDay: number;
  heavy: boolean;
};

/**
 * Splits the days left into learning days and a final review stretch.
 * `unlearned` is the number of words still below "remembered" in the chosen scope
 * at the start of today, so the daily goal stays stable while the learner works.
 */
export function computePlan(days: number, unlearned: number): StudyPlan {
  const available = Math.max(1, days);
  const reviewDays = days >= 10 ? Math.max(3, Math.round(days * 0.25)) : days >= 4 ? 2 : days >= 1 ? 1 : 0;
  const learnDays = Math.max(1, available - reviewDays);
  const inReviewStretch = days <= reviewDays;
  const newPerDay = unlearned <= 0 || inReviewStretch ? 0 : Math.ceil(unlearned / learnDays);
  return { days, unlearned, learnDays, reviewDays, newPerDay, heavy: newPerDay > 40 };
}

// ---------- what was done today (this device) ----------

export type DailyLog = { date: string; added: number; reviewed: number };
const DAILY_KEY = 'trung-y-van-hiu-exam-daily-v1';

export function todayStr(now = new Date()) {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + m + '-' + d;
}

export function loadDaily(now = new Date()): DailyLog {
  const today = todayStr(now);
  try {
    const raw = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    if (raw && raw.date === today) return { date: today, added: Number(raw.added) || 0, reviewed: Number(raw.reviewed) || 0 };
  } catch { /* fall through */ }
  return { date: today, added: 0, reviewed: 0 };
}

export function bumpDaily(kind: 'added' | 'reviewed', now = new Date()) {
  const log = loadDaily(now);
  log[kind] += 1;
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(log)); } catch { /* storage unavailable */ }
}

// ---------- reminder: calendar file ----------

function icsStamp(date: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return date.getFullYear() + p(date.getMonth() + 1) + p(date.getDate()) + 'T' + p(date.getHours()) + p(date.getMinutes()) + '00';
}

/**
 * Daily repeating calendar event (floating local time) from today/tomorrow until the exam day.
 * Works with any phone calendar, so the reminder fires even when the app is closed.
 */
export function buildReminderIcs(examDate: string, remindTime: string, link: string, now = new Date()) {
  const [hh, mm] = remindTime.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  const [y, m, d] = examDate.split('-').map(Number);
  const until = new Date(y, m - 1, d, 23, 59, 0);
  const end = new Date(start.getTime() + 20 * 60 * 1000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HIU TMC//Trung Y Van//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:trung-y-van-on-thi-' + examDate + '@hiutmc.com',
    'DTSTAMP:' + icsStamp(now),
    'DTSTART:' + icsStamp(start),
    'DTEND:' + icsStamp(end),
    'RRULE:FREQ=DAILY;UNTIL=' + icsStamp(until),
    'SUMMARY:Ôn từ vựng Trung Y Văn',
    'DESCRIPTION:Học từ mới và ôn từ đến hạn cho kỳ thi cuối kỳ. Mở: ' + link,
    'URL:' + link,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Ôn từ vựng Trung Y Văn',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
