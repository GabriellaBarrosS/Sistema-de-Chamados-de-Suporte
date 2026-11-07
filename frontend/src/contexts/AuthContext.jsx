import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as authService from '../services/authService'
import { TOKEN_KEY, USER_KEY } from '../services/api'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw && localStorage.getItem(TOKEN_KEY) ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const login = useCallback(async (email, senha) => {
    const { token, user: u } = await authService.login(email, senha)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
