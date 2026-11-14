import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { NAV_ITEMS } from '../components/layout/navItems'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Forbidden from '../pages/Forbidden'
import NotFound from '../pages/NotFound'
import Users from '../pages/admin/Users'
import Categories from '../pages/admin/Categories'
import NewTicket from '../pages/tickets/NewTicket'
import TicketList from '../pages/tickets/TicketList'
import Dashboard from '../pages/Dashboard'

 
function PublicOnly({ children }) {
const { user } = useAuth()
return user ? <Navigate to="/" replace /> : children
}
 
// Leva o usuário para a primeira página do menu do seu perfil
function Inicio() {
  const { user } = useAuth()
  const primeiro = NAV_ITEMS.find((i) => i.roles.includes(user.perfil))
  return <Navigate to={primeiro.to} replace />
}
 
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/cadastro" element={<PublicOnly><Register /></PublicOnly>} />
 
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Inicio />} />
        <Route element={<AppLayout />}>
          <Route path="/acesso-negado" element={<Forbidden />} />
 
          {/* Telas do cliente */}
          <Route element={<ProtectedRoute roles={[ROLES.CLIENTE]} />}>
            <Route path="/chamados" element={<TicketList 
            title="Meus Chamados"
            emptyMessage="Você não tem chamados abertos."
            canCreate />} />
            <Route path="/chamados/novo" element={<NewTicket />} />
            <Route path="/resumo" element={<Dashboard title="Meu resumo" totalLabel="Meus chamados" />} />
          </Route>
 
          {/* As telas de chamados do técnico*/}
            <Route element={<ProtectedRoute roles={[ROLES.TECNICO]} />}>
            <Route path="/fila" element={<TicketList title="Fila de atendimento" emptyMessage="Nenhum chamado na fila." showClient />} />
            <Route path="/atendimentos" element={<TicketList title="Meus atendimentos" emptyMessage="Você ainda não assumiu nenhum chamado." showClient onlyMine />} />
            <Route path="/resumo-atendimentos" element={<Dashboard title="Resumo dos meus atendimentos" totalLabel="Meus atendimentos" />} />
          </Route>
 
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<Dashboard title="Dashboard" totalLabel="Total de chamados" />} />
            <Route path="/admin/usuarios" element={<Users />} />
            <Route path="/admin/categorias" element={<Categories />} />
            <Route
              path="/admin/chamados"
              element={<TicketList title="Todos os chamados" emptyMessage="Nenhum chamado cadastrado." showClient />}
            />
          </Route>
 
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
