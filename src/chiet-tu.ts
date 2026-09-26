const entries = [
  {
    hanzi: '脾', hanviet: 'Tỳ', pinyin: 'pí', category: 'Tạng phủ',
    parts: [
      { hanzi: '月', title: 'Nhục', detail: 'Bộ phận chữ 肉 biến thể; thường gợi nhóm nghĩa về thân thể.' },
      { hanzi: '卑', title: 'Bēi', detail: 'Phần bên phải của chữ. Dùng để nhận mặt chữ; không suy nghĩa “thấp” thành chức năng của Tỳ.' },
    ],
    layout: 'Trái + phải',
    meaning: 'Tỳ trong hệ thống khái niệm YHCT, liên hệ vận hóa thức ăn và sinh hóa khí huyết.',
    mnemonic: 'Nhìn 月 bên trái để nhận nhóm chữ cơ thể; chốt mặt chữ bằng 卑 ở bên phải.',
    note: 'Tỳ trong YHCT là một hệ công năng, không đồng nhất hoàn toàn với lá lách theo giải phẫu hiện đại.',
    search: 'la lach tiêu hóa vận hóa khi huyết',
  },
  {
    hanzi: '腹', hanviet: 'Phúc', pinyin: 'fù', category: 'Cơ thể',
    parts: [
      { hanzi: '月', title: 'Nhục', detail: 'Bộ phận chữ 肉 biến thể, gợi liên hệ với cơ thể.' },
      { hanzi: '复', title: 'Phục', detail: 'Phần bên phải; có thể dùng hình chữ để gợi nhớ, không lấy nghĩa “trở lại” làm nghĩa của 腹.' },
    ],
    layout: 'Trái + phải',
    meaning: 'Bụng; vùng thân thể nằm giữa ngực và khung chậu.',
    mnemonic: 'Thấy 月 bên trái thì liên hệ cơ thể; ghép với 复 để nhận ra trọn chữ 腹.',
    note: '',
    search: 'bụng vùng bụng',
  },
  {
    hanzi: '背', hanviet: 'Bối', pinyin: 'bèi', category: 'Cơ thể',
    parts: [
      { hanzi: '北', title: 'Bắc', detail: 'Phần ở phía trên trong cách tách hình thể này.' },
      { hanzi: '月', title: 'Nhục', detail: 'Phần ở dưới; trong chữ chỉ bộ phận thân thể.' },
    ],
    layout: 'Trên + dưới',
    meaning: 'Lưng; mặt sau của thân thể. Chữ này cũng có âm đọc khác theo ngữ cảnh.',
    mnemonic: 'Nhớ bố cục xếp tầng: 北 ở trên, 月 ở dưới; khi nói “lưng”, đọc bèi.',
    note: '',
    search: 'lưng mặt sau thân thể',
  },
  {
    hanzi: '病', hanviet: 'Bệnh', pinyin: 'bìng', category: 'Bệnh chứng',
    parts: [
      { hanzi: '疒', title: 'Nạch', detail: 'Bộ bệnh, bao ở phía ngoài và gợi nhóm nghĩa bệnh tật.' },
      { hanzi: '丙', title: 'Bính', detail: 'Phần bên trong; giúp nhận diện hình chữ 病.' },
    ],
    layout: 'Bao ngoài + bên trong',
    meaning: 'Bệnh, ốm đau; trạng thái sức khỏe không bình thường.',
    mnemonic: 'Khung 疒 ôm lấy 丙: thấy bộ 疒 thì liên hệ ngay đến nhóm chữ về bệnh.',
    note: '',
    search: 'ốm đau bệnh tật không khỏe',
  },
  {
    hanzi: '化', hanviet: 'Hóa', pinyin: 'huà', category: 'Lý luận YHCT',
    parts: [
      { hanzi: '亻', title: 'Nhân đứng', detail: 'Dạng đứng của 人, nằm ở bên trái.' },
      { hanzi: '匕', title: 'Tỉ', detail: 'Phần bên phải; dùng hình thể để nhận diện, không xem đây là giải thích từ nguyên.' },
    ],
    layout: 'Trái + phải',
    meaning: 'Biến đổi, chuyển hóa từ trạng thái hoặc dạng này sang dạng khác.',
    mnemonic: 'Nhớ hai phần 人 đứng cạnh 匕; khi gặp 化 trong thuật ngữ, liên hệ với ý biến đổi.',
    note: '',
    search: 'biến đổi chuyển hóa',
  },
];

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[char] || char));
}

function card(entry: typeof entries[number]) {
  return '<article class="chiet-card" data-chiet-card data-search="' + escapeHtml([entry.hanzi, entry.hanviet, entry.pinyin, entry.category, entry.search, ...entry.parts.flatMap(part => [part.hanzi, part.title, part.detail])].join(' ').toLocaleLowerCase()) + '">' +
    '<header class="chiet-card-head"><div><span>' + escapeHtml(entry.category) + '</span><h2>' + escapeHtml(entry.hanzi) + '<small>' + escapeHtml(entry.hanviet) + ' · ' + escapeHtml(entry.pinyin) + '</small></h2></div><span class="chiet-layout-label">' + escapeHtml(entry.layout) + '</span></header>' +
    '<div class="chiet-parts" aria-label="Các phần tạo hình chữ ' + escapeHtml(entry.hanzi) + '">' + entry.parts.map((part, index) => '<div class="chiet-part"><b>' + escapeHtml(part.hanzi) + '</b><strong>' + escapeHtml(part.title) + '</strong><small>' + escapeHtml(index === 0 ? 'phần 1' : 'phần 2') + '</small></div>').join('<span class="chiet-join" aria-hidden="true">' + (entry.layout === 'Trái + phải' ? '+' : '↓') + '</span>') + '</div>' +
    '<div class="chiet-part-notes">' + entry.parts.map(part => '<p><b>' + escapeHtml(part.hanzi) + ' · ' + escapeHtml(part.title) + '</b><span>' + escapeHtml(part.detail) + '</span></p>').join('') + '</div>' +
    '<p class="chiet-meaning"><b>Ý nghĩa</b>' + escapeHtml(entry.meaning) + '</p>' +
    '<p class="chiet-mnemonic"><b>Mẹo nhớ</b>' + escapeHtml(entry.mnemonic) + '</p>' +
    (entry.note ? '<p class="chiet-note">' + escapeHtml(entry.note) + '</p>' : '') +
    '<details class="chiet-recall"><summary>Tự nhắc lại rồi mở đáp án</summary><p><b>' + escapeHtml(entry.hanzi) + '</b> · ' + escapeHtml(entry.hanviet) + ' · ' + escapeHtml(entry.pinyin) + '<br>' + escapeHtml(entry.meaning) + '</p></details>' +
    '</article>';
}

export function chietTuView() {
  return '<header class="page-head chiet-page-head"><span>NHẬN MẶT CHỮ · 中医词汇</span><h1>Chiết Tự YHCT</h1><p>Nhìn cấu tạo chữ, gọi tên từng phần, rồi gắn với nghĩa của thuật ngữ Trung y. Phần tách chữ giúp ghi nhớ hình thể; mẹo liên tưởng không thay cho từ nguyên.</p></header>' +
    '<section class="chiet-tools"><label for="chietSearch">Tìm chữ, âm Hán-Việt hoặc bộ phận</label><input id="chietSearch" type="search" placeholder="Ví dụ: Tỳ, bệnh, 月, chuyển hóa" autocomplete="off"><span id="chietCount" aria-live="polite">5 thuật ngữ</span></section>' +
    '<section class="chiet-grid" id="chietGrid">' + entries.map(card).join('') + '</section>' +
    '<p class="chiet-footnote">Ghi nhớ nhanh: nhận bố cục → gọi tên các phần → che đáp án và tự nhắc nghĩa → mở để kiểm tra.</p>';
}

export function bindChietTu(root: ParentNode) {
  const search = root.querySelector<HTMLInputElement>('#chietSearch');
  const cards = [...root.querySelectorAll<HTMLElement>('[data-chiet-card]')];
  const count = root.querySelector<HTMLElement>('#chietCount');
  search?.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach(item => {
      const matches = !query || item.dataset.search?.includes(query);
      item.hidden = !matches;
      if (matches) visible++;
    });
    if (count) count.textContent = visible + ' / ' + entries.length + ' thuật ngữ';
  });
}
