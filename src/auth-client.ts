const AUTH_URL = 'https://gzmpnsrwqjpsbklyflqr.supabase.co/functions/v1/trung-y-van-auth';
const PUBLISHABLE_KEY = 'sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG';
const TOKEN_KEY = 'trung-y-van-hiu-access-token-v1';

function authError(code, status = 0) {
  const error = new Error(code || 'AUTH_ERROR');
  error.code = code || 'AUTH_ERROR';
  error.status = status;
  return error;
}

async function request(action, payload = {}, options = {}) {
  let response;
  try {
    response = await fetch(AUTH_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'apikey': PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ action, ...payload }),
      keepalive: options.keepalive === true,
    });
  } catch {
    throw authError('NETWORK_ERROR');
  }

  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok || !data?.ok) throw authError(data?.code || 'AUTH_ERROR', response.status);
  return data;
}

function token() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(value) {
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else { localStorage.removeItem(TOKEN_KEY); clearOfflineGrant(); }
}

// Học ngoại tuyến: sau khi máy chủ xác minh phiên, thiết bị được học tiếp khi mất mạng trong OFFLINE_GRACE_MS
// kể từ lần xác minh gần nhất. Hết hạn, đăng xuất hoặc máy chủ từ chối phiên thì quyền này mất.
const GRANT_KEY = 'trung-y-van-hiu-offline-grant-v1';
export const OFFLINE_GRACE_MS = 72 * 60 * 60 * 1000;

export function saveOfflineGrant(member) {
  if (!member?.mssv) return;
  try {
    localStorage.setItem(GRANT_KEY, JSON.stringify({
      member: { mssv: String(member.mssv), display_name: String(member.display_name || ''), role: member.role === 'admin' ? 'admin' : 'member' },
      verifiedAt: Date.now(),
    }));
  } catch {}
}

export function clearOfflineGrant() {
  try { localStorage.removeItem(GRANT_KEY); } catch {}
}

/** Thành viên đã được xác minh gần đây trên thiết bị này, hoặc null. */
export function readOfflineGrant(now = Date.now()) {
  try {
    if (!token()) return null;
    const grant = JSON.parse(localStorage.getItem(GRANT_KEY) || 'null');
    const verifiedAt = Number(grant?.verifiedAt);
    if (!grant?.member?.mssv || !Number.isFinite(verifiedAt)) return null;
    if (verifiedAt > now + 60 * 1000 || now - verifiedAt > OFFLINE_GRACE_MS) return null;
    return grant.member;
  } catch { return null; }
}

async function withToken(action, payload = {}, options = {}) {
  const current = token();
  if (!current) throw authError('NO_SESSION', 401);
  return request(action, { token: current, ...payload }, options);
}

export const authApi = {
  hasToken: () => !!token(),
  clearToken: () => setToken(''),
  async login(mssv, password) {
    const data = await request('login', { mssv, password });
    setToken(data.token);
    return data;
  },
  async session() {
    return withToken('session');
  },
  async logout() {
    const current = token();
    setToken('');
    if (!current) return { ok: true };
    try { return await request('logout', { token: current }); }
    catch { return { ok: true }; }
  },
  async recordVisit(visit_key) {
    return withToken('record_visit', { visit_key });
  },
  async loadLearningState() {
    return withToken('user_state_get');
  },
  async saveLearningState(state, keepalive = false) {
    return withToken('user_state_save', { state }, { keepalive });
  },
  async leaderboard() {
    return withToken('leaderboard');
  },
  async adminAccessStats() {
    return withToken('admin_access_stats');
  },
  async adminList() {
    return withToken('admin_list');
  },
  async adminCandidates() {
    return withToken('admin_candidates');
  },
  async adminAdd(mssv, display_name) {
    return withToken('admin_add', { mssv, display_name });
  },
  async adminSetStatus(mssv, status) {
    return withToken('admin_set_status', { mssv, status });
  },
  async adminForceLogout(mssv) {
    return withToken('admin_force_logout', { mssv });
  },
  async adminResetPassword(mssv) {
    return withToken('admin_reset_password', { mssv });
  },
};

export function authMessage(code) {
  const map = {
    INVALID_LOGIN_INPUT: 'MSSV hoặc mật khẩu không hợp lệ.',
    INVALID_STUDENT_CODE: 'MSSV phải gồm 8–14 chữ số.',
    DISPLAY_NAME_REQUIRED: 'Bắt buộc có Họ tên trước khi tạo tài khoản học tập.',
    INVALID_CREDENTIALS: 'Sai MSSV hoặc mật khẩu.',
    WAITING_APPROVAL: 'Tài khoản chưa được quản trị viên duyệt.',
    ACCOUNT_SUSPENDED: 'Tài khoản đang bị tạm khóa.',
    DEVICE_LIMIT: 'Tài khoản đã đăng nhập đủ số thiết bị được phép. Đăng xuất một thiết bị cũ hoặc liên hệ admin.',
    ACTIVE_ON_OTHER_IP: 'Tài khoản đang đăng nhập trên một thiết bị khác. Đăng xuất ở thiết bị đó, hoặc liên hệ admin để đăng xuất phiên cũ.',
    TOO_MANY_ATTEMPTS: 'Đăng nhập sai quá nhiều lần. Hãy thử lại sau 15 phút.',
    IP_MISMATCH: 'Phiên này được tạo trên một thiết bị khác nên bị khóa để bảo vệ tài khoản. Hãy đăng nhập lại.',
    SESSION_INVALID: 'Phiên đăng nhập không còn hợp lệ.',
    SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn.',
    ACCOUNT_NOT_APPROVED: 'Tài khoản hiện không còn được phép truy cập.',
    ADMIN_REQUIRED: 'Chỉ tài khoản admin mới được dùng chức năng này.',
    NETWORK_ERROR: 'Không thể xác minh phiên vì mất kết nối mạng. Hãy kết nối mạng rồi thử lại.',
    NO_SESSION: 'Chưa có phiên đăng nhập.',
    ADD_MEMBER_FAILED: 'Không thể duyệt tài khoản này.',
    MEMBER_NOT_FOUND: 'Không tìm thấy thành viên.',
    RESET_FAILED: 'Không thể đặt lại mật khẩu.',
    CANDIDATE_LIST_FAILED: 'Không tải được danh sách thành viên CLB.',
    ACCOUNT_STATE_FAILED: 'Không tải được trạng thái tài khoản hiện tại.',
    LIST_FAILED: 'Không tải được danh sách tài khoản.',
    VISIT_RECORD_FAILED: 'Không thể ghi nhận lượt truy cập.',
    LEADERBOARD_FAILED: 'Không tải được bảng xếp hạng.',
    ACCESS_STATS_FAILED: 'Không tải được thống kê lượt truy cập.',
    USER_STATE_LOAD_FAILED: 'Không tải được tiến độ học từ máy chủ.',
    USER_STATE_SAVE_FAILED: 'Không lưu được tiến độ học lên máy chủ.',
    INVALID_USER_STATE: 'Dữ liệu tiến độ học không hợp lệ.',
  };
  return map[code] || 'Không thể thực hiện yêu cầu. Vui lòng thử lại.';
}