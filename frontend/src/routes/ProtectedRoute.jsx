import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Exige login. Se `roles` for informado, exige também um desses perfis.
 */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.perfil)) return <Navigate to="/acesso-negado" replace />
  return <Outlet />
}
