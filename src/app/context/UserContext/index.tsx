'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUserSession, type UserSession } from '@/app/api/auth'

export type UserContextType = {
  user: UserSession | null
  /** True until the first hydration from storage has completed. */
  loading: boolean
  /** The logged-in user's location id, or 0 when not authenticated. */
  locationId: number
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

/**
 * Exposes the authenticated user's details (id, userName, locationId, roles, …)
 * to the whole dashboard. The user object is fetched once right after login
 * (see auth.login) and persisted to localStorage; this provider rehydrates it
 * on mount so it survives page refreshes within a session. It is cleared on
 * logout together with the token (see auth.clearToken).
 *
 * Usage:
 *   const { user, locationId } = useUser()
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getUserSession())
    setLoading(false)

    // Keep this provider in sync if storage changes elsewhere (e.g. logout
    // triggered from another tab).
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'NEXT_AUTH_USER_SESSION') {
        setUser(getUserSession())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value: UserContextType = {
    user,
    loading,
    locationId: user?.locationId ?? 0,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext)
  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return ctx
}

export default UserContext