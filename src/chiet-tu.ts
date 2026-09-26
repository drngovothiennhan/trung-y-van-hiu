import { IDS_DATA } from './ids-data.ts';

let selectedHanzi = '脾';
let searchQuery = '';

const BINARY_IDC = new Set(['⿰','⿱','⿴','⿵','⿶','⿷','⿸','⿹','⿺','⿻']);
const TERNARY_IDC = new Set(['⿲','⿳']);
const IDC_LABEL: Record<string, string> = {
  '⿰': 'Trái + phải', '⿱': 'Trên + dưới', '⿲': 'Ba phần trái → phải', '⿳': 'Ba tầng trên → dưới',
  '⿴': 'Bao quanh', '⿵': 'Bao từ phía trên', '⿶': 'Bao từ phía dưới', '⿷': 'Bao từ bên trái',
  '⿸': 'Bao góc trên trái', '⿹': 'Bao góc trên phải', '⿺': 'Bao góc dưới trái', '⿻': 'Nét giao / chồng',
};
const DISPLAY_ALIASES: Record<string, string> = { '𠤎': '匕' };

const CHARACTER_GUIDES: Record<string, { hanviet: string; pinyin: string; note: string }> = {
  '脾': { hanviet: 'Tỳ', pinyin: 'pí', note: '月 ở bên trái là dạng bộ Nhục, gợi liên hệ cơ thể; 卑 ở bên phải giúp nhận diện chữ. Trong YHCT, Tỳ là một hệ công năng liên hệ vận hóa, không đồng nhất hoàn toàn với lá lách giải phẫu.' },
  '腹': { hanviet: 'Phúc', pinyin: 'fù', note: '月 (dạng Nhục) ở bên trái + 复 ở bên phải. 腹 nghĩa là bụng, vùng bụng của cơ thể.' },
  '背': { hanviet: 'Bối', pinyin: 'bèi', note: '北 ở trên + 月 ở dưới. 背 đọc bèi trong nghĩa “lưng”, chỉ mặt sau của thân thể.' },
  '病': { hanviet: 'Bệnh', pinyin: 'bìng', note: '疒 ở ngoài + 丙 ở trong. Bộ 疒 gợi nhóm nghĩa bệnh tật; 病 là bệnh, ốm đau.' },
  '化': { hanviet: 'Hóa', pinyin: 'huà', note: '亻 ở bên trái + 匕 ở bên phải. Gắn chữ với nghĩa biến đổi, chuyển hóa; đây là gợi nhớ theo hình thể, không phải giải thích từ nguyên.' },
};

type IdsNode = { char: string; op?: string; children?: IdsNode[]; deeper?: boolean };
type Term = { hanzi: string; pinyin: string; hv: string; meaning: string; group: string };
type Radical = { hanzi: string; pinyin: string; hv: string; meaning: string };

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[char] || char));
}

function parseExpression(expression: string): IdsNode | null {
  const chars = Array.from(expression);
  let position = 0;
  function parseOne(): IdsNode | null {
    const char = chars[position++];
    if (!char) return null;
    const arity = BINARY_IDC.has(char) ? 2 : TERNARY_IDC.has(char) ? 3 : 0;
    if (!arity) return { char };
    const children: IdsNode[] = [];
    for (let index = 0; index < arity; index++) {
      const child = parseOne();
      if (!child) return null;
      children.push(child);
    }
    return { char, op: IDC_LABEL[char] || 'Cấu trúc', children };
  }
  const root = parseOne();
  return root && position === chars.length ? root : null;
}

function expandCharacter(char: string, depth = 0, ancestry = new Set<string>()): IdsNode {
  const expression = IDS_DATA[char];
  if (!expression || expression === char || ancestry.has(char)) return { char };
  const parsed = parseExpression(expression);
  if (!parsed || !parsed.children) return { char };
  const nextAncestry = new Set(ancestry).add(char);
  return {
    char, op: parsed.op, deeper: depth < 5,
    children: parsed.children.map(part => depth < 5 ? expandCharacter(part.char, depth + 1, nextAncestry) : part),
  };
}

function displayChar(char: string) {
  return DISPLAY_ALIASES[char] || char;
}

function radicalIndex(radicals: Radical[]) {
  return new Map(radicals.map(radical => [radical.hanzi, radical]));
}

function componentGloss(char: string, index: Map<string, Radical>) {
  const visibleChar = displayChar(char);
  const entry = index.get(char) || index.get(visibleChar);
  if (char === '月') return 'Dạng 月; trong chữ chỉ bộ phận cơ thể, thường là dạng của 肉 (Nhục).';
  if (char === '⺼') return 'Dạng bộ Nhục, gợi liên hệ với cơ thể.';
  if (entry) return entry.hv + ' · ' + entry.meaning;
  return 'Thành phần hình thể; xem cấu trúc để nhận mặt chữ.';
}

function treeSearchChars(char: string, depth = 0, visited = new Set<string>()): string[] {
  if (depth > 5 || visited.has(char)) return [char];
  const expression = IDS_DATA[char];
  if (!expression || expression === char) return [char];
  const parsed = parseExpression(expression);
  if (!parsed?.children) return [char];
  const next = new Set(visited).add(char);
  return [char, ...parsed.children.flatMap(child => treeSearchChars(child.char, depth + 1, next))];
}

function renderNestedPart(node: IdsNode, index: Map<string, Radical>): string {
  const visible = displayChar(node.char);
  const details = node.children?.length && node.op
    ? '<details class="chiet-subtree"><summary><span>Mở cấu tạo của ' + escapeHtml(visible) + '</span><small>' + escapeHtml(node.op) + '</small></summary><div class="chiet-subparts">' + node.children.map(child => renderNestedPart(child, index)).join('') + '</div></details>'
    : '';
  return '<div class="chiet-component"><div class="chiet-component-label"><b>' + escapeHtml(visible) + '</b><span>' + escapeHtml(componentGloss(node.char, index)) + '</span></div>' + details + '</div>';
}

function renderCharacter(char: string, position: number, index: Map<string, Radical>): string {
  const guide = CHARACTER_GUIDES[char];
  const tree = expandCharacter(char);
  const display = displayChar(char);
  const breakdown = tree.children?.length && tree.op
    ? '<div class="chiet-structure-label"><span>Cấu trúc hình thể</span><b>' + escapeHtml(tree.op) + '</b></div><div class="chiet-top-parts">' + tree.children.map(part => renderNestedPart(part, index)).join('') + '</div>'
    : '<p class="chiet-no-ids">Chưa có cấu trúc tách cấp đầu trong bộ dữ liệu cho chữ này.</p>';
  return '<article class="chiet-character"><header><span>Chữ ' + position + '</span><b>' + escapeHtml(display) + '</b>' + (guide ? '<strong>' + escapeHtml(guide.hanviet) + ' · ' + escapeHtml(guide.pinyin) + '</strong>' : '') + '</header>' + breakdown +
    (guide ? '<p class="chiet-character-guide">' + escapeHtml(guide.note) + '</p>' : '') + '</article>';
}

function termDetail(term: Term, radicals: Radical[]) {
  const index = radicalIndex(radicals);
  const chars = Array.from(term.hanzi || '');
  const hanChars = chars.filter(char => /\p{Script=Han}/u.test(char));
  const characterViews = chars.map((char, offset) => /\p{Script=Han}/u.test(char)
    ? renderCharacter(char, offset + 1, index)
    : '<article class="chiet-character chiet-character-symbol"><header><span>Ký hiệu</span><b>' + escapeHtml(char) + '</b></header><p>Dấu câu hoặc ký hiệu trong mục từ, không phải chữ Hán để chiết tự.</p></article>').join('');
  return '<section class="chiet-selected"><header class="chiet-selected-head"><div><span>' + escapeHtml(term.group || 'TỪ VỰNG') + '</span><h2>' + escapeHtml(term.hanzi) + '</h2><p>' + escapeHtml(term.pinyin) + ' · ' + escapeHtml(term.hv) + '</p></div><span class="chiet-char-count">' + hanChars.length + ' chữ Hán</span></header>' +
    '<p class="chiet-term-meaning"><b>Nghĩa trong kho từ vựng</b>' + escapeHtml(term.meaning) + '</p>' +
    '<div class="chiet-character-list">' + characterViews + '</div>' +
    '<details class="chiet-term-recall"><summary>Tự nhắc lại nghĩa rồi mở để kiểm tra</summary><p><b>' + escapeHtml(term.hanzi) + '</b> · ' + escapeHtml(term.hv) + ' · ' + escapeHtml(term.pinyin) + '<br>' + escapeHtml(term.meaning) + '</p></details></section>';
}

function termSearchText(term: Term) {
  const components = Array.from(term.hanzi || '').filter(char => /\p{Script=Han}/u.test(char)).flatMap(char => treeSearchChars(char));
  return [term.hanzi, term.pinyin, term.hv, term.meaning, term.group, ...components].join(' ').toLocaleLowerCase();
}

function termListMarkup(terms: Term[]) {
  return terms.map((term, termIndex) => '<button type="button" class="chiet-term-option' + (term.hanzi === selectedHanzi ? ' active' : '') + '" data-chiet-index="' + termIndex + '" data-search="' + escapeHtml(termSearchText(term)) + '"><b>' + escapeHtml(term.hanzi) + '</b><span><strong>' + escapeHtml(term.hv) + '</strong><small>' + escapeHtml(term.pinyin) + '</small></span></button>').join('');
}

export function chietTuView(terms: Term[], radicals: Radical[]) {
  const selected = terms.find(term => term.hanzi === selectedHanzi) || terms.find(term => term.hanzi === '脾') || terms[0];
  if (selected) selectedHanzi = selected.hanzi;
  const allCharacters = new Set(terms.flatMap(term => Array.from(term.hanzi || '').filter(char => /\p{Script=Han}/u.test(char))));
  return '<header class="page-head chiet-page-head"><span>NHẬN MẶT CHỮ · 中医词汇</span><h1>Chiết Tự YHCT</h1><p>Tra cấu tạo từng chữ trong kho từ vựng hiện tại. Chọn một từ để xem bố cục, mở các thành phần để tách sâu hơn, rồi tự nhắc lại nghĩa.</p></header>' +
    '<div class="chiet-workbench"><aside class="chiet-vocabulary"><label for="chietSearch">Tìm từ, pinyin, nghĩa hoặc thành phần</label><input id="chietSearch" type="search" value="' + escapeHtml(searchQuery) + '" placeholder="Ví dụ: Tỳ, 病, 月, vận hóa" autocomplete="off"><div class="chiet-list-meta"><span id="chietCount" aria-live="polite">' + terms.length + ' / ' + terms.length + ' mục từ</span><small>' + allCharacters.size + ' chữ Hán</small></div><div class="chiet-term-list" id="chietTermList">' + termListMarkup(terms) + '</div></aside>' +
    '<div id="chietDetail">' + (selected ? termDetail(selected, radicals) : '<p class="chiet-no-ids">Chưa có từ vựng để hiển thị.</p>') + '</div></div>' +
    '<p class="chiet-footnote">Cấu trúc được dựng từ IDS (Ideographic Description Sequences). Cách tách có thể khác theo dạng chữ/khu vực và mô tả hình thể, không khẳng định nguồn gốc lịch sử. Mẹo nhớ cần đối chiếu với nghĩa của cả thuật ngữ. <a href="https://github.com/cjkvi/cjkvi-ids/blob/master/ids.txt" target="_blank" rel="noreferrer">Nguồn cấu trúc chữ</a>.</p>';
}

export function bindChietTu(root: ParentNode, terms: Term[], radicals: Radical[]) {
  const search = root.querySelector<HTMLInputElement>('#chietSearch');
  const list = root.querySelector<HTMLElement>('#chietTermList');
  const count = root.querySelector<HTMLElement>('#chietCount');
  const detail = root.querySelector<HTMLElement>('#chietDetail');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-chiet-index]')];
  const filter = (query: string) => {
    const normalized = query.trim().toLocaleLowerCase();
    searchQuery = query;
    let visible = 0;
    buttons.forEach(button => {
      const matches = !normalized || (button.dataset.search || '').includes(normalized);
      button.hidden = !matches;
      if (matches) visible++;
    });
    if (count) count.textContent = visible + ' / ' + terms.length + ' mục từ';
  };
  if (search && searchQuery) filter(searchQuery);
  search?.addEventListener('input', () => filter(search.value));
  buttons.forEach(button => button.addEventListener('click', () => {
    const term = terms[Number(button.dataset.chietIndex)];
    if (!term || !detail) return;
    selectedHanzi = term.hanzi;
    buttons.forEach(item => item.classList.toggle('active', item === button));
    detail.innerHTML = termDetail(term, radicals);
    detail.querySelector('.chiet-selected-head')?.scrollIntoView({ block: 'nearest' });
  }));
}
