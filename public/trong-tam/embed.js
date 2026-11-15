/* Cầu nối khi app Ôn Trọng Tâm chạy trong khung của Trung Y Văn HIU (?embed=1).
   Báo chiều cao nội dung để trang ngoài có một thanh cuộn; không dùng cuộn riêng trong khung. */
(function () {
  var origin = location.origin;
  var last = 0;
  function post(message) {
    try { parent.postMessage(message, origin); } catch (e) {}
  }
  function reportHeight() {
    var h = Math.ceil(document.body.getBoundingClientRect().height);
    if (h && Math.abs(h - last) > 1) { last = h; post({ type: 'tyv-embed-height', height: h }); }
  }
  new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 300);

  // Phông: bọc từng cụm chữ Hán (kể cả dấu câu toàn chiều) bằng <span class="han"> để chỉ cụm đó dùng phông Hán,
  // còn chữ Việt trong cùng câu dùng phông giao diện (phông Hán thiếu glyph tiếng Việt nên vỡ dấu).
  var HAN = /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u3000-\u303F]+/g;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|NOSCRIPT)$/;
  function wrapHan(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), todo = [], n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode;
      if (!p || SKIP.test(p.nodeName) || (p.classList && p.classList.contains('han'))) continue;
      HAN.lastIndex = 0;
      if (HAN.test(n.nodeValue)) todo.push(n);
    }
    todo.forEach(function (t) {
      var s = t.nodeValue, frag = document.createDocumentFragment(), last = 0, m;
      HAN.lastIndex = 0;
      while ((m = HAN.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var sp = document.createElement('span'); sp.className = 'han'; sp.textContent = m[0];
        frag.appendChild(sp); last = m.index + m[0].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  var hanObserver = new MutationObserver(function () { wrapHan(document.body); hanObserver.takeRecords(); });
  hanObserver.observe(document.body, { childList: true, subtree: true });
  wrapHan(document.body);

  // Khung không tự cuộn; việc đưa người học về đầu mục do trang ngoài làm khi bấm các nút chuyển màn hình.
  window.scrollTo = function () {};
  document.addEventListener('click', function (e) {
    if (e.target.closest('nav.tabs button,#go,.cta,.wk .go,.grp,.prow button,#nx,#qNext,#again,#more,#home,#cBack,#toQuiz,[data-s],.unit,#uCards,#uQuiz,#quick,#qAgain,#qx')) {
      post({ type: 'tyv-embed-top' });
    }
  }, true);
})();
