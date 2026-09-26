import HanziWriter from 'hanzi-writer';

// Stroke outlines are loaded per character from the versioned open Hanzi Writer data set.
// Actual drawing and practice remain local in the app; no user strokes are uploaded.
let selectedHanzi = '';
let searchQuery = '';
let showGuide = true;
let strokes = [];
let activeStroke = null;
let writers = [];
let animationPaused = false;
const characterDataCache = new Map();

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

function animationMarkup(chars) {
  return chars.map((char, index) => '<article class="writing-animation-card"><div class="writing-animation-grid"><span class="writing-animation-cross writing-animation-cross-v"></span><span class="writing-animation-cross writing-animation-cross-h"></span><div class="writing-animation" data-animation-char="' + escapeHtml(char) + '" role="img" aria-label="Hoạt ảnh thứ tự nét chữ ' + escapeHtml(char) + '"></div></div><div class="writing-animation-caption"><b>' + (index + 1) + '</b><span data-stroke-count="' + escapeHtml(char) + '">Đang tải nét…</span></div></article>').join('');
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
  return '<header class="page-head"><span>LUYỆN TẬP · 手写</span><h1>Luyện viết từ vựng</h1><p>Xem hoạt ảnh nét viết Hán theo đúng thứ tự, sau đó luyện viết từng chữ vào ô bên dưới.</p></header>' +
    '<section class="stats writing-stats">' +
      '<article class="stat"><span>字</span><div><strong>' + doneCount + '</strong><small>Từ đã luyện</small></div></article>' +
      '<article class="stat"><span>✍</span><div><strong>' + totalWrites + '</strong><small>Lượt tự ghi nhận</small></div></article>' +
      '<article class="stat"><span>词</span><div><strong>' + terms.length + '</strong><small>Từ trong kho học</small></div></article>' +
    '</section>' +
    '<section class="writing-layout"><div class="panel writing-picker"><div class="writing-panel-head"><div><span class="writing-kicker">KHO TỪ VỰNG</span><h2>Chọn từ để viết</h2></div><span class="writing-count">' + terms.length + ' từ</span></div>' +
      '<label class="writing-search-label" for="writingSearch">Tìm theo chữ, pinyin hoặc nghĩa</label><input id="writingSearch" class="writing-search" type="search" value="' + escapeHtml(searchQuery) + '" placeholder="Ví dụ: âm dương, yīnyáng, 阴阳" autocomplete="off">' +
      '<div id="writingTermList" class="writing-term-list">' + termListMarkup(terms, progress, term.hanzi) + '</div></div>' +
      '<div class="writing-workspace"><section class="panel writing-lesson-card"><div class="writing-panel-head"><div><span class="writing-kicker">' + escapeHtml(term.group || 'TỪ VỰNG') + '</span><h2>' + escapeHtml(term.hanzi) + '</h2></div><button type="button" class="speak" data-writing-speak="' + escapeHtml(term.hanzi) + '" aria-label="Nghe phát âm">🔊</button></div>' +
      '<p class="writing-pronunciation"><b>' + escapeHtml(term.pinyin) + '</b><span>' + escapeHtml(term.hv) + '</span></p><p class="writing-meaning">' + escapeHtml(term.meaning) + '</p>' +
      '<div class="writing-section-head"><div><span class="writing-step">BƯỚC 1</span><strong>Xem thứ tự nét</strong><small>Mỗi chữ tự động phát lại liên tục</small></div><button type="button" class="writing-animation-toggle" id="writingAnimationToggle" aria-pressed="false">Tạm dừng</button></div>' +
      '<div class="writing-animation-list" id="writingAnimationList">' + animationMarkup(chars) + '</div><p class="writing-animation-status" id="writingAnimationStatus" role="status">Đang tải dữ liệu nét viết…</p></section>' +
      '<section class="panel writing-practice-card"><div class="writing-section-head"><div><span class="writing-step">BƯỚC 2</span><strong>Tự viết lại</strong><small>Viết theo thứ tự nét vừa quan sát</small></div><button type="button" class="writing-guide-toggle" id="writingGuideToggle">' + (showGuide ? 'Ẩn chữ mờ' : 'Hiện chữ mờ') + '</button></div>' +
      '<div class="writing-canvas-wrap"><canvas id="writingCanvas" width="900" height="360" role="img" aria-label="Bảng viết chữ Hán ' + escapeHtml(term.hanzi) + '"></canvas></div>' +
      '<div class="writing-tools"><button type="button" id="writingUndo">↶ Hoàn tác nét</button><button type="button" id="writingClear">Xóa bảng</button><button type="button" class="primary" id="writingComplete">Tôi đã luyện xong từ này</button></div>' +
      '<p class="writing-hint">Dùng ngón tay, bút cảm ứng hoặc chuột. Tiến độ và nét đang viết được lưu theo tài khoản; ứng dụng chưa tự chấm nét viết.</p></section></div></section>';
}

export function getWritingContext(memberId) {
  return { hanzi: selectedHanzi, search: searchQuery, progress: readProgress(memberId), strokes };
}

export function restoreWritingContext(memberId, context, terms) {
  if (!context || typeof context !== 'object') return;
  if (typeof context.hanzi === 'string' && terms.some(term => term.hanzi === context.hanzi)) selectedHanzi = context.hanzi;
  if (typeof context.search === 'string') searchQuery = context.search.slice(0, 120);
  if (context.progress && typeof context.progress === 'object' && !Array.isArray(context.progress)) writeProgress(memberId, context.progress);
  if (Array.isArray(context.strokes)) {
    strokes = context.strokes.slice(0, 40).map(stroke => Array.isArray(stroke)
      ? stroke.slice(0, 1500).filter(point => point && Number.isFinite(point.x) && Number.isFinite(point.y)
        && point.x >= 0 && point.x <= 900 && point.y >= 0 && point.y <= 360)
        .map(point => ({ x: point.x, y: point.y }))
      : []).filter(stroke => stroke.length);
  }
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

function stopAnimations() {
  writers.forEach(writer => writer.pauseAnimation().catch(() => {}));
  writers = [];
  animationPaused = false;
}

function charDataLoader(char, onLoad, onError) {
  if (!characterDataCache.has(char)) {
    const url = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(char) + '.json';
    characterDataCache.set(char, fetch(url).then(response => {
      if (!response.ok) throw new Error('Không tải được dữ liệu nét viết');
      return response.json();
    }).catch(error => {
      characterDataCache.delete(char);
      throw error;
    }));
  }
  const dataPromise = characterDataCache.get(char);
  return dataPromise.then(data => { onLoad(data); return data; }, error => { onError(error); throw error; });
}

function mountAnimations(root, chars) {
  stopAnimations();
  const status = root.querySelector('#writingAnimationStatus');
  const nodes = [...root.querySelectorAll('[data-animation-char]')];
  if (!nodes.length) return;
  let loaded = 0;
  let failed = 0;
  const updateStatus = () => {
    if (!status) return;
    if (loaded + failed < nodes.length) status.textContent = 'Đang tải dữ liệu nét viết ' + (loaded + failed) + '/' + nodes.length + '…';
    else if (loaded) status.textContent = 'Nét tô xanh chạy theo thứ tự viết; hoạt ảnh sẽ lặp lại liên tục.' + (failed ? ' ' + failed + ' chữ chưa có dữ liệu hoạt ảnh.' : '');
    else status.textContent = 'Không tải được dữ liệu hoạt ảnh. Kiểm tra kết nối mạng rồi chọn lại từ.';
  };
  nodes.forEach(node => {
    const char = node.dataset.animationChar;
    try {
      const writer = HanziWriter.create(node, char, {
        width: 190,
        height: 190,
        padding: 14,
        showOutline: true,
        showCharacter: false,
        strokeColor: '#168261',
        outlineColor: '#d7dfd9',
        strokeAnimationSpeed: 0.8,
        delayBetweenStrokes: 420,
        delayBetweenLoops: 1500,
        charDataLoader,
        onLoadCharDataError: () => {
          failed++;
          const label = root.querySelector('[data-stroke-count="' + CSS.escape(char) + '"]');
          if (label) label.textContent = 'Hoạt ảnh chưa khả dụng';
          updateStatus();
        },
      });
      writers.push(writer);
      writer.getCharacterData().then(data => {
        loaded++;
        const label = root.querySelector('[data-stroke-count="' + CSS.escape(char) + '"]');
        if (label) label.textContent = (data.strokes?.length || 0) + ' nét';
        updateStatus();
        if (!animationPaused) writer.loopCharacterAnimation().catch(() => {});
      }).catch(() => {});
    } catch {
      failed++;
      updateStatus();
    }
  });
  const toggle = root.querySelector('#writingAnimationToggle');
  toggle?.addEventListener('click', async () => {
    animationPaused = !animationPaused;
    toggle.textContent = animationPaused ? 'Phát hoạt ảnh' : 'Tạm dừng';
    toggle.setAttribute('aria-pressed', String(animationPaused));
    await Promise.all(writers.map(writer => (animationPaused ? writer.pauseAnimation() : writer.resumeAnimation()).catch(() => {})));
  });
}

export function bindWritingPractice(root, terms, memberId, onChange, onStateChange = () => {}) {
  const term = selectedTerm(terms);
  const canvas = root.querySelector('#writingCanvas');
  const redraw = () => drawBoard(canvas, term);
  redraw();
  mountAnimations(root, Array.from(term.hanzi || ''));

  const search = root.querySelector('#writingSearch');
  const list = root.querySelector('#writingTermList');
  if (search && list) {
    search.addEventListener('input', event => {
      searchQuery = event.currentTarget.value;
      list.innerHTML = termListMarkup(terms, readProgress(memberId), term.hanzi);
      bindTermButtons();
      onStateChange();
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
    if (button) button.textContent = showGuide ? 'Ẩn chữ mờ' : 'Hiện chữ mờ';
  });

  root.querySelector('#writingClear')?.addEventListener('click', () => {
    strokes = [];
    activeStroke = null;
    redraw();
    onStateChange();
  });
  root.querySelector('#writingUndo')?.addEventListener('click', () => {
    if (activeStroke) activeStroke = null;
    else strokes.pop();
    redraw();
    onStateChange();
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
      if (strokes.length >= 40) strokes.shift();
      activeStroke = [pointFromEvent(event)];
      strokes.push(activeStroke);
      redraw();
    });
    canvas.addEventListener('pointermove', event => {
      if (!activeStroke) return;
      event.preventDefault();
      if (activeStroke.length >= 1500) return;
      activeStroke.push(pointFromEvent(event));
      redraw();
    });
    const stopStroke = () => { activeStroke = null; onStateChange(); };
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