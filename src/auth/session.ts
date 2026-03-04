import type { AuthUser } from "../types/auth"

const SESSION_KEY = "inclusive_checker_session"

export function saveSession(user: AuthUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.uid || !parsed?.name || !parsed?.email) return null

    return {
      uid: parsed.uid,
      name: parsed.name,
      email: parsed.email,
    }
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
