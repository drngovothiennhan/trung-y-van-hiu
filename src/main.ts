// @ts-nocheck
import './styles.css';
import './extra.css';
import { authApi, authMessage } from './auth-client';
import { sources as baseSources, radicals214, learningTerms as baseLearningTerms, readings, quizBank as baseQuizBank } from './content';
import { lesson2TextbookPages, lesson2Terms, lesson2Quiz } from './lesson2';
import { lesson3TextbookPages, lesson3Terms, lesson3Quiz } from './lesson3';
import { remainingTextbookPages, remainingTerms, remainingQuiz, extendedTextbookIndex } from './lesson4to8';
import { appendixSource, answerKeys, appendixReferences } from './appendix';
import { pathologyQuiz } from './pathology';
import { bookOriginalQuiz } from './book-original-quiz';
import { readingDrills } from './reading-drills';
import { herbsFormulasSource, herbsFormulasTerms, herbsFormulasReadings, herbsFormulasQuiz } from './herbs-formulas';
import { lessonAmDuongTextbookPages, lessonAmDuongTerms, lessonAmDuongQuiz, lessonAmDuongReadings } from './lesson-am-duong';
import { writingPracticeView, bindWritingPractice } from './writing-practice';

const STORAGE_KEY = 'trung-y-van-hiu-v4';

const UI_MODE_KEY = 'trung-y-van-hiu-ui-mode-v1';

function loadUiMode() {
  const saved = localStorage.getItem(UI_MODE_KEY);
  if (saved === 'desktop' || saved === 'mobile') return saved;
  return window.matchMedia('(max-width: 780px)').matches ? 'mobile' : 'desktop';
}

let uiMode = loadUiMode();

function applyUiMode() {
  document.documentElement.dataset.uiMode = uiMode;
}

function setUiMode(mode) {
  if (mode !== 'desktop' && mode !== 'mobile') return;
  uiMode = mode;
  localStorage.setItem(UI_MODE_KEY, mode);
  applyUiMode();
  render();
  if (access.member && mode === 'desktop') loadDesktopUsageInsights();
}

function uiModeMarkup() {
  return '<div class="ui-mode-switch" role="group" aria-label="Chế độ hiển thị">' +
    '<button type="button" data-ui-mode="desktop" class="' + (uiMode === 'desktop' ? 'active' : '') + '" title="Giao diện PC / Desktop">PC</button>' +
    '<button type="button" data-ui-mode="mobile" class="' + (uiMode === 'mobile' ? 'active' : '') + '" title="Giao diện Mobile">Mobile</button>' +
    '</div>';
}


const access = {
  ready: false,
  member: null,
  error: '',
  loginMssv: '',
  adminLoading: false,
  adminMembers: [],
  adminCandidates: [],
  adminCandidatePage: 0,
  adminApprovedPage: 0,
  adminError: '',
  adminAddMssv: '',
  adminAddName: '',
  leaderboard: [],
  leaderboardDate: '',
  leaderboardLoading: false,
  accessStats: [],
  accessStatsTotal: 0,
  accessStatsLoading: false,
  insightsError: '',
};

function authLoadingView() {
  return '<div class="auth-gate"><section class="auth-card auth-loading"><div class="auth-mark">中</div><h1>Trung Y Văn HIU</h1><p>Đang xác minh quyền truy cập...</p></section></div>';
}

function loginView() {
  const retry = authApi.hasToken();
  return '<div class="auth-gate"><section class="auth-card"><div class="auth-mark">中</div><span class="auth-kicker">HIU CLB YHCT · ACCESS CONTROL</span><h1>Đăng nhập Trung Y Văn</h1><p class="auth-desc">Chỉ MSSV đã được admin duyệt mới được truy cập. Mật khẩu mặc định bằng chính MSSV.</p>' +
    (access.error ? '<div class="auth-error">' + safe(access.error) + '</div>' : '') +
    '<form id="authLoginForm" autocomplete="on"><label>MSSV<input id="authMssv" inputmode="numeric" autocomplete="username" maxlength="14" value="' + safe(access.loginMssv) + '" placeholder="Nhập MSSV"></label><label>Mật khẩu<input id="authPassword" type="password" autocomplete="current-password" placeholder="Mật khẩu"></label><button class="auth-submit" type="submit">Đăng nhập</button></form>' +
    (retry ? '<button id="authRetry" class="auth-retry">Xác minh lại phiên hiện có</button>' : '') +
    '<small>Tài khoản sinh viên chỉ có một phiên/IP hoạt động. Tài khoản admin được phép đăng nhập nhiều thiết bị/IP đồng thời.</small></section></div>';
}

async function bootstrapAccess() {
  access.error = '';
  if (!authApi.hasToken()) {
    access.ready = true;
    access.member = null;
    render();
    return;
  }
  try {
    const data = await authApi.session();
    access.member = data.member;
    access.ready = true;
    render();
    await trackVisitOnce();
    if (uiMode === 'desktop') loadDesktopUsageInsights();
  } catch (error) {
    access.member = null;
    access.ready = true;
    access.error = authMessage(error?.code);
    if (error?.code !== 'NETWORK_ERROR') authApi.clearToken();
    render();
  }
}

async function handleLogin(mssv, password) {
  access.loginMssv = mssv;
  access.error = '';
  try {
    const data = await authApi.login(mssv, password);
    access.member = data.member;
    access.ready = true;
    access.loginMssv = '';
    state.view = 'home';
    render();
    await trackVisitOnce();
    if (uiMode === 'desktop') loadDesktopUsageInsights();
  } catch (error) {
    access.member = null;
    access.error = authMessage(error?.code);
    render();
  }
}

async function handleLogout() {
  await authApi.logout();
  access.member = null;
  access.adminMembers = [];
  access.adminCandidates = [];
  access.leaderboard = [];
  access.leaderboardDate = '';
  access.accessStats = [];
  access.accessStatsTotal = 0;
  access.insightsError = '';
  access.error = '';
  state.view = 'home';
  render();
}

async function verifyAccessHeartbeat() {
  if (!access.member || !authApi.hasToken()) return;
  try {
    const data = await authApi.session();
    access.member = data.member;
  } catch (error) {
    access.member = null;
    access.error = authMessage(error?.code);
    if (error?.code !== 'NETWORK_ERROR') authApi.clearToken();
    state.view = 'home';
    render();
  }
}

function vietnamToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function trackVisitOnce() {
  if (!access.member || !authApi.hasToken()) return;
  const date = vietnamToday();
  const owner = String(access.member.mssv || 'member');
  const storageKey = 'trung-y-van-hiu-visit-v1:' + owner + ':' + date;
  const sentKey = storageKey + ':sent';
  if (sessionStorage.getItem(sentKey) === '1') return;

  let visitKey = sessionStorage.getItem(storageKey);
  if (!visitKey) {
    const random = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    visitKey = date.replaceAll('-', '') + ':' + owner + ':' + random;
    sessionStorage.setItem(storageKey, visitKey);
  }

  try {
    await authApi.recordVisit(visitKey);
    sessionStorage.setItem(sentKey, '1');
  } catch {
    // Không chặn học tập nếu thống kê tạm thời mất kết nối.
  }
}

async function loadDesktopUsageInsights() {
  if (!access.member || uiMode !== 'desktop' || access.leaderboardLoading) return;
  access.leaderboardLoading = true;
  if (access.member.role === 'admin') access.accessStatsLoading = true;
  access.insightsError = '';
  try {
    const [leaderboard, adminStats] = await Promise.all([
      authApi.leaderboard(),
      access.member.role === 'admin' ? authApi.adminAccessStats() : Promise.resolve(null),
    ]);
    access.leaderboard = leaderboard.leaderboard || [];
    access.leaderboardDate = leaderboard.date || '';
    if (adminStats) {
      access.accessStats = adminStats.days || [];
      access.accessStatsTotal = Number(adminStats.total_visits || 0);
    }
  } catch (error) {
    access.insightsError = authMessage(error?.code);
  } finally {
    access.leaderboardLoading = false;
    access.accessStatsLoading = false;
    render();
  }
}

function leaderboardMarkup() {
  if (uiMode !== 'desktop') return '';
  const rows = access.leaderboard || [];
  const content = access.leaderboardLoading && !rows.length
    ? '<div class="leaderboard-empty">Đang cập nhật...</div>'
    : rows.length
      ? rows.map(row => '<div class="leaderboard-row"><b>' + row.rank + '</b><span>' + safe(row.display_name || row.mssv) + '</span><strong>' + Number(row.visits || 0) + '</strong></div>').join('')
      : '<div class="leaderboard-empty">Chưa có lượt truy cập hôm nay.</div>';
  return '<section class="desktop-leaderboard"><div class="leaderboard-head"><span>TOP 5 HÔM NAY</span><small>Theo lượt truy cập</small></div>' + content + '</section>';
}

function adminAccessStatsMarkup() {
  if (uiMode !== 'desktop' || access.member?.role !== 'admin') return '';
  const days = access.accessStats || [];
  if (access.accessStatsLoading && !days.length) {
    return '<section class="panel admin-access-stats"><div class="admin-title"><div><span>THỐNG KÊ RIÊNG ADMIN</span><h3>Lượt truy cập mỗi ngày</h3></div></div><div class="empty">Đang tải thống kê...</div></section>';
  }
  const max = Math.max(1, ...days.map(row => Number(row.visits || 0)));
  const rows = days.map(row => {
    const date = String(row.date || '');
    const label = date.length >= 10 ? date.slice(8, 10) + '/' + date.slice(5, 7) : date;
    const visits = Number(row.visits || 0);
    const width = Math.round((visits / max) * 100);
    return '<div class="access-day"><span>' + safe(label) + '</span><i><b style="width:' + width + '%"></b></i><strong>' + visits + '</strong></div>';
  }).join('');
  return '<section class="panel admin-access-stats"><div class="admin-title"><div><span>THỐNG KÊ RIÊNG ADMIN</span><h3>Lượt truy cập mỗi ngày</h3></div><small>14 ngày · ' + access.accessStatsTotal + ' lượt</small></div>' +
    (access.insightsError ? '<div class="auth-error admin-error">' + safe(access.insightsError) + '</div>' : '') +
    '<div class="access-chart">' + (rows || '<div class="empty">Chưa có dữ liệu truy cập.</div>') + '</div><small class="access-note">Bắt đầu ghi nhận từ khi tính năng thống kê được bật.</small></section>';
}

async function loadAdminData() {
  if (access.member?.role !== 'admin' || access.adminLoading) return;
  access.adminLoading = true;
  access.adminError = '';
  render();
  try {
    const [members, candidates] = await Promise.all([authApi.adminList(), authApi.adminCandidates()]);
    access.adminMembers = members.members || [];
    access.adminCandidates = candidates.candidates || [];
  } catch (error) {
    access.adminError = authMessage(error?.code);
  } finally {
    access.adminLoading = false;
    render();
  }
}

function adminView() {
  if (access.member?.role !== 'admin') return '<div class="note">Bạn không có quyền quản trị.</div>';
  const candidateRows = access.adminCandidates.filter(x => x.mssv !== access.member.mssv);
  const pending = candidateRows.filter(x => x.access_status !== 'approved');
  const approved = access.adminMembers.filter(x => x.status === 'approved');
  const pageSize = 5;
  const totalPendingPages = Math.max(1, Math.ceil(pending.length / pageSize));
  access.adminCandidatePage = Math.min(access.adminCandidatePage, totalPendingPages - 1);
  const pageStart = access.adminCandidatePage * pageSize;
  const pendingPage = pending.slice(pageStart, pageStart + pageSize);

  const totalApprovedPages = Math.max(1, Math.ceil(access.adminMembers.length / pageSize));
  access.adminApprovedPage = Math.min(access.adminApprovedPage, totalApprovedPages - 1);
  const approvedStart = access.adminApprovedPage * pageSize;
  const approvedPage = access.adminMembers.slice(approvedStart, approvedStart + pageSize);
  return h('SECURITY ADMIN', 'Duyệt quyền truy cập sinh viên', 'Tài khoản chỉ được tạo/mở khi bạn duyệt. Mật khẩu mặc định = MSSV; sinh viên chỉ giữ một phiên/IP, riêng admin được nhiều phiên/IP đồng thời.') +
    (access.adminError ? '<div class="auth-error admin-error">' + safe(access.adminError) + '</div>' : '') +
    '<section class="panel admin-summary"><div><b>' + approved.length + '</b><span>tài khoản đang được duyệt</span></div><div><b>' + pending.length + '</b><span>thành viên CLB chưa có quyền / đang khóa</span></div><button id="adminRefresh" ' + (access.adminLoading ? 'disabled' : '') + '>↻ Tải lại danh sách</button></section>' +
    adminAccessStatsMarkup() +
    '<section class="panel admin-manual"><h3>Tạo tài khoản học tập</h3><form id="adminAddForm" autocomplete="off"><input id="adminAddMssv" name="student_code" inputmode="numeric" maxlength="14" value="' + safe(access.adminAddMssv) + '" placeholder="MSSV" required><input id="adminAddName" name="display_name" value="' + safe(access.adminAddName) + '" placeholder="Họ tên" required><button type="submit">Tạo tài khoản</button></form><small class="admin-rule">Bắt buộc có đủ MSSV và Họ tên. Mật khẩu mặc định = MSSV.</small></section>' +
    '<section class="panel admin-section"><div class="admin-title"><div><span>DANH SÁCH CLB</span><h3>Chờ bạn duyệt</h3></div><small>' + pending.length + ' hồ sơ</small></div><div class="admin-list">' +
      (access.adminLoading ? '<div class="empty">Đang tải dữ liệu...</div>' : pending.length ? pendingPage.map(x => '<div class="admin-row"><div><b>' + safe(x.display_name || 'Chưa có tên') + '</b><span>' + safe(x.mssv) + (x.class_name ? ' · ' + safe(x.class_name) : '') + '</span><small>' + (x.access_status === 'suspended' ? 'Đang bị khóa' : 'Chưa được cấp quyền') + '</small></div><button data-admin-approve="' + safe(x.mssv) + '" data-admin-name="' + safe(x.display_name || '') + '">' + (x.access_status === 'suspended' ? 'Mở lại' : 'Duyệt') + '</button></div>').join('') : '<div class="empty">Không còn hồ sơ chờ duyệt.</div>') +
    '</div>' +
    (pending.length > pageSize ? '<div class="admin-pager"><button data-admin-page="-1" ' + (access.adminCandidatePage === 0 ? 'disabled' : '') + '>← Trước</button><span>Trang ' + (access.adminCandidatePage + 1) + ' / ' + totalPendingPages + ' · ' + pending.length + ' hồ sơ</span><button data-admin-page="1" ' + (access.adminCandidatePage >= totalPendingPages - 1 ? 'disabled' : '') + '>Sau →</button></div>' : '') +
    '</section>' +
    '<section class="panel admin-section"><div class="admin-title"><div><span>QUYỀN TRUY CẬP</span><h3>Tài khoản đã tạo</h3></div><small>' + access.adminMembers.length + ' tài khoản</small></div><div class="admin-list">' +
      (access.adminLoading ? '<div class="empty">Đang tải dữ liệu...</div>' : approvedPage.map(x => '<div class="admin-row account-row"><div><b>' + safe(x.display_name || x.student_code) + (x.role === 'admin' ? ' · ADMIN' : '') + '</b><span>' + safe(x.student_code) + '</span><small>' + (x.status === 'approved' ? (x.session_active ? 'Đang hoạt động · phiên đã khóa IP' : 'Đã duyệt · chưa hoạt động') : 'Đang tạm khóa') + '</small></div><div class="admin-actions">' +
        (x.role === 'admin' ? '' : '<button data-admin-status="' + safe(x.student_code) + '" data-next-status="' + (x.status === 'approved' ? 'suspended' : 'approved') + '">' + (x.status === 'approved' ? 'Tạm khóa' : 'Mở lại') + '</button>') +
        (x.student_code === access.member?.mssv ? '' : '<button data-admin-kick="' + safe(x.student_code) + '">Đăng xuất phiên</button>') + '<button data-admin-reset="' + safe(x.student_code) + '">Reset MK=MSSV</button></div></div>').join('')) +
    '</div>' +
    (access.adminMembers.length > pageSize ? '<div class="admin-pager"><button data-approved-page="-1" ' + (access.adminApprovedPage === 0 ? 'disabled' : '') + '>← Trước</button><span>Trang ' + (access.adminApprovedPage + 1) + ' / ' + totalApprovedPages + ' · ' + access.adminMembers.length + ' tài khoản</span><button data-approved-page="1" ' + (access.adminApprovedPage >= totalApprovedPages - 1 ? 'disabled' : '') + '>Sau →</button></div>' : '') +
    '</section>';
}

async function adminAction(task) {
  try {
    await task();
    await loadAdminData();
  } catch (error) {
    access.adminError = authMessage(error?.code);
    render();
  }
}

function bindAccessGate() {
  const form = document.querySelector('#authLoginForm');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const mssv = String(document.querySelector('#authMssv')?.value || '').trim();
    const password = String(document.querySelector('#authPassword')?.value || '');
    handleLogin(mssv, password);
  });
  const retry = document.querySelector('#authRetry');
  if (retry) retry.addEventListener('click', bootstrapAccess);
}

function bindAdmin() {
  const refresh = document.querySelector('#adminRefresh');
  if (refresh) refresh.addEventListener('click', () => {
    access.adminCandidatePage = 0;
    access.adminApprovedPage = 0;
    loadAdminData();
  });

  document.querySelectorAll('[data-admin-page]').forEach(button => button.addEventListener('click', () => {
    access.adminCandidatePage = Math.max(0, access.adminCandidatePage + Number(button.dataset.adminPage || 0));
    render();
  }));

  document.querySelectorAll('[data-approved-page]').forEach(button => button.addEventListener('click', () => {
    access.adminApprovedPage = Math.max(0, access.adminApprovedPage + Number(button.dataset.approvedPage || 0));
    render();
  }));

  const addMssvInput = document.querySelector('#adminAddMssv');
  if (addMssvInput) addMssvInput.addEventListener('input', event => { access.adminAddMssv = event.currentTarget.value; });
  const addNameInput = document.querySelector('#adminAddName');
  if (addNameInput) addNameInput.addEventListener('input', event => { access.adminAddName = event.currentTarget.value; });

  const addForm = document.querySelector('#adminAddForm');
  if (addForm) addForm.addEventListener('submit', event => {
    event.preventDefault();
    const mssv = String(document.querySelector('#adminAddMssv')?.value || '').trim();
    const name = String(document.querySelector('#adminAddName')?.value || '').trim();
    access.adminAddMssv = mssv;
    access.adminAddName = name;
    if (!/^[0-9]{8,14}$/.test(mssv)) {
      access.adminError = 'MSSV phải gồm 8–14 chữ số.';
      render();
      return;
    }
    if (!name) {
      access.adminError = 'Bắt buộc nhập Họ tên trước khi tạo tài khoản học tập.';
      render();
      return;
    }
    adminAction(async () => {
      await authApi.adminAdd(mssv, name);
      access.adminAddMssv = '';
      access.adminAddName = '';
    });
  });

  document.querySelectorAll('[data-admin-approve]').forEach(button => button.addEventListener('click', () => {
    const mssv = button.dataset.adminApprove;
    const name = String(button.dataset.adminName || '').trim();
    if (!name) {
      access.adminError = 'Không thể duyệt hồ sơ chưa có Họ tên. Hãy nhập MSSV và Họ tên ở mục Tạo tài khoản học tập.';
      render();
      return;
    }
    adminAction(() => authApi.adminAdd(mssv, name));
  }));

  document.querySelectorAll('[data-admin-status]').forEach(button => button.addEventListener('click', () => {
    const mssv = button.dataset.adminStatus;
    const nextStatus = button.dataset.nextStatus;
    const verb = nextStatus === 'suspended' ? 'tạm khóa' : 'mở lại';
    if (!window.confirm('Xác nhận ' + verb + ' tài khoản ' + mssv + '?')) return;
    adminAction(() => authApi.adminSetStatus(mssv, nextStatus));
  }));

  document.querySelectorAll('[data-admin-kick]').forEach(button => button.addEventListener('click', () => {
    const mssv = button.dataset.adminKick;
    if (!window.confirm('Đăng xuất phiên đang hoạt động của ' + mssv + '?')) return;
    adminAction(() => authApi.adminForceLogout(mssv));
  }));

  document.querySelectorAll('[data-admin-reset]').forEach(button => button.addEventListener('click', () => {
    const mssv = button.dataset.adminReset;
    if (!window.confirm('Đặt lại mật khẩu của ' + mssv + ' về chính MSSV? Phiên hiện tại của tài khoản này sẽ bị đăng xuất.')) return;
    adminAction(() => authApi.adminResetPassword(mssv));
  }));
}


const PWA_DISMISS_KEY = 'trung-y-van-hiu-pwa-dismissed-at';
const PWA_REMIND_AFTER = 3 * 24 * 60 * 60 * 1000;
let deferredInstallPrompt = null;
let pwaPromptMode = null;

function isStandalonePwa() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function canShowPwaReminder() {
  if (isStandalonePwa()) return false;
  const dismissedAt = Number(localStorage.getItem(PWA_DISMISS_KEY) || 0);
  return !dismissedAt || Date.now() - dismissedAt >= PWA_REMIND_AFTER;
}

function dismissPwaReminder() {
  localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  pwaPromptMode = null;
  render(true);
}

async function requestPwaInstall() {
  if (!deferredInstallPrompt) return;
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  const result = await promptEvent.prompt();
  if (result?.outcome === 'dismissed') {
    localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  }
  pwaPromptMode = null;
  render(true);
}

function pwaInstallMarkup() {
  if (!pwaPromptMode || isStandalonePwa()) return '';
  const ios = pwaPromptMode === 'ios';
  return '<section class="pwa-install" role="dialog" aria-live="polite" aria-label="Cài ứng dụng Trung Y Văn HIU"><div class="pwa-install-icon">中</div><div class="pwa-install-copy"><b>Cài Trung Y Văn HIU</b><span>' +
    (ios
      ? 'Để học như một ứng dụng: bấm Chia sẻ trong Safari → Thêm vào Màn hình chính.'
      : 'Cài ứng dụng lên máy để mở nhanh từ màn hình chính và tiếp tục học thuận tiện hơn.') +
    '</span></div><div class="pwa-install-actions">' +
    (ios ? '<button id="pwaDismiss" class="pwa-primary">Đã hiểu</button>' : '<button id="pwaInstall" class="pwa-primary">Cài ứng dụng</button><button id="pwaDismiss">Để sau</button>') +
    '</div></section>';
}

function setupPwa() {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (canShowPwaReminder()) {
      pwaPromptMode = 'install';
      render(true);
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    pwaPromptMode = null;
    localStorage.removeItem(PWA_DISMISS_KEY);
    render(true);
  });

  if (isIosDevice() && canShowPwaReminder()) {
    pwaPromptMode = 'ios';
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}
const textbookSource = baseSources.find(s => s.id === 'textbook');
const sources = [
  ...baseSources
    .filter(s => s.id !== 'textbook')
    .concat({
      ...textbookSource,
      pages: [...textbookSource.pages, ...lesson2TextbookPages, ...lesson3TextbookPages, ...remainingTextbookPages, ...lessonAmDuongTextbookPages],
      status: 'Đã chuyển đủ Bài 1–8 và bổ sung chuyên đề Âm Dương theo bài giảng.'
    }),
  appendixSource,
  herbsFormulasSource
];
const learningTerms = [...baseLearningTerms, ...lesson2Terms, ...lesson3Terms, ...remainingTerms, ...herbsFormulasTerms, ...lessonAmDuongTerms]
  .filter((t, i, a) => a.findIndex(x => x.hanzi === t.hanzi) === i);
const coreQuizBank = [...baseQuizBank, ...lesson2Quiz, ...lesson3Quiz, ...remainingQuiz, ...herbsFormulasQuiz, ...lessonAmDuongQuiz];
const quizBank = [...coreQuizBank, ...pathologyQuiz, ...bookOriginalQuiz];
const readingBank = [...readings.map(r => ({...r, topic:'Lâm sàng', source:'Cách diễn đạt YHCT', words:[]})), ...readingDrills, ...herbsFormulasReadings, ...lessonAmDuongReadings];

function shuffleArray(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomizeQuizQuestion(q, slot) {
  const correct = q.o[q.a];
  const wrong = shuffleArray(q.o.filter((_, i) => i !== q.a));
  const target = slot % q.o.length;
  const options = [...wrong];
  options.splice(target, 0, correct);
  return { ...q, o: options, a: target };
}

function prepareQuizRound(pool, count = 10) {
  const selected = shuffleArray(pool).slice(0, count);
  const offset = Math.floor(Math.random() * 4);
  return selected.map((q, i) => randomizeQuizQuestion(q, i + offset));
}

const state = {
  view: 'home',
  card: 0,
  vocabPhase: 0,
  vocabChoice: null,
  vocabFeedback: null,
  recallRevealed: false,
  reviewMode: false,
  reviewFeedback: null,
  quizMode: 'mixed',
  reading: 0,
  readingAnswer: null,
  readingTopic: 'all',
  quizIndex: 0,
  quizAnswers: {},
  quiz: prepareQuizRound(quizBank),
  source: 'all',
  sourceQuery: '',
  radicalQuery: '',
  answerLesson: 1,
  progress: loadProgress()
};

function emptyProgress() {
  return { xp: 0, mastered: [], difficult: [], readingDone: [], quizHistory: [], wordStage: {}, memorySchedule: {} };
}

function loadProgress() {
  let p = emptyProgress();
  try {
    const old = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('trung-y-van-hiu-v3') || localStorage.getItem('trung-y-van-hiu-v2') || '{}');
    p = { ...p, ...old, wordStage: old.wordStage || {}, memorySchedule: old.memorySchedule || {} };
  } catch {}
  for (const h of p.mastered || []) {
    if (p.wordStage[h] === undefined) p.wordStage[h] = 4;
    if (!p.memorySchedule[h]) p.memorySchedule[h] = { level: 0, due: Date.now(), streak: 0, lapses: 0, reviews: 0, last: 0 };
  }
  return p;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.82;
  speechSynthesis.speak(u);
}

function nav(view) {
  state.view = view;
  state.readingAnswer = null;
  render();
  if (view === 'admin' && access.member?.role === 'admin') loadAdminData();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function h(kicker, title, sub) {
  return '<header class="page-head"><span>' + kicker + '</span><h1>' + title + '</h1><p>' + sub + '</p></header>';
}

function stat(icon, value, label) {
  return '<article class="stat"><span>' + icon + '</span><div><strong>' + value + '</strong><small>' + label + '</small></div></article>';
}

function safe(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

function stage(hanzi) {
  return Number(state.progress.wordStage?.[hanzi] || 0);
}

const REVIEW_INTERVALS = [10 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000, 14 * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000, 60 * 24 * 60 * 60 * 1000];

function setStage(hanzi, value) {
  state.progress.wordStage ||= {};
  state.progress.wordStage[hanzi] = Math.max(stage(hanzi), value);
  if (value >= 4 && !state.progress.mastered.includes(hanzi)) state.progress.mastered.push(hanzi);
  if (value >= 4) state.progress.difficult = state.progress.difficult.filter(x => x !== hanzi);
  save();
}

function memoryMeta(hanzi) {
  state.progress.memorySchedule ||= {};
  if (!state.progress.memorySchedule[hanzi]) state.progress.memorySchedule[hanzi] = { level: 0, due: 0, streak: 0, lapses: 0, reviews: 0, last: 0 };
  return state.progress.memorySchedule[hanzi];
}

function scheduleFirstReview(hanzi) {
  const m = memoryMeta(hanzi);
  m.level = 0;
  m.last = Date.now();
  m.due = Date.now() + REVIEW_INTERVALS[0];
  save();
}

function dueTerms() {
  const now = Date.now();
  return learningTerms
    .filter(v => stage(v.hanzi) >= 4 && memoryMeta(v.hanzi).due > 0 && memoryMeta(v.hanzi).due <= now)
    .sort((a, b) => memoryMeta(a.hanzi).due - memoryMeta(b.hanzi).due);
}

function durableTerms() {
  return learningTerms.filter(v => stage(v.hanzi) >= 4 && memoryMeta(v.hanzi).level >= 4);
}

function reviewSuccess(hanzi) {
  const m = memoryMeta(hanzi);
  m.level = Math.min(m.level + 1, REVIEW_INTERVALS.length - 1);
  m.streak += 1;
  m.reviews += 1;
  m.last = Date.now();
  m.due = Date.now() + REVIEW_INTERVALS[m.level];
  state.progress.xp += 6;
  save();
}

function reviewFail(hanzi) {
  const m = memoryMeta(hanzi);
  m.level = 0;
  m.streak = 0;
  m.lapses += 1;
  m.reviews += 1;
  m.last = Date.now();
  m.due = 0;
  state.progress.wordStage[hanzi] = 2;
  state.progress.mastered = state.progress.mastered.filter(x => x !== hanzi);
  if (!state.progress.difficult.includes(hanzi)) state.progress.difficult.push(hanzi);
  save();
}

function dueLabel(ts) {
  const d = Math.max(0, ts - Date.now());
  if (d < 60 * 60 * 1000) return Math.max(1, Math.round(d / 60000)) + ' phút';
  if (d < 24 * 60 * 60 * 1000) return Math.round(d / 3600000) + ' giờ';
  return Math.round(d / 86400000) + ' ngày';
}

function nextCard() {
  state.card = (state.card + 1) % learningTerms.length;
  state.vocabPhase = Math.min(stage(learningTerms[state.card].hanzi), 3);
  state.vocabChoice = null;
  state.vocabFeedback = null;
  state.recallRevealed = false;
  render();
}

function optionsFor(index, mapper) {
  const answer = mapper(learningTerms[index]);
  const out = [answer];
  for (let step = 1; out.length < 4 && step < learningTerms.length; step++) {
    const candidate = mapper(learningTerms[(index + step * 7) % learningTerms.length]);
    if (!out.includes(candidate)) out.push(candidate);
  }
  return out.map((x, i) => ({ x, rank: (i * 3 + index) % 7 })).sort((a, b) => a.rank - b.rank).map(x => x.x);
}

function shell(content) {
  const navs = [
    ['home', '⌂', 'Hôm nay'],
    ['lessons', '书', 'Bài học'],
    ['vocab', '字', 'Từ vựng'],
    ['writing', '✍', 'Luyện viết'],
    ['reading', '阅', 'Đọc hiểu'],
    ['radicals', '部', '214 bộ thủ'],
    ['quiz', '✓', 'Trắc nghiệm'],
    ['answers', '答', 'Đáp án'],
    ['library', '库', 'Kho tài liệu'],
    ['progress', '图', 'Tiến độ']
  ];
  if (access.member?.role === 'admin') navs.push(['admin', '盾', 'Quản trị']);
  return '<div class="shell" data-member="' + safe(access.member?.mssv || '') + '" data-role="' + safe(access.member?.role || '') + '"><aside><div class="brand"><b>中医中文</b><strong>TRUNG Y VĂN</strong><small>HIU CLB YHCT</small></div><nav>' +
    navs.map(n => '<button data-nav="' + n[0] + '" class="' + (state.view === n[0] ? 'active' : '') + '"><i>' + n[1] + '</i><span>' + n[2] + '</span></button>').join('') +
    '</nav>' + leaderboardMarkup() + '<div class="side-note"><span>HIU · YHCT</span><p>Mục tiêu từ vựng: nhìn → nhận biết → hiểu → nhớ.</p></div></aside><main><div class="top"><button class="mini" data-nav="home">中</button><div><b>HIU CLB YHCT</b><small>Chinese for Traditional Medicine</small></div><span class="streak">🔥 ' +
    state.progress.xp + ' XP</span>' + uiModeMarkup() + '<div class="auth-user"><span>' + safe(access.member?.display_name || access.member?.mssv || '') + '</span><small>' + safe(access.member?.mssv || '') + '</small><button id="authLogout">Đăng xuất</button></div></div><div class="content">' + content + '</div></main><div class="bottom">' +
    navs.slice(0, 5).map(n => '<button data-nav="' + n[0] + '" class="' + (state.view === n[0] ? 'active' : '') + '"><i>' + n[1] + '</i><small>' + n[2] + '</small></button>').join('') +
    '</div></div>' + pwaInstallMarkup();
}

function home() {
  const last = state.progress.quizHistory[0];
  const stage4 = learningTerms.filter(v => stage(v.hanzi) >= 4).length;
  const due = dueTerms().length;
  const durable = durableTerms().length;
  return '<section class="hero"><div><span class="eyebrow">HIU CLB YHCT · 中医中文</span><h1>Trung Y Văn HIU</h1><p>Học Trung văn chuyên ngành theo vòng nhớ trọng tâm: <b>nhìn chữ → nhận biết → hiểu nghĩa → nhớ lại</b>, sau đó kiểm tra bằng đọc hiểu và trắc nghiệm.</p><div class="actions"><button class="primary" data-nav="vocab">Học từ vựng 4 bước</button><button id="homeDueReview">Ôn đến hạn · ' + due + '</button><button data-nav="quiz">Thi nhanh 10 câu</button></div></div><div class="seal">医<small>中医中文</small></div></section>' +
    '<section class="stats">' + stat('字', learningTerms.length, 'Thuật ngữ nguồn') + stat('⏱', due, 'Từ đến hạn ôn') + stat('稳', durable, 'Từ bền ≥14 ngày') + stat('记', stage4, 'Từ đang ở mức Nhớ') + '</section>' +
    h('HỌC TỪ VỰNG', 'Nhìn · Nhận biết · Hiểu · Nhớ', 'Không đánh dấu “đã học” chỉ vì đã lật thẻ. Một từ chỉ được xem là nhớ khi hoàn thành đủ 4 mức.') +
    '<div class="memory-road">' +
      [['01','看','NHÌN','Nhìn mặt chữ lớn + nghe âm.'],['02','认','NHẬN BIẾT','Chọn đúng Hán Việt và nghĩa.'],['03','懂','HIỂU','Xác định ngữ cảnh/chủ đề của từ.'],['04','记','NHỚ','Từ nghĩa nhớ ngược lại chữ Hán.']].map(x => '<button data-nav="vocab"><b>' + x[0] + '</b><i>' + x[1] + '</i><strong>' + x[2] + '</strong><span>' + x[3] + '</span></button>').join('') +
    '</div>' +
    h('NGUỒN', 'Giáo trình + đáp án/phụ lục đã nối vào app', 'Phụ lục đáp án của nguồn có Bài 1–7; sau đó chuyển sang tài liệu tham khảo, không có phần đáp án riêng cho Bài 8.') +
    '<div class="source-summary">' + sources.map(s => '<button data-source-open="' + s.id + '"><b>' + s.title + '</b><span>' + s.status + '</span><i>' + s.pages.length + ' trang/bản ghi →</i></button>').join('') + '</div>';
}

function lessonsView() {
  const modules = [
    ['01', '汉语基础', 'Cơ sở tiếng Hán', 'Pinyin, thanh mẫu, vận mẫu, thanh điệu, chữ Hán, ngữ pháp.', 'basic'],
    ['02', '临床表达', 'Diễn đạt YHCT', 'Triệu chứng, hỏi bệnh, chẩn đoán, điều trị và hội thoại.', 'dialogue'],
    ['03', '中医词汇', 'Từ vựng YHCT Bài 6–9', 'Cấu trúc cơ thể, lý luận, chẩn đoán, điều trị.', 'compact'],
    ['04', '药材方剂', 'Dược liệu & Phương tễ', '14 dược liệu · phân loại · 4 cách bào chế · 8 phương tễ · cách dùng và lưu ý.', 'herbs-formulas'],
    ['05', '专业教材', 'Giáo trình chuyên ngành', 'Đủ 8 bài học từ Âm Dương đến Sơ lược giải phẫu cơ thể.', 'textbook'],
    ['06', '答案', 'Đáp án & phụ lục', 'Đáp án Bài 1–7, tài liệu tham khảo và thông tin xuất bản.', 'appendix']
  ];
  return h('LỘ TRÌNH', 'Bài học theo tài liệu', 'Mỗi cụm mở trực tiếp đúng nguồn đã cung cấp.') +
    '<div class="lesson-list">' + modules.map(x => '<article class="lesson"><b>' + x[0] + '</b><span>' + x[1] + '</span><div><small>NGUỒN HỌC</small><h3>' + x[2] + '</h3><p>' + x[3] + '</p></div><button class="speak source-go" data-source-open="' + x[4] + '">→</button></article>').join('') + '</div>' +
    '<section class="panel curriculum"><h3>Mục lục giáo trình</h3>' + extendedTextbookIndex.map(x => '<div><b>' + x.lesson + '</b><span><strong>' + x.han + '</strong>' + x.title + '</span><small>Trang in ' + x.printedStart + '</small></div>').join('') + '</section>';
}

function renderWordList(items) {
  if (!items.length) return '<div class="empty">Không tìm thấy thuật ngữ phù hợp.</div>';
  return items.map(v => {
    const idx = learningTerms.indexOf(v);
    const s = stage(v.hanzi);
    return '<button class="word" data-term-index="' + idx + '"><b>' + v.hanzi + '</b><span><strong>' + v.pinyin + '</strong><small>' + v.hv + ' · ' + v.meaning + '</small></span><i>' + s + '/4</i></button>';
  }).join('');
}

function vocabView() {
  if (state.reviewMode) return reviewView();
  const v = learningTerms[state.card % learningTerms.length];
  const s = stage(v.hanzi);
  const phases = [['看','Nhìn'],['认','Nhận biết'],['懂','Hiểu'],['记','Nhớ']];
  let task = '';
  if (state.vocabPhase === 0) {
    task = '<div class="look-card"><b>' + v.hanzi + '</b><button class="speak" data-speak="' + v.hanzi + '">🔊 Nghe phát âm</button><p>Nhìn cấu trúc chữ trước. Chưa cần đọc nghĩa.</p><button id="phaseNext" class="primary">Tôi đã nhìn rõ chữ →</button></div>';
  } else if (state.vocabPhase === 1) {
    const opts = optionsFor(state.card, x => x.hv + ' · ' + x.meaning);
    task = '<div class="recognition-card"><span class="big-hanzi">' + v.hanzi + '</span><h3>Chọn nghĩa đúng của từ này</h3><div class="memory-options">' +
      opts.map((o, i) => '<button data-vchoice="' + i + '" data-value="' + safe(o) + '">' + o + '</button>').join('') +
      '</div>' + (state.vocabFeedback ? '<div class="feedback ' + (state.vocabFeedback === 'ok' ? 'good' : 'bad') + '">' + (state.vocabFeedback === 'ok' ? 'Đúng. Bạn đã nhận biết được từ.' : 'Chưa đúng. Hãy nhìn lại mặt chữ và thử lại.') + '</div>' : '') + '</div>';
  } else if (state.vocabPhase === 2) {
    const groups = optionsFor(state.card, x => x.group);
    task = '<div class="understand-card"><span class="big-hanzi">' + v.hanzi + '</span><p class="pinyin">' + v.pinyin + ' · ' + v.hv + '</p><div class="meaning-box">' + v.meaning + '</div><h3>Từ này thuộc ngữ cảnh/chủ đề nào?</h3><div class="memory-options">' +
      groups.map((o, i) => '<button data-gchoice="' + i + '" data-value="' + safe(o) + '">' + o + '</button>').join('') +
      '</div>' + (state.vocabFeedback ? '<div class="feedback ' + (state.vocabFeedback === 'ok' ? 'good' : 'bad') + '">' + (state.vocabFeedback === 'ok' ? 'Đúng. Bạn đã hiểu vị trí của từ trong hệ kiến thức.' : 'Chưa đúng. Hãy nối nghĩa với đúng chủ đề.') + '</div>' : '') + '</div>';
  } else {
    task = '<div class="remember-card"><span class="memory-kicker">TỪ NGHĨA → NHỚ LẠI CHỮ</span><h2>' + v.hv + '</h2><p>' + v.meaning + '</p>' +
      (!state.recallRevealed
        ? '<div class="recall-blank">Hãy nhẩm hoặc viết lại chữ Hán trong đầu trước khi mở đáp án.</div><button id="revealRecall" class="primary">Mở để tự kiểm tra</button>'
        : '<div class="recall-answer"><b>' + v.hanzi + '</b><strong>' + v.pinyin + '</strong><small>' + v.group + '</small></div><div class="recall"><button id="rememberNo" class="danger">✕ Chưa nhớ</button><button id="rememberYes" class="success">✓ Nhớ được</button></div>') +
      '</div>';
  }
  const due = dueTerms().length;
  return h('VOCAB MEMORY LOOP', 'Từ vựng: nhìn → nhận biết → hiểu → nhớ → ôn cách quãng', 'Hoàn thành 4 bước chỉ là lần ghi nhớ đầu. Sau đó từ được gọi lại theo lịch 10 phút → 1 ngày → 3 → 7 → 14 → 30 → 60 ngày.') +
    '<div class="srs-strip"><div><b>' + due + '</b><span>từ đến hạn ôn</span></div><div><b>' + durableTerms().length + '</b><span>từ đạt độ bền ≥14 ngày</span></div><button id="startDueReview" ' + (due ? '' : 'disabled') + '>Ôn đến hạn ngay →</button></div>' +
    '<div class="phase-tabs">' + phases.map((p, i) => '<button data-phase="' + i + '" class="' + (state.vocabPhase === i ? 'active' : '') + ' ' + (s > i ? 'done' : '') + '"><i>' + p[0] + '</i><span>' + p[1] + '</span><small>' + (s > i ? '✓' : i + 1) + '</small></button>').join('') + '</div>' +
    '<div class="vocab-layout"><section class="panel memory-panel"><div class="panel-top"><span>Từ ' + (state.card + 1) + '/' + learningTerms.length + ' · tiến độ ' + s + '/4</span><button id="nextWord">Từ khác →</button></div>' + task + '</section>' +
    '<section class="panel"><label class="search">⌕ <input id="termSearch" placeholder="Tìm Hán tự, pinyin, Hán Việt, nghĩa..."></label><div class="word-filter"><button id="weakWords">Chỉ từ chưa nhớ</button><span>' + state.progress.mastered.length + '/' + learningTerms.length + ' từ đạt 4/4</span></div><div id="wordlist" class="word-list">' + renderWordList(learningTerms) + '</div></section></div>';
}


function reviewView() {
  if (state.reviewFeedback) {
    const f = state.reviewFeedback;
    const v = learningTerms.find(x => x.hanzi === f.hanzi);
    const m = memoryMeta(f.hanzi);
    return h('SPACED RETRIEVAL', 'Ôn cách quãng', 'Mỗi lần gọi lại đúng sẽ kéo dài khoảng ôn; quên sẽ quay lại bước Hiểu để học lại.') +
      '<section class="panel review-feedback ' + (f.ok ? 'good-card' : 'bad-card') + '"><span>' + (f.ok ? '✓ GỌI LẠI ĐÚNG' : '↺ CẦN HỌC LẠI') + '</span><b>' + v.hanzi + '</b><h2>' + v.hv + '</h2><p>' + v.pinyin + ' · ' + v.meaning + '</p>' +
      (f.ok ? '<small>Lần ôn kế tiếp sau khoảng ' + dueLabel(m.due) + ' · cấp bền ' + m.level + '/6</small>' : '<small>Từ đã quay về bước Hiểu; cần hoàn thành lại Hiểu → Nhớ trước khi lên lịch mới.</small>') +
      '<button id="continueReview" class="primary">Tiếp tục ôn →</button><button id="exitReview">Về học từ mới</button></section>';
  }
  const due = dueTerms();
  if (!due.length) {
    return h('SPACED RETRIEVAL', 'Không còn từ đến hạn', 'Các từ đã nhớ sẽ tự xuất hiện lại khi đến lịch ôn tiếp theo.') +
      '<section class="panel review-empty"><b>✓</b><h2>Đã xử lý hết lượt ôn hiện tại</h2><p>Tiếp tục học từ mới hoặc quay lại sau khi có từ đến hạn.</p><button id="exitReview" class="primary">Về học từ vựng</button></section>';
  }
  const v = due[0];
  const idx = learningTerms.indexOf(v);
  const m = memoryMeta(v.hanzi);
  const reverse = m.reviews % 2 === 1;
  const correct = reverse ? v.hanzi : v.hv + ' · ' + v.meaning;
  const opts = optionsFor(idx, reverse ? x => x.hanzi : x => x.hv + ' · ' + x.meaning);
  return h('SPACED RETRIEVAL', 'Ôn đến hạn · ' + due.length + ' từ', 'Luân phiên hai chiều Hán tự → nghĩa và nghĩa → Hán tự để giảm học thuộc theo một chiều.') +
    '<section class="panel review-card"><div class="review-meta"><span>Cấp bền ' + m.level + '/6</span><span>Đúng liên tiếp ' + m.streak + '</span><span>Quên ' + m.lapses + ' lần</span></div>' +
    (reverse ? '<span class="memory-kicker">NGHĨA → CHỮ HÁN</span><h2>' + v.hv + '</h2><p>' + v.meaning + '</p>' : '<span class="memory-kicker">CHỮ HÁN → NGHĨA</span><b class="review-hanzi">' + v.hanzi + '</b><p class="pinyin">' + v.pinyin + '</p>') +
    '<div class="memory-options review-options">' + opts.map(o => '<button data-review-value="' + safe(o) + '" data-correct="' + safe(correct) + '">' + o + '</button>').join('') + '</div><button id="exitReview" class="review-exit">Thoát lượt ôn</button></section>';
}

function activeReadings() {
  return state.readingTopic === 'all' ? readingBank : readingBank.filter(r => r.topic === state.readingTopic);
}

function readingView() {
  const list = activeReadings();
  const idx = state.reading % Math.max(1, list.length);
  const r = list[idx];
  const answered = state.readingAnswer !== null;
  const topics = [...new Set(readingBank.map(x => x.topic))];
  const words = r.words || [];
  return h('READING', 'Đọc hiểu chuyên ngành', 'Ngân hàng ' + readingBank.length + ' câu ôn bám tài liệu và đáp án/phụ lục. Mục tiêu: nhớ câu, nhận từ trong ngữ cảnh và phản xạ trắc nghiệm.') +
    '<div class="reading-toolbar"><div class="reading-topics"><button data-reading-topic="all" class="' + (state.readingTopic === 'all' ? 'active' : '') + '">Tất cả · ' + readingBank.length + '</button>' +
    topics.map(t => '<button data-reading-topic="' + t + '" class="' + (state.readingTopic === t ? 'active' : '') + '">' + t + ' · ' + readingBank.filter(x => x.topic === t).length + '</button>').join('') +
    '</div><button id="randomRead" class="random-read">↻ Câu ngẫu nhiên</button></div>' +
    '<section class="panel reading"><div class="read-count">CÂU ' + (idx + 1) + ' / ' + list.length + ' · ' + r.topic + '</div><div class="reading-source">Nguồn: ' + (r.source || 'Tài liệu CLB cung cấp') + '</div><h2>' + r.title + '</h2><div class="han-line"><span>' + r.han + '</span><button class="speak light" data-speak="' + r.han + '">🔊</button></div><p class="pinyin">' + r.pinyin + '</p><details><summary>Xem nghĩa tiếng Việt</summary><p>' + r.vi + '</p></details><h3>' + r.q + '</h3><div class="options">' +
    r.options.map((o, i) => '<button data-read="' + i + '" class="' + (answered ? (i === r.answer ? 'correct' : i === state.readingAnswer ? 'wrong' : '') : '') + '"><span>' + String.fromCharCode(65 + i) + '</span>' + o + '</button>').join('') +
    '</div>' + (answered ? '<div class="feedback ' + (state.readingAnswer === r.answer ? 'good' : 'bad') + '">' + (state.readingAnswer === r.answer ? 'Chính xác. +15 XP' : 'Chưa đúng. Đáp án: ' + r.options[r.answer]) + '</div>' : '') +
    (answered && words.length ? '<div class="reading-words"><span>TỪ LIÊN QUAN CẦN NHỚ</span>' + words.map(w => '<button data-speak="' + w[0] + '"><b>' + w[0] + '</b><strong>' + w[1] + '</strong><small>' + w[2] + '</small></button>').join('') + '</div>' : '') +
    '<div class="pager"><button id="prevRead">← Câu trước</button><button id="nextRead">Câu tiếp →</button></div></section>';
}

function radicalsView() {
  const q = state.radicalQuery.trim().toLowerCase();
  const list = radicals214.filter(r => !q || [r.no, r.hanzi, r.pinyin, r.hv, r.meaning].some(x => String(x).toLowerCase().includes(q)));
  return h('CHARACTER LAB', '214 bộ thủ', 'Dùng bộ thủ để tăng khả năng nhìn và nhận diện cấu trúc chữ.') +
    '<label class="search wide">⌕ <input id="radicalSearch" value="' + safe(state.radicalQuery) + '" placeholder="Tìm số, bộ, pinyin, Hán Việt, nghĩa..."></label><div class="radical-count">' + list.length + ' / 214 bộ thủ</div>' +
    '<div class="radicals all">' + list.map(r => '<button data-speak="' + r.hanzi.split(' ')[0] + '" class="radical"><em>#' + r.no + '</em><b>' + r.hanzi + '</b><strong>' + r.pinyin + ' · ' + r.hv + '</strong><small>' + r.meaning + '</small><i>🔊</i></button>').join('') + '</div>';
}

function newQuiz() {
  const pool = state.quizMode === 'pathology'
    ? pathologyQuiz
    : state.quizMode === 'book'
      ? bookOriginalQuiz
      : state.quizMode === 'herbs'
        ? herbsFormulasQuiz
        : quizBank;
  state.quiz = prepareQuizRound(pool);
  state.quizIndex = 0;
  state.quizAnswers = {};
}

function quizView() {
  const modeSwitch =
    '<div class="quiz-modes">' +
    '<button data-quizmode="mixed" class="' + (state.quizMode === 'mixed' ? 'active' : '') + '">Tổng hợp · ' + quizBank.length + '</button>' +
    '<button data-quizmode="herbs" class="' + (state.quizMode === 'herbs' ? 'active' : '') + '">Dược liệu · ' + herbsFormulasQuiz.length + '</button>' +
    '<button data-quizmode="pathology" class="' + (state.quizMode === 'pathology' ? 'active' : '') + '">Bệnh lý · ' + pathologyQuiz.length + '</button>' +
    '<button data-quizmode="book" class="' + (state.quizMode === 'book' ? 'active' : '') + '">Gốc sách · ' + bookOriginalQuiz.length + '</button></div>' +
    (state.quizMode === 'herbs'
      ? '<div class="clinical-note">20 câu bám trực tiếp PPT “Dược liệu và phương tễ trong YHCT”: dược liệu, bào chế, phương tễ, cách dùng và lưu ý an toàn.</div>'
      : state.quizMode === 'pathology'
        ? '<div class="clinical-note">Câu hỏi bệnh lý chỉ bám tài liệu đã cung cấp; dùng cho học thuật/ngôn ngữ chuyên ngành, không thay thế chẩn đoán lâm sàng.</div>'
        : state.quizMode === 'book'
          ? '<div class="clinical-note">Đây là các câu 5.1 判断正误 có thật trong giáo trình. Sách không trình bày chúng dưới dạng A–D; app giữ nguyên nội dung và dùng lựa chọn √ Đúng / × Sai, đối chiếu đáp án phụ lục.</div>'
          : '');

  const modeCount = state.quizMode === 'herbs'
    ? herbsFormulasQuiz.length
    : state.quizMode === 'book'
      ? bookOriginalQuiz.length
      : state.quizMode === 'pathology'
        ? pathologyQuiz.length
        : quizBank.length;

  const modeTitle = state.quizMode === 'herbs'
    ? 'Dược liệu & Phương tễ'
    : state.quizMode === 'pathology'
      ? 'Trắc nghiệm bệnh lý theo tài liệu'
      : state.quizMode === 'book'
        ? 'Câu hỏi trắc nghiệm gốc trong sách'
        : 'Phòng trắc nghiệm';

  const modeDescription = state.quizMode === 'herbs'
    ? 'Mỗi lượt lấy 10 câu từ ngân hàng 20 câu của bài Dược liệu & Phương tễ.'
    : state.quizMode === 'pathology'
      ? 'Mỗi lượt lấy 10 câu bệnh lý/chẩn đoán chỉ từ tài liệu nguồn.'
      : state.quizMode === 'book'
        ? 'Mỗi lượt lấy 10 câu từ 23 câu 判断正误 có sẵn trong giáo trình và đối chiếu đáp án phụ lục.'
        : 'Mỗi lượt lấy 10 câu từ ngân hàng ' + quizBank.length + ' câu.';

  if (state.quizIndex >= state.quiz.length) {
    const score = state.quiz.reduce((n, q, i) => n + (state.quizAnswers[i] === q.a ? 1 : 0), 0);
    const resultTitle = state.quizMode === 'herbs'
      ? 'Kết quả Dược liệu & Phương tễ'
      : state.quizMode === 'pathology'
        ? 'Kết quả trắc nghiệm bệnh lý'
        : state.quizMode === 'book'
          ? 'Kết quả câu hỏi gốc trong sách'
          : 'Hoàn thành lượt trắc nghiệm';
    return h('KẾT QUẢ', resultTitle, 'Đối chiếu lại từ sai với vòng học từ vựng và đúng nguồn tài liệu.') + modeSwitch +
      '<section class="panel result"><div class="score"><b>' + score + '</b><span>/10</span></div><h2>' + (score >= 8 ? 'Rất tốt' : score >= 6 ? 'Đạt nền tảng' : 'Cần ôn lại từ') + '</h2><p>Ngân hàng chế độ này có ' + modeCount + ' câu bám nguồn.</p><button id="restart" class="primary">Làm lượt mới</button><div class="review">' +
      state.quiz.map((q, i) => '<div class="' + (state.quizAnswers[i] === q.a ? 'ok' : 'no') + '"><b>' + (i + 1) + '</b><span>' + q.q + '<small>Đúng: ' + q.o[q.a] + (q.explain ? ' · ' + q.explain : '') + (q.source ? ' · Nguồn: ' + q.source : '') + '</small></span><i>' + (state.quizAnswers[i] === q.a ? '✓' : '✕') + '</i></div>').join('') +
      '</div></section>';
  }

  const q = state.quiz[state.quizIndex];
  const selected = state.quizAnswers[state.quizIndex];
  const categoryLabel = state.quizMode === 'mixed' ? 'Ngân hàng nguồn: ' + quizBank.length : (q.category || 'Nguồn tài liệu');
  return h('MOCK QUIZ', modeTitle, modeDescription) + modeSwitch +
    '<section class="panel quiz"><div class="quiz-meta"><span>Câu ' + (state.quizIndex + 1) + '/10</span><span>' + categoryLabel + '</span></div>' + (q.source ? '<div class="case-source">Nguồn: ' + q.source + '</div>' : '') + '<div class="track"><i style="width:' + ((state.quizIndex + 1) * 10) + '%"></i></div><h2>' + q.q + '</h2><div class="options">' +
    q.o.map((o, i) => '<button data-quiz="' + i + '" class="' + (selected === i ? 'selected' : '') + '"><span>' + String.fromCharCode(65 + i) + '</span>' + o + '</button>').join('') +
    '</div><div class="pager"><button id="prevQuiz" ' + (state.quizIndex === 0 ? 'disabled' : '') + '>← Trước</button><button id="nextQuiz" class="primary" ' + (selected === undefined ? 'disabled' : '') + '>' + (state.quizIndex === 9 ? 'Nộp bài' : 'Câu tiếp →') + '</button></div></section>';
}

function answersView() {
  const key = answerKeys.find(x => x.lesson === state.answerLesson) || answerKeys[0];
  const sourcePages = appendixSource.pages.filter(p => {
    const [a, b] = key.pages.split('–').map(Number);
    return p.page >= a && p.page <= b;
  });
  return h('ANSWER APPENDIX', 'Đáp án & phụ lục', 'Dùng để tự kiểm tra sau khi làm bài. Không nên mở đáp án trước khi thử nhớ.') +
    '<div class="answer-tabs">' + answerKeys.map(x => '<button data-answer-lesson="' + x.lesson + '" class="' + (x.lesson === key.lesson ? 'active' : '') + '"><b>' + x.lesson + '</b><span>' + x.han + '</span><small>' + x.title + '</small></button>').join('') + '</div>' +
    '<section class="panel answer-head"><span>PDF trang ' + key.pages + '</span><h2>' + key.han + ' · ' + key.title + '</h2><p>Từ khóa trọng tâm: ' + key.focus.join(' · ') + '</p><b>' + key.check + '</b></section>' +
    '<div class="answer-pages">' + sourcePages.map(p => '<details><summary>Trang PDF ' + p.page + ' — mở đáp án</summary><pre>' + safe(p.text) + '</pre></details>').join('') + '</div>' +
    '<div class="note"><b>Bài 8:</b> nguồn giáo trình không có phần đáp án riêng cho Bài 8 trong phụ lục; sau đáp án Bài 7 chuyển thẳng sang Tài liệu tham khảo.</div>' +
    h('PHỤ LỤC', 'Tài liệu tham khảo', 'Danh mục được giữ theo trang nguồn.') +
    '<div class="reference-list">' + appendixReferences.map((x, i) => '<div><b>' + (i + 1) + '</b><span>' + x + '</span></div>').join('') + '</div>';
}

function libraryView() {
  let docs = sources;
  const query = state.sourceQuery.trim().toLowerCase();
  if (state.source !== 'all') docs = docs.filter(d => d.id === state.source);
  const results = [];
  for (const d of docs) for (const p of d.pages) if (!query || p.text.toLowerCase().includes(query)) results.push({ doc: d, page: p });
  return h('SOURCE LIBRARY', 'Kho tài liệu đã chuyển', 'Tìm trực tiếp trong bài học, đáp án và phụ lục.') +
    '<div class="library-tools"><select id="sourceSelect"><option value="all">Tất cả nguồn</option>' + sources.map(s => '<option value="' + s.id + '" ' + (state.source === s.id ? 'selected' : '') + '>' + s.title + '</option>').join('') + '</select><label class="search">⌕ <input id="sourceSearch" value="' + safe(state.sourceQuery) + '" placeholder="Tìm chữ Hán, tiếng Việt, đáp án..."></label></div>' +
    '<div class="source-summary compact">' + sources.map(s => '<button data-source-open="' + s.id + '" class="' + (state.source === s.id ? 'picked' : '') + '"><b>' + s.title + '</b><span>' + s.status + '</span><i>' + s.pages.length + '/' + s.total + ' trang/bản ghi →</i></button>').join('') + '</div>' +
    '<div class="library-count">' + results.length + ' trang/bản ghi phù hợp</div><div class="page-grid">' +
    results.slice(0, 140).map(x => '<article class="source-page"><header><b>' + x.doc.title + '</b><span>Trang ' + x.page.page + '</span></header><pre>' + safe(x.page.text) + '</pre></article>').join('') +
    '</div>' + (results.length > 140 ? '<div class="note">Đang hiển thị 140 kết quả đầu. Dùng bộ lọc để thu hẹp.</div>' : '');
}

function progressView() {
  const stageCounts = [0, 1, 2, 3, 4].map(s => learningTerms.filter(v => stage(v.hanzi) === s).length);
  const pct = Math.round(stageCounts[4] / Math.max(1, learningTerms.length) * 100);
  const due = dueTerms().length;
  const durable = durableTerms().length;
  const lapses = Object.values(state.progress.memorySchedule || {}).reduce((n, x) => n + (x.lapses || 0), 0);
  return h('DASHBOARD', 'Tiến độ học tập', 'Theo dõi đúng 4 mức của từng từ, thay vì chỉ đếm số thẻ đã mở.') +
    '<section class="stats">' + stat('⏱', due, 'Đến hạn ôn') + stat('稳', durable, 'Bền ≥14 ngày') + stat('↺', lapses, 'Lượt quên') + stat('记', stageCounts[4], 'Đang ở mức Nhớ') + '</section>' +
    '<section class="panel progress"><div><h3>Mức làm chủ kho từ</h3><b>' + pct + '%</b></div><div class="master"><i style="width:' + pct + '%"></i></div><p>' + stageCounts[4] + ' / ' + learningTerms.length + ' thuật ngữ đang ở mức Nhớ; ' + durable + ' từ đã vượt mốc ôn 14 ngày.</p><button id="progressDueReview" class="primary" ' + (due ? '' : 'disabled') + '>Ôn ' + due + ' từ đến hạn</button></section>' +
    '<section>' + h('LỊCH SỬ', 'Lượt trắc nghiệm gần đây', '') + '<div class="history">' + (state.progress.quizHistory.length ? state.progress.quizHistory.map((x, i) => '<div><span>Lượt ' + (i + 1) + '</span><b>' + x.score + '/10</b><small>' + new Date(x.at).toLocaleString('vi-VN') + '</small></div>').join('') : '<div class="empty">Chưa có lượt thi.</div>') + '</div></section>';
}

function currentViewBody() {
  switch (state.view) {
    case 'lessons': return lessonsView();
    case 'vocab': return vocabView();
    case 'writing': return writingPracticeView(learningTerms, access.member?.mssv || 'member');
    case 'reading': return readingView();
    case 'radicals': return radicalsView();
    case 'quiz': return quizView();
    case 'answers': return answersView();
    case 'library': return libraryView();
    case 'progress': return progressView();
    case 'admin': return adminView();
    default: return home();
  }
}

function syncShellChrome() {
  document.querySelectorAll('.shell aside nav [data-nav], .shell .bottom [data-nav], .shell .top [data-nav]').forEach(button => {
    button.classList.toggle('active', button.dataset.nav === state.view);
  });

  const streak = document.querySelector('.top .streak');
  if (streak) streak.textContent = '🔥 ' + state.progress.xp + ' XP';

  document.querySelectorAll('.ui-mode-switch [data-ui-mode]').forEach(button => {
    button.classList.toggle('active', button.dataset.uiMode === uiMode);
  });

  const aside = document.querySelector('.shell aside');
  if (aside) {
    aside.querySelector('.desktop-leaderboard')?.remove();
    const leaderboard = leaderboardMarkup();
    if (leaderboard) aside.querySelector('.side-note')?.insertAdjacentHTML('beforebegin', leaderboard);
  }
}

function render(forceShell = false) {
  const app = document.querySelector('#app');
  if (!access.ready) {
    app.innerHTML = authLoadingView();
    return;
  }
  if (!access.member) {
    app.innerHTML = loginView();
    bindAccessGate();
    return;
  }

  const body = currentViewBody();
  const shellRoot = app.querySelector('.shell');
  const sameMemberShell = shellRoot
    && shellRoot.dataset.member === String(access.member.mssv || '')
    && shellRoot.dataset.role === String(access.member.role || '');

  if (!forceShell && sameMemberShell) {
    const content = app.querySelector('.content');
    if (content) {
      const activeElement = document.activeElement;
      const activeAdminFieldId = content.contains(activeElement)
        && ['adminAddMssv', 'adminAddName'].includes(activeElement.id)
        ? activeElement.id
        : '';
      const selectionStart = activeAdminFieldId ? activeElement.selectionStart : null;
      const selectionEnd = activeAdminFieldId ? activeElement.selectionEnd : null;
      content.innerHTML = body;
      if (activeAdminFieldId) {
        const replacement = content.querySelector('#' + activeAdminFieldId);
        if (replacement) {
          replacement.focus({ preventScroll: true });
          if (selectionStart !== null && selectionEnd !== null) replacement.setSelectionRange(selectionStart, selectionEnd);
        }
      }
      syncShellChrome();
      bind(false);
      return;
    }
  }

  app.innerHTML = shell(body);
  bind(true);
}

function bind(fullShell = true) {
  if (fullShell) {
    document.querySelectorAll('[data-ui-mode]').forEach(button => button.addEventListener('click', () => setUiMode(button.dataset.uiMode)));

    const logout = document.querySelector('#authLogout');
    if (logout) logout.addEventListener('click', handleLogout);

    const pwaInstall = document.querySelector('#pwaInstall');
    if (pwaInstall) pwaInstall.addEventListener('click', requestPwaInstall);
    const pwaDismiss = document.querySelector('#pwaDismiss');
    if (pwaDismiss) pwaDismiss.addEventListener('click', dismissPwaReminder);

    document.querySelectorAll('.shell aside [data-nav], .shell .top [data-nav], .shell .bottom [data-nav]').forEach(e => {
      e.addEventListener('click', () => nav(e.dataset.nav));
    });
  }

  bindAdmin();
  if (scope.querySelector('#writingCanvas')) bindWritingPractice(scope, learningTerms, access.member?.mssv || 'member', () => render());
  const scope = document.querySelector('.content') || document;
  scope.querySelectorAll('[data-nav]').forEach(e => e.addEventListener('click', () => nav(e.dataset.nav)));
  scope.querySelectorAll('[data-speak]').forEach(e => e.addEventListener('click', () => speak(e.dataset.speak)));
  scope.querySelectorAll('[data-source-open]').forEach(e => e.addEventListener('click', () => { state.source = e.dataset.sourceOpen; state.sourceQuery = ''; nav('library'); }));
  scope.querySelectorAll('[data-answer-lesson]').forEach(e => e.addEventListener('click', () => { state.answerLesson = Number(e.dataset.answerLesson); render(); }));
  scope.querySelectorAll('[data-phase]').forEach(e => e.addEventListener('click', () => { state.vocabPhase = Number(e.dataset.phase); state.vocabFeedback = null; state.recallRevealed = false; render(); }));

  const phaseNext = document.querySelector('#phaseNext');
  if (phaseNext) phaseNext.addEventListener('click', () => { setStage(learningTerms[state.card].hanzi, 1); state.vocabPhase = 1; render(); });

  scope.querySelectorAll('[data-vchoice]').forEach(e => e.addEventListener('click', () => {
    const v = learningTerms[state.card];
    const correct = v.hv + ' · ' + v.meaning;
    if (e.dataset.value === correct) {
      setStage(v.hanzi, 2);
      state.progress.xp += 4;
      save();
      state.vocabFeedback = 'ok';
      setTimeout(() => { state.vocabPhase = 2; state.vocabFeedback = null; render(); }, 450);
    } else {
      if (!state.progress.difficult.includes(v.hanzi)) state.progress.difficult.push(v.hanzi);
      save();
      state.vocabFeedback = 'bad';
      render();
    }
  }));

  scope.querySelectorAll('[data-gchoice]').forEach(e => e.addEventListener('click', () => {
    const v = learningTerms[state.card];
    if (e.dataset.value === v.group) {
      setStage(v.hanzi, 3);
      state.progress.xp += 5;
      save();
      state.vocabFeedback = 'ok';
      setTimeout(() => { state.vocabPhase = 3; state.vocabFeedback = null; render(); }, 450);
    } else {
      state.vocabFeedback = 'bad';
      render();
    }
  }));

  const reveal = document.querySelector('#revealRecall');
  if (reveal) reveal.addEventListener('click', () => { state.recallRevealed = true; render(); });
  const rememberYes = document.querySelector('#rememberYes');
  if (rememberYes) rememberYes.addEventListener('click', () => {
    const v = learningTerms[state.card];
    setStage(v.hanzi, 4);
    scheduleFirstReview(v.hanzi);
    state.progress.xp += 8;
    save();
    nextCard();
  });
  const rememberNo = document.querySelector('#rememberNo');
  if (rememberNo) rememberNo.addEventListener('click', () => {
    const v = learningTerms[state.card];
    state.progress.wordStage[v.hanzi] = 1;
    memoryMeta(v.hanzi).due = 0;
    if (!state.progress.difficult.includes(v.hanzi)) state.progress.difficult.push(v.hanzi);
    save();
    state.vocabPhase = 1;
    state.recallRevealed = false;
    render();
  });
  const nextWord = document.querySelector('#nextWord');
  if (nextWord) nextWord.addEventListener('click', nextCard);
  const startDueReview = document.querySelector('#startDueReview');
  if (startDueReview) startDueReview.addEventListener('click', () => { state.reviewMode = true; state.reviewFeedback = null; render(); });
  const homeDueReview = document.querySelector('#homeDueReview');
  if (homeDueReview) homeDueReview.addEventListener('click', () => { state.view = 'vocab'; state.reviewMode = true; state.reviewFeedback = null; render(); });
  const progressDueReview = document.querySelector('#progressDueReview');
  if (progressDueReview) progressDueReview.addEventListener('click', () => { state.view = 'vocab'; state.reviewMode = true; state.reviewFeedback = null; render(); });
  const exitReview = document.querySelector('#exitReview');
  if (exitReview) exitReview.addEventListener('click', () => { state.reviewMode = false; state.reviewFeedback = null; render(); });
  const continueReview = document.querySelector('#continueReview');
  if (continueReview) continueReview.addEventListener('click', () => { state.reviewFeedback = null; render(); });
  scope.querySelectorAll('[data-review-value]').forEach(e => e.addEventListener('click', () => {
    const v = dueTerms()[0];
    if (!v) return;
    const ok = e.dataset.value === e.dataset.correct;
    if (ok) reviewSuccess(v.hanzi); else reviewFail(v.hanzi);
    state.reviewFeedback = { hanzi: v.hanzi, ok };
    render();
  }));

  const ts = document.querySelector('#termSearch');
  if (ts) ts.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const list = learningTerms.filter(v => [v.hanzi, v.pinyin, v.hv, v.meaning, v.group].some(x => x.toLowerCase().includes(q)));
    document.querySelector('#wordlist').innerHTML = renderWordList(list);
    bindWordClicks();
  });
  const weak = document.querySelector('#weakWords');
  if (weak) weak.addEventListener('click', () => {
    document.querySelector('#wordlist').innerHTML = renderWordList(learningTerms.filter(v => stage(v.hanzi) < 4));
    bindWordClicks();
  });
  bindWordClicks();

  scope.querySelectorAll('[data-read]').forEach(e => e.addEventListener('click', () => {
    const i = Number(e.dataset.read), list = activeReadings(), r = list[state.reading % list.length];
    state.readingAnswer = i;
    if (i === r.answer && !state.progress.readingDone.includes(r.title)) {
      state.progress.readingDone.push(r.title);
      state.progress.xp += 15;
      save();
    }
    render();
  }));
  const pr = document.querySelector('#prevRead');
  if (pr) pr.addEventListener('click', () => { const list = activeReadings(); state.reading = (state.reading - 1 + list.length) % list.length; state.readingAnswer = null; render(); });
  const nr = document.querySelector('#nextRead');
  if (nr) nr.addEventListener('click', () => { const list = activeReadings(); state.reading = (state.reading + 1) % list.length; state.readingAnswer = null; render(); });
  scope.querySelectorAll('[data-reading-topic]').forEach(e => e.addEventListener('click', () => { state.readingTopic = e.dataset.readingTopic; state.reading = 0; state.readingAnswer = null; render(); }));
  const randomRead = document.querySelector('#randomRead');
  if (randomRead) randomRead.addEventListener('click', () => { const list = activeReadings(); state.reading = Math.floor(Math.random() * list.length); state.readingAnswer = null; render(); });

  const rs = document.querySelector('#radicalSearch');
  if (rs) rs.addEventListener('input', e => { state.radicalQuery = e.target.value; render(); });

  scope.querySelectorAll('[data-quizmode]').forEach(e => e.addEventListener('click', () => { state.quizMode = e.dataset.quizmode; newQuiz(); render(); }));
  scope.querySelectorAll('[data-quiz]').forEach(e => e.addEventListener('click', () => { state.quizAnswers[state.quizIndex] = Number(e.dataset.quiz); render(); }));
  const pq = document.querySelector('#prevQuiz');
  if (pq) pq.addEventListener('click', () => { if (state.quizIndex > 0) { state.quizIndex--; render(); } });
  const nq = document.querySelector('#nextQuiz');
  if (nq) nq.addEventListener('click', () => {
    if (state.quizAnswers[state.quizIndex] === undefined) return;
    if (state.quizIndex === 9) {
      const score = state.quiz.reduce((n, q, i) => n + (state.quizAnswers[i] === q.a ? 1 : 0), 0);
      state.progress.quizHistory.unshift({ score, at: new Date().toISOString() });
      state.progress.quizHistory = state.progress.quizHistory.slice(0, 8);
      state.progress.xp += score * 10;
      save();
      state.quizIndex = 10;
    } else state.quizIndex++;
    render();
  });
  const re = document.querySelector('#restart');
  if (re) re.addEventListener('click', () => { newQuiz(); render(); });

  const ss = document.querySelector('#sourceSelect');
  if (ss) ss.addEventListener('change', e => { state.source = e.target.value; render(); });
  const sq = document.querySelector('#sourceSearch');
  if (sq) sq.addEventListener('input', e => { state.sourceQuery = e.target.value; render(); });
}

function bindWordClicks() {
  document.querySelectorAll('[data-term-index]').forEach(x => x.addEventListener('click', () => {
    state.card = Number(x.dataset.termIndex);
    state.vocabPhase = Math.min(stage(learningTerms[state.card].hanzi), 3);
    state.vocabFeedback = null;
    state.recallRevealed = false;
    render();
  }));
}

applyUiMode();
setupPwa();
render();
bootstrapAccess();
setInterval(verifyAccessHeartbeat, 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    verifyAccessHeartbeat();
    trackVisitOnce().then(() => {
      if (uiMode === 'desktop') loadDesktopUsageInsights();
    });
  }
});