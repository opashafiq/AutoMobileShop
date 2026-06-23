// Simple auth helper for frontend: login, token storage
import { getApiUrl } from './globalFetcher'

const TOKEN_KEY = 'NEXT_AUTH_TOKEN'
const USERNAME_KEY = 'NEXT_AUTH_USER'

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

export const clearToken = () => {
  setToken(null)
  setUserName(null)
}

export const isLoggedIn = () => !!getToken()

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
  return token
}

export default {
  login,
  setToken,
  getToken,
  clearToken,
  isLoggedIn,
}
