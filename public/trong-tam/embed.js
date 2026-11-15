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

  // Khung không tự cuộn; việc đưa người học về đầu mục do trang ngoài làm khi bấm các nút chuyển màn hình.
  window.scrollTo = function () {};
  document.addEventListener('click', function (e) {
    if (e.target.closest('nav.tabs button,#go,.cta,.wk .go,.grp,.prow button,#nx,#qNext,#again,#more,#home,#cBack,#toQuiz,[data-s],.unit,#uCards,#uQuiz,#quick,#qAgain,#qx')) {
      post({ type: 'tyv-embed-top' });
    }
  }, true);
})();
