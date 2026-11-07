import api from './api'

// Esperado da API: { token, user: { id, nome, email, perfil } }
export const login = (email, senha) =>
  api.post('/auth/login', { email, senha }).then((r) => r.data)

export const register = (dados) =>
  api.post('/auth/register', dados).then((r) => r.data)
