import api from './api'

export const createTicket = (data) => api.post('/tickets', data).then((r) => r.data)
