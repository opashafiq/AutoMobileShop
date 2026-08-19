// Simple auth helper for frontend: login, token storage
import { getApiUrl } from './globalFetcher'

const TOKEN_KEY = 'NEXT_AUTH_TOKEN'
const USERNAME_KEY = 'NEXT_AUTH_USER'
const USER_KEY = 'NEXT_AUTH_USER_SESSION'

// Logged-in user details, fetched once after a successful login and held
// for the duration of the session. Cleared together with the token on logout.
export interface UserSession {
  id: string
  userName: string
  firstName: string
  lastName: string
  isActive: boolean
  locationId: number
  locationName: string
  tbld_Address1: string
  tbld_Address2: string
  email: string
  roles: string[]
}

export const setToken = (token: string | null) => {
  if (typeof window === 'undefined') return
  if (token === null) {
    localStorage.removeItem(TOKEN_KEY)
  } else {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setUserName = (userName: string | null) => {
  if (typeof window === 'undefined') return
  if (userName === null) {
    localStorage.removeItem(USERNAME_KEY)
  } else {
    localStorage.setItem(USERNAME_KEY, userName)
  }
}

export const getUserName = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USERNAME_KEY)
}

// Persist/restore the full user session object so it survives page refresh
// within an authenticated session, but is wiped on logout (see clearToken).
export const setUserSession = (user: UserSession | null) => {
  if (typeof window === 'undefined') return
  if (user === null) {
    localStorage.removeItem(USER_KEY)
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export const getUserSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}

export const clearToken = () => {
  setToken(null)
  setUserName(null)
  setUserSession(null)
}

export const isLoggedIn = () => !!getToken()

// Fetch the authenticated user's details by username and persist them.
// Called right after a successful token grant during login().
export const fetchUserSession = async (
  username: string,
  token: string,
): Promise<UserSession> => {
  const url = getApiUrl(`/api/ApplicationUser/getbyusername/${encodeURIComponent(username)}`)
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json, text/plain',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    // Non-fatal: a failed user fetch shouldn't block login, but the caller
    // should know the session details are unavailable.
    throw new Error(`Failed to load user details (status ${res.status})`)
  }

  const body = await res.json()
  const user: UserSession = {
    id: body?.id ?? '',
    userName: body?.userName ?? username,
    firstName: body?.firstName ?? '',
    lastName: body?.lastName ?? '',
    isActive: body?.isActive ?? true,
    locationId: Number(body?.locationId) || 0,
    locationName: body?.locationName ?? '',
    tbld_Address1: body?.tbld_Address1 ?? '',
    tbld_Address2: body?.tbld_Address2 ?? '',
    email: body?.email ?? '',
    roles: Array.isArray(body?.roles) ? body.roles : [],
  }
  setUserSession(user)
  return user
}

export const login = async (username: string, password: string) => {
  const url = getApiUrl('/Authentication/Login')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json, text/plain',
    },
    body: JSON.stringify({ userName: username, password }),
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || ''
    let message = `Login failed with status ${res.status}`

    if (contentType.includes('application/json')) {
      const body = await res.json().catch(() => null)
      if (body) {
        if (typeof body === 'string') {
          message = body
        } else {
          message = body?.message || body?.error || JSON.stringify(body)
        }
      }
    } else {
      const text = await res.text().catch(() => '')
      if (text) {
        message = text
      }
    }

    throw new Error(message)
  }

  // Handle both plain-text token responses and JSON responses { token: '...' }
  const contentType = res.headers.get('content-type') || ''
  let token: string | null = null

  if (contentType.includes('application/json')) {
    const body = await res.json()
    const maybeToken =
      body?.token || body?.accessToken || body?.jwt || body?.access_token

    if (typeof maybeToken === 'string' && maybeToken.trim()) {
      token = maybeToken
    } else {
      throw new Error(body?.message || body?.error || JSON.stringify(body))
    }

    setUserName(username)
  } else {
    token = await res.text()
  }

  if (typeof token === 'string') {
    // strip accidental surrounding quotes
    token = token.replace(/^"|"$/g, '')
  }

  setToken(token)

  // Best-effort: fetch the user details now so the session (incl. locationId)
  // is available app-wide. A failure here doesn't fail the login itself.
  try {
    await fetchUserSession(username, token as string)
  } catch (err) {
    console.error('User session fetch failed', err)
  }

  return token
}

export default {
  login,
  setToken,
  getToken,
  clearToken,
  isLoggedIn,
  getUserSession,
  setUserSession,
  fetchUserSession,
}
