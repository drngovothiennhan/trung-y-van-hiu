const AUTH_URL = 'https://gzmpnsrwqjpsbklyflqr.supabase.co/functions/v1/trung-y-van-auth';
const PUBLISHABLE_KEY = 'sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG';
const TOKEN_KEY = 'trung-y-van-hiu-access-token-v1';

function authError(code, status = 0) {
  const error = new Error(code || 'AUTH_ERROR');
  error.code = code || 'AUTH_ERROR';
  error.status = status;
  return error;
}

async function request(action, payload = {}) {
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
  else localStorage.removeItem(TOKEN_KEY);
}

async function withToken(action, payload = {}) {
  const current = token();
  if (!current) throw authError('NO_SESSION', 401);
  return request(action, { token: current, ...payload });
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
    INVALID_CREDENTIALS: 'Sai MSSV hoặc mật khẩu.',
    WAITING_APPROVAL: 'Tài khoản chưa được quản trị viên duyệt.',
    ACCOUNT_SUSPENDED: 'Tài khoản đang bị tạm khóa.',
    ACTIVE_ON_OTHER_IP: 'Tài khoản đang hoạt động trên một IP khác. Liên hệ admin để đăng xuất phiên cũ.',
    TOO_MANY_ATTEMPTS: 'Đăng nhập sai quá nhiều lần. Hãy thử lại sau 15 phút.',
    IP_MISMATCH: 'IP hiện tại khác IP đã đăng nhập. Phiên bị khóa để bảo vệ tài khoản.',
    SESSION_INVALID: 'Phiên đăng nhập không còn hợp lệ.',
    SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn.',
    ACCOUNT_NOT_APPROVED: 'Tài khoản hiện không còn được phép truy cập.',
    ADMIN_REQUIRED: 'Chỉ tài khoản admin mới được dùng chức năng này.',
    NETWORK_ERROR: 'Không thể xác minh phiên vì mất kết nối mạng. Ứng dụng đang khóa an toàn.',
    NO_SESSION: 'Chưa có phiên đăng nhập.',
    ADD_MEMBER_FAILED: 'Không thể duyệt tài khoản này.',
    MEMBER_NOT_FOUND: 'Không tìm thấy thành viên.',
    RESET_FAILED: 'Không thể đặt lại mật khẩu.',
    CANDIDATE_LIST_FAILED: 'Không tải được danh sách thành viên CLB.',
    ACCOUNT_STATE_FAILED: 'Không tải được trạng thái tài khoản hiện tại.',
    LIST_FAILED: 'Không tải được danh sách tài khoản.',
  };
  return map[code] || 'Không thể thực hiện yêu cầu. Vui lòng thử lại.';
}
