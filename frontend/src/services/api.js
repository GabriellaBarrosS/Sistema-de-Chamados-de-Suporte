import axios from 'axios'

export const TOKEN_KEY = 'chamados:token'
export const USER_KEY = 'chamados:user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// Anexa o token JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Sessão expirada: limpa o login e volta para a tela de entrada
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Ocorreu um erro. Tente novamente.') {
  if (error && !error.response) return 'Não foi possível conectar à API. Verifique se ela está rodando.'
  return error?.response?.data?.message || error?.response?.data?.error || fallback
}

export default api
