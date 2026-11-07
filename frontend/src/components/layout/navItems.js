import { ROLES } from '../../constants'

// Itens do menu e perfis que podem vê-los
export const NAV_ITEMS = [
  { to: '/chamados', label: 'Meus chamados', roles: [ROLES.CLIENTE] },
  { to: '/chamados/novo', label: 'Abrir chamado', roles: [ROLES.CLIENTE] },
  { to: '/fila', label: 'Fila de atendimento', roles: [ROLES.TECNICO] },
  { to: '/atendimentos', label: 'Meus atendimentos', roles: [ROLES.TECNICO] },
  { to: '/admin/usuarios', label: 'Usuários', roles: [ROLES.ADMIN] },
  { to: '/admin/categorias', label: 'Categorias', roles: [ROLES.ADMIN] },
  { to: '/admin/chamados', label: 'Todos os chamados', roles: [ROLES.ADMIN] },
]
