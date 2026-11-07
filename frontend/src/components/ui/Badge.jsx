import { STATUS, PRIORIDADES, ROLE_LABELS } from '../../constants'

export function Badge({ tone = 'gray', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, tone: 'gray' }
  return <Badge tone={s.tone}>{s.label}</Badge>
}

export function PriorityBadge({ prioridade }) {
  const p = PRIORIDADES[prioridade] || { label: prioridade, tone: 'gray' }
  return <Badge tone={p.tone}>{p.label}</Badge>
}

const ROLE_TONES = { admin: 'red', tecnico: 'blue', cliente: 'gray' }

export function RoleBadge({ perfil }) {
  return <Badge tone={ROLE_TONES[perfil] || 'gray'}>{ROLE_LABELS[perfil] || perfil}</Badge>
}
