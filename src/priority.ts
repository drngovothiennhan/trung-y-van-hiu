// Ưu tiên học: từ nào xuất hiện ở NHIỀU SLIDE bài giảng và cũng có trong giáo trình thì học trước.
// Chỉ đổi thứ tự dữ liệu; không đổi cấu trúc ứng dụng.

export type PTerm = { hanzi: string; pinyin: string; hv: string; meaning: string; group: string };
export type SlideDoc = { id: string; label: string; text: string };
export type PInfo = { slides: number; slideIds: string[]; book: boolean; tier: 'A' | 'B' | 'C' };

/**
 * Tier A: có trong ≥2 slide, hoặc có trong 1 slide và cũng có trong giáo trình.
 * Tier B: chỉ có trong 1 slide hoặc chỉ có trong giáo trình bài chính (ngoài slide thì tier C).
 * Tier C: không thấy trong slide nào.
 */
export function analyzeTerms(terms: PTerm[], slides: SlideDoc[], bookText: string) {
  const info = new Map<string, PInfo>();
  for (const t of terms) {
    const ids = slides.filter(s => s.text.includes(t.hanzi)).map(s => s.id);
    const book = bookText.includes(t.hanzi);
    const n = ids.length;
    const tier: PInfo['tier'] = n >= 2 || (n >= 1 && book) ? 'A' : n >= 1 ? 'B' : 'C';
    info.set(t.hanzi, { slides: n, slideIds: ids, book, tier });
  }
  return info;
}

/** Sắp xếp ổn định: tier A trước (nhiều slide hơn trước), rồi B, rồi C; trong cùng mức giữ nguyên thứ tự gốc. */
export function rankTerms<T extends PTerm>(terms: T[], info: Map<string, PInfo>): T[] {
  const weight = (t: T) => {
    const i = info.get(t.hanzi);
    if (!i) return 0;
    const base = i.tier === 'A' ? 3000 : i.tier === 'B' ? 2000 : 1000;
    return base + Math.min(i.slides, 5) * 10 + (i.book ? 5 : 0);
  };
  return terms
    .map((t, idx) => ({ t, idx, w: weight(t) }))
    .sort((a, b) => b.w - a.w || a.idx - b.idx)
    .map(x => x.t);
}

export function priorityBoost(info: Map<string, PInfo>) {
  return (hanzi: string) => {
    const i = info.get(hanzi);
    return i ? (i.tier === 'A' ? 30 : i.tier === 'B' ? 12 : 0) + Math.min(i.slides, 5) * 3 : 0;
  };
}
