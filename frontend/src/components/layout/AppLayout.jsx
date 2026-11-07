import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS } from '../../constants'
import { NAV_ITEMS } from './navItems'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.perfil))

  function sair() {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Chamados</h2>
        <nav>
          {items.map((i) => (
            <NavLink key={i.to} to={i.to}>{i.label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div>{user.nome}</div>
          <small>{ROLE_LABELS[user.perfil]}</small>
          <button className="link-button" onClick={sair}>Sair</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
