export const ROLES = {
  ADMIN: 'admin',
  TECNICO: 'tecnico',
  CLIENTE: 'cliente',
}

export const ROLE_LABELS = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  cliente: 'Cliente',
}

export const STATUS = {
  aberto: { label: 'Aberto', tone: 'blue' },
  em_andamento: { label: 'Em andamento', tone: 'yellow' },
  aguardando: { label: 'Aguardando', tone: 'gray' },
  resolvido: { label: 'Resolvido', tone: 'green' },
  fechado: { label: 'Fechado', tone: 'dark' },
}

export const PRIORIDADES = {
  baixa: { label: 'Baixa', tone: 'green' },
  media: { label: 'Média', tone: 'yellow' },
  alta: { label: 'Alta', tone: 'orange' },
  critica: { label: 'Crítica', tone: 'red' },
}
