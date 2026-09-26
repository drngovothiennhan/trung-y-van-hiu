import { createClient } from 'npm:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = new Set([
  'https://drngovothiennhan.github.io',
  'https://hiutmc.com',
  'https://trung-y-van-hiu-t6bans.v2.appdeploy.ai',
])
const SESSION_MS = 24 * 60 * 60 * 1000
const THROTTLE_WINDOW_MS = 15 * 60 * 1000
const THROTTLE_BLOCK_MS = 15 * 60 * 1000
const MAX_FAILURES = 5

const url = Deno.env.get('SUPABASE_URL')!
const secretJson = Deno.env.get('SUPABASE_SECRET_KEYS')
const secretKey = secretJson ? JSON.parse(secretJson).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const db = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })

function cors(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://drngovothiennhan.github.io'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function clientIp(req: Request) {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown'
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function ipHash(req: Request) {
  return sha256('ip:' + clientIp(req) + ':' + secretKey.slice(0, 32))
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

const DAY_MS = 24 * 60 * 60 * 1000
const VN_OFFSET_MS = 7 * 60 * 60 * 1000

function vnDayRange(offsetDays = 0) {
  const shifted = new Date(Date.now() + VN_OFFSET_MS)
  const baseStart = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    -7, 0, 0, 0,
  )
  const startMs = baseStart + offsetDays * DAY_MS
  return {
    date: new Date(startMs + VN_OFFSET_MS).toISOString().slice(0, 10),
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + DAY_MS).toISOString(),
  }
}

function vnDateOf(value: string) {
  return new Date(new Date(value).getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}

async function audit(studentCode: string | null, action: string, ip: string | null, detail: Record<string, unknown> = {}) {
  await db.from('trung_y_van_audit').insert({ student_code: studentCode, action, ip_hash: ip, detail })
}

async function throttleCheck(key: string) {
  const { data } = await db.from('trung_y_van_login_throttle').select('*').eq('throttle_key', key).maybeSingle()
  if (!data) return { blocked: false, row: null }
  if (data.blocked_until && new Date(data.blocked_until).getTime() > Date.now()) return { blocked: true, row: data }
  return { blocked: false, row: data }
}

async function throttleFail(key: string, row: any) {
  const now = Date.now()
  const inWindow = row && now - new Date(row.window_started_at).getTime() <= THROTTLE_WINDOW_MS
  const failures = inWindow ? Number(row.failures || 0) + 1 : 1
  const blocked = failures >= MAX_FAILURES
  await db.from('trung_y_van_login_throttle').upsert({
    throttle_key: key,
    failures,
    window_started_at: inWindow ? row.window_started_at : new Date(now).toISOString(),
    blocked_until: blocked ? new Date(now + THROTTLE_BLOCK_MS).toISOString() : null,
    updated_at: new Date(now).toISOString(),
  })
}

async function verifySession(req: Request, token: string, requireAdmin = false) {
  if (!token || token.length < 20) return { ok: false as const, status: 401, code: 'NO_SESSION' }
  const tokenHash = await sha256(token)
  const currentIp = await ipHash(req)
  const { data: session } = await db.from('trung_y_van_sessions').select('*').eq('token_hash', tokenHash).maybeSingle()
  if (!session || session.revoked_at) return { ok: false as const, status: 401, code: 'SESSION_INVALID' }
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await db.from('trung_y_van_sessions').delete().eq('token_hash', tokenHash)
    return { ok: false as const, status: 401, code: 'SESSION_EXPIRED' }
  }

  const { data: account } = await db.from('trung_y_van_accounts').select('id,student_code,display_name,role,status').eq('id', session.account_id).maybeSingle()
  if (!account || account.status !== 'approved') return { ok: false as const, status: 403, code: 'ACCOUNT_NOT_APPROVED' }

  // Member accounts remain locked to the IP that created the session.
  // Admin accounts are intentionally exempt so the admin can use multiple devices/IPs.
  if (account.role !== 'admin' && session.ip_hash !== currentIp) {
    await audit(account.student_code, 'session_ip_mismatch', currentIp, { account_id: session.account_id })
    return { ok: false as const, status: 401, code: 'IP_MISMATCH' }
  }

  if (requireAdmin && account.role !== 'admin') return { ok: false as const, status: 403, code: 'ADMIN_REQUIRED' }
  const nextExpiry = new Date(Date.now() + SESSION_MS).toISOString()
  await db.from('trung_y_van_sessions')
    .update({ last_seen_at: new Date().toISOString(), expires_at: nextExpiry })
    .eq('token_hash', tokenHash)
  return { ok: true as const, account, ip: currentIp, expiresAt: nextExpiry }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) })
  if (req.method !== 'POST') return json(req, { ok: false, code: 'METHOD_NOT_ALLOWED' }, 405)

  let body: any
  try { body = await req.json() } catch { return json(req, { ok: false, code: 'INVALID_JSON' }, 400) }
  const action = String(body?.action || '')
  const currentIp = await ipHash(req)

  if (action === 'login') {
    const mssv = String(body?.mssv || '').trim()
    const password = String(body?.password || '')
    if (!/^[0-9]{8,14}$/.test(mssv) || !password) return json(req, { ok: false, code: 'INVALID_LOGIN_INPUT' }, 400)

    const throttleKey = await sha256('login:' + currentIp + ':' + mssv)
    const throttle = await throttleCheck(throttleKey)
    if (throttle.blocked) return json(req, { ok: false, code: 'TOO_MANY_ATTEMPTS' }, 429)

    const { data: rows, error } = await db.rpc('trung_y_van_verify_credentials', { p_student_code: mssv, p_password: password })
    const account = !error && Array.isArray(rows) ? rows[0] : null
    if (!account) {
      await throttleFail(throttleKey, throttle.row)
      await audit(mssv, 'login_failed', currentIp)
      return json(req, { ok: false, code: 'INVALID_CREDENTIALS' }, 401)
    }
    if (account.status !== 'approved') {
      await audit(mssv, 'login_blocked_status', currentIp, { status: account.status })
      return json(req, { ok: false, code: account.status === 'suspended' ? 'ACCOUNT_SUSPENDED' : 'WAITING_APPROVAL' }, 403)
    }

    if (account.role !== 'admin') {
      const { data: existingSessions } = await db.from('trung_y_van_sessions').select('*').eq('account_id', account.id)
      const active = (existingSessions || []).find((s: any) => !s.revoked_at && new Date(s.expires_at).getTime() > Date.now())
      const activeNow = !!active
      if (activeNow && active.ip_hash !== currentIp) {
        await audit(mssv, 'login_rejected_other_ip', currentIp)
        return json(req, { ok: false, code: 'ACTIVE_ON_OTHER_IP' }, 409)
      }

      // Keep exactly one session for normal student/member accounts.
      await db.from('trung_y_van_sessions').delete().eq('account_id', account.id)
    }

    const token = randomToken()
    const tokenHash = await sha256(token)
    const uaHash = await sha256(req.headers.get('user-agent') || 'unknown')
    const now = new Date()
    const expires = new Date(now.getTime() + SESSION_MS)
    const { error: sessionError } = await db.from('trung_y_van_sessions').insert({
      account_id: account.id,
      token_hash: tokenHash,
      ip_hash: currentIp,
      user_agent_hash: uaHash,
      created_at: now.toISOString(),
      last_seen_at: now.toISOString(),
      expires_at: expires.toISOString(),
      revoked_at: null,
    })
    if (sessionError) return json(req, { ok: false, code: 'SESSION_CREATE_FAILED' }, 500)

    await db.from('trung_y_van_login_throttle').delete().eq('throttle_key', throttleKey)
    await audit(mssv, 'login_success', currentIp, { role: account.role })
    return json(req, {
      ok: true,
      token,
      expires_at: expires.toISOString(),
      member: { mssv: account.student_code, display_name: account.display_name, role: account.role },
    })
  }

  if (action === 'logout') {
    const token = String(body?.token || '')
    if (!token) return json(req, { ok: true })
    const tokenHash = await sha256(token)
    const { data: session } = await db.from('trung_y_van_sessions').select('account_id').eq('token_hash', tokenHash).maybeSingle()
    if (session) {
      const { data: account } = await db.from('trung_y_van_accounts').select('student_code').eq('id', session.account_id).maybeSingle()
      // Logout only the current token. Other admin sessions remain active.
      await db.from('trung_y_van_sessions').delete().eq('token_hash', tokenHash)
      await audit(account?.student_code || null, 'logout', currentIp)
    }
    return json(req, { ok: true })
  }

  if (action === 'session') {
    const check = await verifySession(req, String(body?.token || ''))
    if (!check.ok) return json(req, { ok: false, code: check.code }, check.status)
    return json(req, {
      ok: true,
      expires_at: check.expiresAt,
      member: { mssv: check.account.student_code, display_name: check.account.display_name, role: check.account.role },
    })
  }

  if (action === 'record_visit') {
    const auth = await verifySession(req, String(body?.token || ''))
    if (!auth.ok) return json(req, { ok: false, code: auth.code }, auth.status)
    const visitKey = String(body?.visit_key || '').trim()
    if (!/^[A-Za-z0-9:_-]{16,120}$/.test(visitKey)) return json(req, { ok: false, code: 'INVALID_VISIT_KEY' }, 400)
    const { error } = await db.from('trung_y_van_access_events').insert({
      account_id: auth.account.id,
      visit_key: visitKey,
      visited_at: new Date().toISOString(),
    })
    if (error && error.code !== '23505') return json(req, { ok: false, code: 'VISIT_RECORD_FAILED' }, 500)
    return json(req, { ok: true })
  }

  if (action === 'leaderboard') {
    const auth = await verifySession(req, String(body?.token || ''))
    if (!auth.ok) return json(req, { ok: false, code: auth.code }, auth.status)
    const range = vnDayRange(0)
    const { data: events, error: eventError } = await db.from('trung_y_van_access_events')
      .select('account_id')
      .gte('visited_at', range.start)
      .lt('visited_at', range.end)
    if (eventError) return json(req, { ok: false, code: 'LEADERBOARD_FAILED' }, 500)

    const counts = new Map<string, number>()
    for (const row of events || []) counts.set(row.account_id, (counts.get(row.account_id) || 0) + 1)
    const ids = [...counts.keys()]
    if (!ids.length) return json(req, { ok: true, date: range.date, leaderboard: [] })

    const { data: accounts, error: accountError } = await db.from('trung_y_van_accounts')
      .select('id,student_code,display_name,role,status')
      .in('id', ids)
      .eq('status', 'approved')
    if (accountError) return json(req, { ok: false, code: 'LEADERBOARD_FAILED' }, 500)

    const leaderboard = (accounts || [])
      .filter((a: any) => a.role !== 'admin')
      .map((a: any) => ({
        mssv: a.student_code,
        display_name: a.display_name || a.student_code,
        visits: counts.get(a.id) || 0,
      }))
      .sort((a: any, b: any) => b.visits - a.visits || String(a.display_name).localeCompare(String(b.display_name), 'vi'))
      .slice(0, 5)
      .map((row: any, index: number) => ({ rank: index + 1, ...row }))

    return json(req, { ok: true, date: range.date, leaderboard })
  }

  if (action === 'user_state_get' || action === 'user_state_save') {
    const auth = await verifySession(req, String(body?.token || ''))
    if (!auth.ok) return json(req, { ok: false, code: auth.code }, auth.status)

    if (action === 'user_state_get') {
      const { data, error } = await db.from('trung_y_van_user_learning_state')
        .select('state,updated_at')
        .eq('account_id', auth.account.id)
        .maybeSingle()
      if (error) return json(req, { ok: false, code: 'USER_STATE_LOAD_FAILED' }, 500)
      return json(req, { ok: true, state: data?.state || {}, updated_at: data?.updated_at || null })
    }

    const userState = body?.state
    if (!userState || typeof userState !== 'object' || Array.isArray(userState)) {
      return json(req, { ok: false, code: 'INVALID_USER_STATE' }, 400)
    }
    const stateBytes = new TextEncoder().encode(JSON.stringify(userState)).length
    if (stateBytes > 200000) return json(req, { ok: false, code: 'INVALID_USER_STATE' }, 413)
    const updatedAt = new Date().toISOString()
    const { error } = await db.from('trung_y_van_user_learning_state').upsert({
      account_id: auth.account.id,
      state: userState,
      updated_at: updatedAt,
    }, { onConflict: 'account_id' })
    if (error) return json(req, { ok: false, code: 'USER_STATE_SAVE_FAILED' }, 500)
    return json(req, { ok: true, updated_at: updatedAt })
  }

  if (action.startsWith('admin_')) {
    const auth = await verifySession(req, String(body?.token || ''), true)
    if (!auth.ok) return json(req, { ok: false, code: auth.code }, auth.status)

    if (action === 'admin_access_stats') {
      const first = vnDayRange(-13)
      const today = vnDayRange(0)
      const { data: events, error } = await db.from('trung_y_van_access_events')
        .select('visited_at')
        .gte('visited_at', first.start)
        .lt('visited_at', today.end)
      if (error) return json(req, { ok: false, code: 'ACCESS_STATS_FAILED' }, 500)

      const counts = new Map<string, number>()
      for (const row of events || []) {
        const date = vnDateOf(row.visited_at)
        counts.set(date, (counts.get(date) || 0) + 1)
      }
      const days = Array.from({ length: 14 }, (_, index) => {
        const day = vnDayRange(index - 13)
        return { date: day.date, visits: counts.get(day.date) || 0 }
      })
      return json(req, {
        ok: true,
        timezone: 'Asia/Ho_Chi_Minh',
        days,
        total_visits: days.reduce((sum, row) => sum + row.visits, 0),
      })
    }

    if (action === 'admin_candidates') {
      const { data: clubRows, error: clubError } = await db.from('club_members')
        .select('student_code,full_name,class_name,status,login_enabled')
        .not('student_code', 'is', null)
        .order('full_name', { ascending: true })
      if (clubError) return json(req, { ok: false, code: 'CANDIDATE_LIST_FAILED' }, 500)

      const { data: authRows, error: authError } = await db.from('trung_y_van_accounts')
        .select('student_code,role,status,approved_at')
      if (authError) return json(req, { ok: false, code: 'ACCOUNT_STATE_FAILED' }, 500)

      const authMap = new Map((authRows || []).map((a: any) => [String(a.student_code || ''), a]))
      const seen = new Set<string>()
      const candidates = []
      for (const row of clubRows || []) {
        const code = String((row as any).student_code || '').trim()
        if (!/^[0-9]{8,14}$/.test(code) || seen.has(code)) continue
        seen.add(code)
        const account: any = authMap.get(code)
        candidates.push({
          mssv: code,
          display_name: (row as any).full_name || null,
          class_name: (row as any).class_name || null,
          membership_status: (row as any).status || null,
          login_enabled: (row as any).login_enabled !== false,
          access_status: account?.status || 'not_added',
          access_role: account?.role || null,
          approved_at: account?.approved_at || null,
        })
      }
      return json(req, { ok: true, candidates })
    }

    if (action === 'admin_list') {
      const { data: accounts, error } = await db.from('trung_y_van_accounts')
        .select('id,student_code,display_name,role,status,approved_at,approved_by,created_at,updated_at')
        .order('created_at', { ascending: false })
      if (error) return json(req, { ok: false, code: 'LIST_FAILED' }, 500)
      const { data: sessions } = await db.from('trung_y_van_sessions').select('account_id,last_seen_at,expires_at,revoked_at')
      const sessionMap = new Map<string, { active: number; lastSeen: string | null }>()
      for (const s of sessions || []) {
        const current = sessionMap.get(s.account_id) || { active: 0, lastSeen: null }
        if (!s.revoked_at && new Date(s.expires_at).getTime() > Date.now()) current.active += 1
        if (!current.lastSeen || new Date(s.last_seen_at).getTime() > new Date(current.lastSeen).getTime()) current.lastSeen = s.last_seen_at
        sessionMap.set(s.account_id, current)
      }
      const members = (accounts || []).map((a: any) => {
        const s = sessionMap.get(a.id)
        return { ...a, session_active: !!s?.active, session_count: s?.active || 0, last_seen_at: s?.lastSeen || null }
      })
      return json(req, { ok: true, members })
    }

    if (action === 'admin_add') {
      const mssv = String(body?.mssv || '').trim()
      const displayName = String(body?.display_name || '').trim()
      if (!/^[0-9]{8,14}$/.test(mssv)) return json(req, { ok: false, code: 'INVALID_STUDENT_CODE' }, 400)
      if (!displayName) return json(req, { ok: false, code: 'DISPLAY_NAME_REQUIRED' }, 400)
      const { data, error } = await db.rpc('trung_y_van_upsert_account', {
        p_student_code: mssv,
        p_display_name: displayName || null,
        p_status: 'approved',
        p_role: 'member',
        p_approved_by: auth.account.student_code,
      })
      if (error) return json(req, { ok: false, code: 'ADD_MEMBER_FAILED' }, 500)
      await audit(mssv, 'admin_add_member', currentIp, { by: auth.account.student_code })
      return json(req, { ok: true, id: data })
    }

    if (action === 'admin_set_status') {
      const mssv = String(body?.mssv || '').trim()
      const status = String(body?.status || '')
      if (!['approved','suspended'].includes(status)) return json(req, { ok: false, code: 'INVALID_STATUS' }, 400)
      const { data: target } = await db.from('trung_y_van_accounts').select('id,role').eq('student_code', mssv).maybeSingle()
      if (!target) return json(req, { ok: false, code: 'MEMBER_NOT_FOUND' }, 404)
      if (target.role === 'admin') return json(req, { ok: false, code: 'CANNOT_CHANGE_ADMIN' }, 400)
      await db.from('trung_y_van_accounts').update({
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        approved_by: auth.account.student_code,
        updated_at: new Date().toISOString(),
      }).eq('id', target.id)
      if (status === 'suspended') await db.from('trung_y_van_sessions').delete().eq('account_id', target.id)
      await audit(mssv, 'admin_set_status', currentIp, { status, by: auth.account.student_code })
      return json(req, { ok: true })
    }

    if (action === 'admin_force_logout') {
      const mssv = String(body?.mssv || '').trim()
      const { data: target } = await db.from('trung_y_van_accounts').select('id').eq('student_code', mssv).maybeSingle()
      if (!target) return json(req, { ok: false, code: 'MEMBER_NOT_FOUND' }, 404)
      await db.from('trung_y_van_sessions').delete().eq('account_id', target.id)
      await audit(mssv, 'admin_force_logout', currentIp, { by: auth.account.student_code })
      return json(req, { ok: true })
    }

    if (action === 'admin_reset_password') {
      const mssv = String(body?.mssv || '').trim()
      const { data, error } = await db.rpc('trung_y_van_reset_password_to_mssv', { p_student_code: mssv })
      if (error || !data) return json(req, { ok: false, code: 'RESET_FAILED' }, 400)
      const { data: target } = await db.from('trung_y_van_accounts').select('id').eq('student_code', mssv).maybeSingle()
      if (target) await db.from('trung_y_van_sessions').delete().eq('account_id', target.id)
      await audit(mssv, 'admin_reset_password', currentIp, { by: auth.account.student_code })
      return json(req, { ok: true })
    }

    return json(req, { ok: false, code: 'UNKNOWN_ADMIN_ACTION' }, 400)
  }

  return json(req, { ok: false, code: 'UNKNOWN_ACTION' }, 400)
})
