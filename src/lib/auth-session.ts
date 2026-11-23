import type { AuthSession } from './backend'

type StoredSession = AuthSession & { expires_at?: number }
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const storageKey = 'sabkaam-auth-session'

function clearStoredSession() {
  try { sessionStorage.removeItem(storageKey) } catch { /* Storage may be unavailable. */ }
}

export async function restoreAuthSession(): Promise<AuthSession | null> {
  let saved: StoredSession
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    saved = JSON.parse(raw) as StoredSession
  } catch {
    clearStoredSession()
    return null
  }

  if (!saved.refresh_token || !saved.user?.id || !saved.access_token) {
    clearStoredSession()
    return null
  }

  const expiresAt = saved.expires_at ?? Date.now() + Math.max(0, saved.expires_in ?? 0) * 1000
  if (expiresAt > Date.now() + 60_000) return saved
  if (!supabaseUrl || !publishableKey) return null

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: saved.refresh_token }),
    })
    if (!response.ok) { clearStoredSession(); return null }
    const refreshed = await response.json() as AuthSession
    if (!refreshed.access_token || !refreshed.refresh_token || !refreshed.user?.id) { clearStoredSession(); return null }
    sessionStorage.setItem(storageKey, JSON.stringify({ ...refreshed, expires_at: Date.now() + Math.max(0, refreshed.expires_in ?? 0) * 1000 }))
    return refreshed
  } catch {
    return expiresAt > Date.now() ? saved : null
  }
}

export async function revokeAuthSession(accessToken: string): Promise<void> {
  if (!supabaseUrl || !publishableKey || !accessToken) return
  try {
    await fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` } })
  } catch { /* Local sign-out must still complete if the network is unavailable. */ }
}
