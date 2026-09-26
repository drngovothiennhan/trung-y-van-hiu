// Interactive handwriting practice for the vocabulary already present in the app.
// Practice completion is self-reported; this module does not claim handwriting or stroke-order recognition.
let selectedHanzi = '';
let searchQuery = '';
let showGuide = true;
let strokes = [];
let activeStroke = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[char]));
}

function storageKey(memberId) {
  return 'trung-y-van-hiu-writing-v1:' + encodeURIComponent(String(memberId || 'member'));
}

function readProgress(memberId) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(memberId)) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function writeProgress(memberId, progress) {
  try {
    localStorage.setItem(storageKey(memberId), JSON.stringify(progress));
  } catch {
    // Learning remains usable when browser storage is unavailable.
  }
}

function selectedTerm(terms) {
  return terms.find(term => term.hanzi === selectedHanzi)
    || terms.find(term => term.hanzi === '阴阳')
    || terms[0]
    || { hanzi: '阴阳', pinyin: 'yīnyáng', hv: 'Âm dương', meaning: 'Học thuyết âm dương', group: 'Âm dương' };
}

function visibleTerms(terms) {
  const query = searchQuery.trim().toLocaleLowerCase();
  if (!query) return terms;
  return terms.filter(term => [term.hanzi, term.pinyin, term.hv, term.meaning, term.group]
    .some(value => String(value || '').toLocaleLowerCase().includes(query)));
}

function termListMarkup(terms, progress, activeHanzi) {
  const list = visibleTerms(terms);
  if (!list.length) return '<p class="writing-empty">Không tìm thấy từ phù hợp.</p>';
  return list.map(term => {
    const done = progress[term.hanzi];
    return '<button type="button" class="writing-term' + (term.hanzi === activeHanzi ? ' active' : '') + '" data-writing-term="' + escapeHtml(term.hanzi) + '">' +
      '<span class="writing-term-hanzi">' + escapeHtml(term.hanzi) + '</span><span class="writing-term-copy"><b>' + escapeHtml(term.hv) + '</b><small>' + escapeHtml(term.pinyin) + '</small></span>' +
      (done ? '<i aria-label="Đã luyện">' + Number(done.count || 1) + '×</i>' : '') + '</button>';
  }).join('');
}

export function writingPracticeView(terms, memberId) {
  if (!selectedHanzi && terms.length) {
    selectedHanzi = terms.some(term => term.hanzi === '阴阳') ? '阴阳' : terms[0].hanzi;
  }
  const term = selectedTerm(terms);
  const progress = readProgress(memberId);
  const doneCount = Object.keys(progress).length;
  const totalWrites = Object.values(progress).reduce((sum, value) => sum + Number(value?.count || 0), 0);
  const chars = Array.from(term.hanzi || '');
  return '<header class="page-head"><span>LUYỆN TẬP · 手写</span><h1>Luyện viết từ vựng</h1><p>Chọn từ trong kho bài học, tô chữ mẫu rồi tự viết lại. Tiến độ viết được lưu riêng trên thiết bị và không thay đổi mức ghi nhớ từ vựng.</p></header>' +
    '<section class="stats writing-stats">' +
      '<article class="stat"><span>字</span><div><strong>' + doneCount + '</strong><small>Từ đã luyện</small></div></article>' +
      '<article class="stat"><span>✍</span><div><strong>' + totalWrites + '</strong><small>Lượt tự ghi nhận</small></div></article>' +
      '<article class="stat"><span>词</span><div><strong>' + terms.length + '</strong><small>Từ trong kho học</small></div></article>' +
    '</section>' +
    '<section class="writing-layout"><div class="panel writing-picker"><div class="writing-panel-head"><div><span class="writing-kicker">KHO TỪ VỰNG</span><h2>Chọn từ để viết</h2></div><span class="writing-count">' + terms.length + ' từ</span></div>' +
      '<label class="writing-search-label" for="writingSearch">Tìm theo chữ, pinyin hoặc nghĩa</label><input id="writingSearch" class="writing-search" type="search" value="' + escapeHtml(searchQuery) + '" placeholder="Ví dụ: âm dương, yīnyáng, 阴阳" autocomplete="off">' +
      '<div id="writingTermList" class="writing-term-list">' + termListMarkup(terms, progress, term.hanzi) + '</div></div>' +
      '<div class="panel writing-workspace"><div class="writing-panel-head"><div><span class="writing-kicker">' + escapeHtml(term.group || 'TỪ VỰNG') + '</span><h2>' + escapeHtml(term.hanzi) + '</h2></div><button type="button" class="speak" data-writing-speak="' + escapeHtml(term.hanzi) + '" aria-label="Nghe phát âm">🔊</button></div>' +
      '<p class="writing-pronunciation"><b>' + escapeHtml(term.pinyin) + '</b><span>' + escapeHtml(term.hv) + '</span></p><p class="writing-meaning">' + escapeHtml(term.meaning) + '</p>' +
      '<div class="writing-board-head"><strong>Viết từng chữ trong từ</strong><button type="button" class="writing-guide-toggle" id="writingGuideToggle">' + (showGuide ? 'Ẩn chữ mẫu' : 'Hiện chữ mẫu') + '</button></div>' +
      '<div class="writing-canvas-wrap"><canvas id="writingCanvas" width="900" height="240" role="img" aria-label="Bảng viết chữ Hán ' + escapeHtml(term.hanzi) + '"></canvas></div>' +
      '<div class="writing-tools"><button type="button" id="writingUndo">↶ Hoàn tác nét</button><button type="button" id="writingClear">Xóa bảng</button><button type="button" class="primary" id="writingComplete">Tôi đã luyện xong từ này</button></div>' +
      '<p class="writing-hint">Dùng chuột, bút cảm ứng hoặc ngón tay để viết. App ghi nhận lượt luyện do bạn tự xác nhận; hiện chưa tự chấm nét viết.</p></div></section>';
}

function drawBoard(canvas, term) {
  const context = canvas?.getContext('2d');
  if (!context) return;
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#fffef8';
  context.fillRect(0, 0, width, height);
  const chars = Array.from(term?.hanzi || '');
  const cellWidth = width / Math.max(1, chars.length);
  for (let index = 0; index < chars.length; index++) {
    const left = index * cellWidth;
    context.strokeStyle = '#d9e2db';
    context.lineWidth = 2;
    context.setLineDash([]);
    context.strokeRect(left + 1, 1, cellWidth - 2, height - 2);
    context.strokeStyle = '#e7ece7';
    context.lineWidth = 1;
    context.setLineDash([7, 7]);
    context.beginPath();
    context.moveTo(left + cellWidth / 2, 8);
    context.lineTo(left + cellWidth / 2, height - 8);
    context.moveTo(left + 8, height / 2);
    context.lineTo(left + cellWidth - 8, height / 2);
    context.stroke();
    context.setLineDash([]);
    if (showGuide) {
      const fontSize = Math.max(56, Math.min(148, cellWidth * 0.7, height * 0.72));
      context.fillStyle = '#d7dfd9';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = fontSize + 'px serif';
      context.fillText(chars[index], left + cellWidth / 2, height / 2 + 3);
    }
  }
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#1d594a';
  context.lineWidth = 7;
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    context.beginPath();
    context.moveTo(stroke[0].x, stroke[0].y);
    for (let index = 1; index < stroke.length; index++) context.lineTo(stroke[index].x, stroke[index].y);
    if (stroke.length === 1) context.lineTo(stroke[0].x + 0.1, stroke[0].y + 0.1);
    context.stroke();
  }
}

export function bindWritingPractice(root, terms, memberId, onChange) {
  const term = selectedTerm(terms);
  const progress = readProgress(memberId);
  const canvas = root.querySelector('#writingCanvas');
  const redraw = () => drawBoard(canvas, term);
  redraw();

  const search = root.querySelector('#writingSearch');
  const list = root.querySelector('#writingTermList');
  if (search && list) {
    search.addEventListener('input', event => {
      searchQuery = event.currentTarget.value;
      list.innerHTML = termListMarkup(terms, readProgress(memberId), term.hanzi);
      bindTermButtons();
    });
  }
  function bindTermButtons() {
    list?.querySelectorAll('[data-writing-term]').forEach(button => button.addEventListener('click', () => {
      selectedHanzi = button.dataset.writingTerm;
      strokes = [];
      activeStroke = null;
      onChange();
    }));
  }
  bindTermButtons();

  root.querySelector('[data-writing-speak]')?.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term.hanzi);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    speechSynthesis.speak(utterance);
  });

  root.querySelector('#writingGuideToggle')?.addEventListener('click', () => {
    showGuide = !showGuide;
    redraw();
    const button = root.querySelector('#writingGuideToggle');
    if (button) button.textContent = showGuide ? 'Ẩn chữ mẫu' : 'Hiện chữ mẫu';
  });

  root.querySelector('#writingClear')?.addEventListener('click', () => {
    strokes = [];
    activeStroke = null;
    redraw();
  });
  root.querySelector('#writingUndo')?.addEventListener('click', () => {
    if (activeStroke) activeStroke = null;
    else strokes.pop();
    redraw();
  });

  if (canvas) {
    const pointFromEvent = event => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.width / Math.max(1, rect.width),
        y: (event.clientY - rect.top) * canvas.height / Math.max(1, rect.height),
      };
    };
    canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      activeStroke = [pointFromEvent(event)];
      strokes.push(activeStroke);
      redraw();
    });
    canvas.addEventListener('pointermove', event => {
      if (!activeStroke) return;
      event.preventDefault();
      activeStroke.push(pointFromEvent(event));
      redraw();
    });
    const stopStroke = () => { activeStroke = null; };
    canvas.addEventListener('pointerup', stopStroke);
    canvas.addEventListener('pointercancel', stopStroke);
    canvas.addEventListener('lostpointercapture', stopStroke);
  }

  root.querySelector('#writingComplete')?.addEventListener('click', () => {
    const latest = readProgress(memberId);
    const previous = latest[term.hanzi] || { count: 0 };
    latest[term.hanzi] = { count: Number(previous.count || 0) + 1, last: new Date().toISOString() };
    writeProgress(memberId, latest);
    strokes = [];
    activeStroke = null;
    onChange();
  });
}
