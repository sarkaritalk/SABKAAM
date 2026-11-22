const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const backendConfigured = Boolean(supabaseUrl && publishableKey)

export class BackendError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'BackendError'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  accessToken?: string
  prefer?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!backendConfigured || !supabaseUrl || !publishableKey) {
    throw new BackendError('SABKAAM backend is not configured. Add the Supabase URL and publishable key.')
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${options.accessToken ?? publishableKey}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  })

  const text = await response.text()
  if (!response.ok) {
    let message = text || `Supabase request failed (${response.status})`
    try {
      const payload = JSON.parse(text) as { message?: string; msg?: string; error_description?: string }
      message = payload.message ?? payload.msg ?? payload.error_description ?? message
    } catch { /* Keep the original response text. */ }
    throw new BackendError(message, response.status)
  }
  return (text ? JSON.parse(text) : null) as T
}

export type PublishedJob = {
  id: string
  title: string
  category: string
  description: string
  work_type: string
  state_code: string | null
  state_lgd_code: number | null
  district: string
  district_lgd_code: number | null
  town_or_market: string | null
  salary_min: number | null
  salary_max: number | null
  salary_period: string | null
  vacancies: number
  food_or_stay: string | null
  created_at: string
  expires_at: string | null
}

export async function listPublishedJobs(filters: { stateLgdCode?: number; districtLgdCode?: number } = {}) {
  const params = new URLSearchParams({
    select: 'id,title,category,description,work_type,state_code,state_lgd_code,district,district_lgd_code,town_or_market,salary_min,salary_max,salary_period,vacancies,food_or_stay,created_at,expires_at',
    status: 'eq.published',
    order: 'created_at.desc',
    limit: '100',
  })
  if (filters.stateLgdCode) params.set('state_lgd_code', `eq.${filters.stateLgdCode}`)
  if (filters.districtLgdCode) params.set('district_lgd_code', `eq.${filters.districtLgdCode}`)
  params.set('or', `(expires_at.is.null,expires_at.gt.${new Date().toISOString()})`)
  return request<PublishedJob[]>(`/rest/v1/job_posts?${params.toString()}`)
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: { id: string; email?: string; phone?: string; user_metadata?: { full_name?: string; account_type?: 'candidate' | 'employer' } }
}

export async function signUpWithEmail(email: string, password: string, fullName: string, accountType: 'candidate' | 'employer' = 'candidate') {
  return request<AuthSession | { id: string; email: string; confirmation_sent_at?: string }>('/auth/v1/signup', {
    method: 'POST',
    body: { email, password, data: { full_name: fullName, account_type: accountType } },
  })
}

export async function signInWithEmail(email: string, password: string) {
  return request<AuthSession>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })
}


export type StoredAuthSession = AuthSession & { expires_at: number }

export function readAuthSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem('sabkaam-auth-session')
    if (!raw) return null
    const saved = JSON.parse(raw) as StoredAuthSession
    if (!saved.access_token || !saved.user?.id || saved.expires_at <= Date.now()) {
      sessionStorage.removeItem('sabkaam-auth-session')
      return null
    }
    return saved
  } catch {
    sessionStorage.removeItem('sabkaam-auth-session')
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  sessionStorage.setItem('sabkaam-auth-session', JSON.stringify({
    ...session,
    expires_at: Date.now() + session.expires_in * 1000,
  }))
}

export function clearAuthSession() {
  sessionStorage.removeItem('sabkaam-auth-session')
}

export async function getMyEmployer(accessToken: string, ownerId: string) {
  const rows = await request<Array<{ id: string; verification_status: string }>>(
    `/rest/v1/employers?select=id,verification_status&owner_id=eq.${encodeURIComponent(ownerId)}&limit=1`,
    { accessToken },
  )
  return rows[0] ?? null
}

export async function createEmployer(accessToken: string, payload: {
  owner_id: string; business_name: string; business_type?: string; contact_phone: string
  state_lgd_code: number; district_lgd_code: number; district: string; address?: string
}) {
  return request<Array<{ id: string; verification_status: string }>>('/rest/v1/employers', {
    method: 'POST', accessToken, prefer: 'return=representation', body: { ...payload, state_code: String(payload.state_lgd_code) },
  })
}

export async function createVerificationRequest(accessToken: string, payload: {
  employer_id: string; business_name: string; business_type?: string; contact_phone: string
  state_lgd_code: number; district_lgd_code: number; district: string; address: string
}) {
  return request<Array<{ id: string; status: string }>>('/rest/v1/verification_requests', {
    method: 'POST', accessToken, prefer: 'return=representation', body: { ...payload, state_code: String(payload.state_lgd_code) },
  })
}

export async function submitApplication(accessToken: string, payload: {
  job_id: string; candidate_id: string; full_name: string; phone: string; experience?: string; message?: string
}) {
  return request<Array<{ id: string; status: string }>>('/rest/v1/applications', {
    method: 'POST', accessToken, prefer: 'return=representation', body: payload,
  })
}

export async function createJobDraft(accessToken: string, payload: {
  employer_id: string; title: string; category: string; description: string; work_type: string
  state_lgd_code: number; district_lgd_code: number; district: string; town_or_market?: string
  salary_min?: number; salary_max?: number; salary_period?: string; vacancies: number
}) {
  return request<Array<{ id: string; status: string }>>('/rest/v1/job_posts', {
    method: 'POST', accessToken, prefer: 'return=representation', body: { ...payload, status: 'draft' },
  })
}

export async function submitJobForReview(accessToken: string, jobId: string) {
  return request<Array<{ id: string; status: string }>>(`/rest/v1/job_posts?id=eq.${encodeURIComponent(jobId)}`, {
    method: 'PATCH', accessToken, prefer: 'return=representation', body: { status: 'pending_review' },
  })
}

export async function submitSafetyReport(accessToken: string, payload: {
  reporter_id: string; reason: string; details?: string; contact_phone?: string; job_id?: string; employer_id?: string
}) {
  return request<Array<{ id: string; status: string }>>('/rest/v1/reports', {
    method: 'POST', accessToken, prefer: 'return=representation', body: payload,
  })
}

export async function getMyApplications(accessToken: string) {
  return request<Array<{ id: string; job_id: string; status: string; created_at: string; job_posts?: { title: string; district: string } | null }>>(
    '/rest/v1/applications?select=id,job_id,status,created_at,job_posts(title,district)&order=created_at.desc',
    { accessToken },
  )
}



export async function getMyProfile(accessToken: string, userId: string) {
  const rows = await request<Array<{ id: string; role: 'candidate' | 'employer' | 'moderator' | 'admin'; full_name: string | null; phone: string | null; skills: string | null; preferred_work_type: string | null; district: string | null; state_lgd_code: number | null; district_lgd_code: number | null; preferred_language: string }>>(
    `/rest/v1/profiles?select=id,role,full_name,phone,skills,preferred_work_type,district,state_lgd_code,district_lgd_code,preferred_language&id=eq.${encodeURIComponent(userId)}&limit=1`,
    { accessToken },
  )
  return rows[0] ?? null
}

export async function updateMyProfile(accessToken: string, userId: string, payload: {
  full_name: string; phone: string; district: string; state_code: string
  state_lgd_code: number; district_lgd_code: number; preferred_language: string; skills: string; preferred_work_type: string
}) {
  return request<Array<{ id: string }>>(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH', accessToken, prefer: 'return=representation', body: payload,
  })
}

export async function markNotificationRead(accessToken: string, notificationId: string) {
  return request<Array<{ id: string; read_at: string | null }>>(
    `/rest/v1/notifications?id=eq.${encodeURIComponent(notificationId)}`,
    { method: 'PATCH', accessToken, prefer: 'return=representation', body: { read_at: new Date().toISOString() } },
  )
}


export type ReviewJob = { id: string; title: string; description: string; district: string; created_at: string; employers?: { business_name: string; contact_phone: string | null } | null }
export type ReviewRequest = { id: string; employer_id: string; business_name: string; business_type: string | null; contact_phone: string | null; district: string; address: string | null; created_at: string; status: string }
export type OpenReport = { id: string; reason: string; details: string | null; contact_phone: string | null; created_at: string; status: string }

export async function getPendingJobs(accessToken: string) {
  return request<ReviewJob[]>('/rest/v1/job_posts?select=id,title,description,district,created_at,employers(business_name,contact_phone)&status=eq.pending_review&order=created_at.asc', { accessToken })
}

export async function reviewJob(accessToken: string, jobId: string, approved: boolean) {
  return request<Array<{ id: string; status: string }>>(`/rest/v1/job_posts?id=eq.${encodeURIComponent(jobId)}`, {
    method: 'PATCH', accessToken, prefer: 'return=representation',
    body: approved ? { status: 'published', published_at: new Date().toISOString() } : { status: 'rejected' },
  })
}

export async function getPendingVerifications(accessToken: string) {
  return request<ReviewRequest[]>('/rest/v1/verification_requests?select=id,employer_id,business_name,business_type,contact_phone,district,address,created_at,status&status=in.(pending,in_review,needs_information)&order=created_at.asc', { accessToken })
}

export async function reviewVerification(accessToken: string, reviewerId: string, requestId: string, employerId: string, approved: boolean) {
  const status = approved ? 'approved' : 'rejected'
  await request(`/rest/v1/verification_requests?id=eq.${encodeURIComponent(requestId)}`, {
    method: 'PATCH', accessToken, prefer: 'return=minimal',
    body: { status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() },
  })
  return request(`/rest/v1/employers?id=eq.${encodeURIComponent(employerId)}`, {
    method: 'PATCH', accessToken, prefer: 'return=minimal', body: { verification_status: status },
  })
}

export async function getOpenReports(accessToken: string) {
  return request<OpenReport[]>('/rest/v1/reports?select=id,reason,details,contact_phone,created_at,status&status=in.(open,reviewing)&order=created_at.asc', { accessToken })
}

export async function reviewReport(accessToken: string, reportId: string, resolved: boolean) {
  return request<Array<{ id: string; status: string }>>(`/rest/v1/reports?id=eq.${encodeURIComponent(reportId)}`, {
    method: 'PATCH', accessToken, prefer: 'return=representation', body: { status: resolved ? 'resolved' : 'dismissed' },
  })
}

export async function getMyNotifications(accessToken: string) {
  return request<Array<{ id: string; title: string; body: string; kind: string; read_at: string | null; created_at: string }>>(
    '/rest/v1/notifications?select=id,title,body,kind,read_at,created_at&order=created_at.desc',
    { accessToken },
  )
}
