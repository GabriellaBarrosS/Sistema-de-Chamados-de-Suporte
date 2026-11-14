import api from './api'

export const listTickets = (params) => api.get('/tickets', { params }).then((r) => r.data)
export const createTicket = (data) => api.post('/tickets', data).then((r) => r.data)
