// Servidor FALSO (mock) da API, só para testar o front-end sem o back-end real.
// Usa apenas módulos do próprio Node: não precisa instalar nada.
//
// Como usar (na pasta frontend):   node mock/server.js
// Ele responde em http://localhost:3000/api, que é a URL padrão do src/services/api.js.
//
// Os dados ficam só na memória: ao reiniciar o servidor, tudo volta ao começo.

import http from 'node:http'

const PORT = process.env.PORT || 3000
const DELAY_MS = 300 // atraso artificial, para você ver os textos "Carregando..."
const HORA = 60 * 60 * 1000

const STATUS_KEYS = ['aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado']
const PRIORIDADE_KEYS = ['baixa', 'media', 'alta', 'critica']
const PERFIS = ['admin', 'tecnico', 'cliente']

const haHoras = (h) => new Date(Date.now() - h * HORA).toISOString()

// ---------------------------------------------------------------------------
// Dados iniciais (a senha de todos os usuários de teste é 123456)
// ---------------------------------------------------------------------------
const db = {
  users: [
    { id: 1, nome: 'Ana Admin', email: 'admin@teste.com', senha: '123456', perfil: 'admin' },
    { id: 2, nome: 'Carlos Técnico', email: 'tecnico@teste.com', senha: '123456', perfil: 'tecnico' },
    { id: 3, nome: 'Paula Técnica', email: 'tecnico2@teste.com', senha: '123456', perfil: 'tecnico' },
    { id: 4, nome: 'Maria Cliente', email: 'cliente@teste.com', senha: '123456', perfil: 'cliente' },
    { id: 5, nome: 'João Cliente', email: 'cliente2@teste.com', senha: '123456', perfil: 'cliente' },
  ],
  categories: [
    { id: 1, nome: 'Rede', descricao: 'Internet, Wi-Fi e VPN' },
    { id: 2, nome: 'Hardware', descricao: 'Computadores, monitores e periféricos' },
    { id: 3, nome: 'Software', descricao: 'Instalação e erros de programas' },
    { id: 4, nome: 'Acesso e senhas', descricao: 'Contas, permissões e redefinição de senha' },
    { id: 5, nome: 'Impressoras', descricao: '' },
  ],
  tickets: [],
}

// [titulo, descricao, categoriaId, prioridade, status, clienteId, tecnicoId, abertoHaHoras, horasAteResolver]
const SEED_TICKETS = [
  ['Sem acesso à internet na sala 3', 'Desde a manhã nenhum computador da sala 3 abre sites.', 1, 'alta', 'em_andamento', 4, 2, 30],
  ['Computador não liga', 'Aperto o botão e nada acontece, nem as luzes acendem.', 2, 'critica', 'aberto', 4, null, 3],
  ['Instalar pacote Office', 'Preciso do Word e do Excel instalados na minha máquina.', 3, 'baixa', 'resolvido', 4, 2, 120, 6],
  ['Esqueci minha senha do sistema', 'Não consigo entrar e o e-mail de recuperação não chega.', 4, 'media', 'resolvido', 5, 3, 96, 1.5],
  ['Impressora com papel atolado', 'A impressora do corredor trava sempre na bandeja 2.', 5, 'baixa', 'fechado', 5, 3, 200, 26],
  ['Wi-Fi instável no 2º andar', 'A conexão cai várias vezes por hora, principalmente à tarde.', 1, 'alta', 'aguardando', 5, 2, 50],
  ['Monitor piscando', 'A tela pisca a cada poucos segundos, atrapalha o trabalho.', 2, 'media', 'aberto', 5, null, 10],
  ['Erro ao abrir planilha', 'Aparece uma mensagem de arquivo corrompido ao abrir o relatório.', 3, 'media', 'em_andamento', 4, 3, 20],
  ['Acesso à pasta compartilhada', 'Preciso de permissão para a pasta do financeiro.', 4, 'baixa', 'resolvido', 4, 2, 72, 3],
  ['Impressora não imprime colorido', 'Só sai preto e branco, mesmo escolhendo a opção colorida.', 5, 'media', 'aberto', 4, null, 5],
  ['VPN não conecta', 'Trabalhando de casa, a VPN dá erro de tempo esgotado.', 1, 'critica', 'em_andamento', 5, 2, 8],
  ['Teclado com teclas falhando', 'As teclas A e S às vezes não registram o que digito.', 2, 'baixa', 'resolvido', 5, 3, 150, 48],
]

let nextTicketId = 1
for (const [titulo, descricao, categoriaId, prioridade, status, clienteId, tecnicoId, abertoHa, durH] of SEED_TICKETS) {
  db.tickets.push({
    id: nextTicketId++,
    titulo,
    descricao,
    categoriaId,
    prioridade,
    status,
    clienteId,
    tecnicoId,
    criadoEm: haHoras(abertoHa),
    resolvidoEm: durH ? new Date(Date.now() - abertoHa * HORA + durH * HORA).toISOString() : null,
  })
}

const nextId = (lista) => Math.max(0, ...lista.map((i) => i.id)) + 1

// ---------------------------------------------------------------------------
// Funções auxiliares
// ---------------------------------------------------------------------------
const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const publicUser = ({ senha, ...resto }) => resto // nunca devolve a senha

const categoriaPorId = (id) => db.categories.find((c) => c.id === id)
const usuarioPorId = (id) => db.users.find((u) => u.id === id)

// Monta o chamado no formato que o front espera
function toTicket(t) {
  const cat = categoriaPorId(t.categoriaId)
  const cli = usuarioPorId(t.clienteId)
  const tec = usuarioPorId(t.tecnicoId)
  return {
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao,
    status: t.status,
    prioridade: t.prioridade,
    categoria: cat ? { id: cat.id, nome: cat.nome } : null,
    cliente: cli ? { id: cli.id, nome: cli.nome } : null,
    tecnico: tec ? { id: tec.id, nome: tec.nome } : null,
    criadoEm: t.criadoEm,
    resolvidoEm: t.resolvidoEm,
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let texto = ''
    req.on('data', (pedaco) => (texto += pedaco))
    req.on('end', () => {
      try {
        resolve(texto ? JSON.parse(texto) : {})
      } catch {
        reject(new HttpError(400, 'JSON inválido.'))
      }
    })
    req.on('error', reject)
  })
}

// O "token" do mock é só "mock-token-<id do usuário>". Não é seguro, e nem precisa ser.
function usuarioLogado(req) {
  const cabecalho = req.headers.authorization || ''
  const id = Number(cabecalho.replace('Bearer mock-token-', ''))
  const user = usuarioPorId(id)
  if (!cabecalho.startsWith('Bearer mock-token-') || !user) {
    throw new HttpError(401, 'Sessão expirada. Faça login novamente.')
  }
  return user
}

function exigirPerfil(user, ...perfis) {
  if (!perfis.includes(user.perfil)) throw new HttpError(403, 'Acesso negado.')
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
async function tratar(req, res, url) {
  const metodo = req.method
  const caminho = url.pathname.replace(/^\/api/, '') || '/'
  let m // resultado das expressões regulares de rotas com :id

  // ----- Autenticação (públicas) -----
  if (metodo === 'POST' && caminho === '/auth/login') {
    const { email, senha } = await lerCorpo(req)
    const user = db.users.find((u) => norm(u.email) === norm(email) && u.senha === senha)
    if (!user) throw new HttpError(401, 'E-mail ou senha inválidos.')
    return [200, { token: `mock-token-${user.id}`, user: publicUser(user) }]
  }

  if (metodo === 'POST' && caminho === '/auth/register') {
    const { nome, email, senha } = await lerCorpo(req)
    if (!nome?.trim() || !email?.trim() || !senha) throw new HttpError(400, 'Preencha nome, e-mail e senha.')
    if (db.users.some((u) => norm(u.email) === norm(email))) throw new HttpError(409, 'E-mail já cadastrado.')
    const user = { id: nextId(db.users), nome: nome.trim(), email: email.trim(), senha, perfil: 'cliente' }
    db.users.push(user)
    return [201, publicUser(user)]
  }

  // ----- A partir daqui é preciso estar logado -----
  const eu = usuarioLogado(req)

  // ----- Usuários (só admin) -----
  if (caminho === '/users' && metodo === 'GET') {
    exigirPerfil(eu, 'admin')
    return [200, db.users.map(publicUser)]
  }

  if (caminho === '/users' && metodo === 'POST') {
    exigirPerfil(eu, 'admin')
    const { nome, email, perfil, senha } = await lerCorpo(req)
    if (!nome?.trim() || !email?.trim() || !senha) throw new HttpError(400, 'Preencha nome, e-mail e senha.')
    if (!PERFIS.includes(perfil)) throw new HttpError(400, 'Perfil inválido.')
    if (db.users.some((u) => norm(u.email) === norm(email))) throw new HttpError(409, 'E-mail já cadastrado.')
    const user = { id: nextId(db.users), nome: nome.trim(), email: email.trim(), senha, perfil }
    db.users.push(user)
    return [201, publicUser(user)]
  }

  if ((m = caminho.match(/^\/users\/(\d+)$/))) {
    exigirPerfil(eu, 'admin')
    const user = usuarioPorId(Number(m[1]))
    if (!user) throw new HttpError(404, 'Usuário não encontrado.')

    if (metodo === 'PUT') {
      const { nome, email, perfil, senha } = await lerCorpo(req)
      if (email && db.users.some((u) => u.id !== user.id && norm(u.email) === norm(email))) {
        throw new HttpError(409, 'E-mail já cadastrado.')
      }
      if (perfil && !PERFIS.includes(perfil)) throw new HttpError(400, 'Perfil inválido.')
      if (nome) user.nome = nome.trim()
      if (email) user.email = email.trim()
      if (perfil) user.perfil = perfil
      if (senha) user.senha = senha
      return [200, publicUser(user)]
    }

    if (metodo === 'DELETE') {
      if (user.id === eu.id) throw new HttpError(400, 'Você não pode excluir o próprio usuário.')
      if (db.tickets.some((t) => t.clienteId === user.id || t.tecnicoId === user.id)) {
        throw new HttpError(409, 'Este usuário possui chamados e não pode ser excluído.')
      }
      db.users = db.users.filter((u) => u.id !== user.id)
      return [204, null]
    }
  }

  // ----- Categorias (qualquer perfil lê; só admin altera) -----
  if (caminho === '/categories' && metodo === 'GET') {
    return [200, db.categories]
  }

  if (caminho === '/categories' && metodo === 'POST') {
    exigirPerfil(eu, 'admin')
    const { nome, descricao } = await lerCorpo(req)
    if (!nome?.trim()) throw new HttpError(400, 'Informe o nome da categoria.')
    if (db.categories.some((c) => norm(c.nome) === norm(nome))) throw new HttpError(409, 'Categoria já cadastrada.')
    const cat = { id: nextId(db.categories), nome: nome.trim(), descricao: (descricao || '').trim() }
    db.categories.push(cat)
    return [201, cat]
  }

  if ((m = caminho.match(/^\/categories\/(\d+)$/))) {
    exigirPerfil(eu, 'admin')
    const cat = categoriaPorId(Number(m[1]))
    if (!cat) throw new HttpError(404, 'Categoria não encontrada.')

    if (metodo === 'PUT') {
      const { nome, descricao } = await lerCorpo(req)
      if (nome && db.categories.some((c) => c.id !== cat.id && norm(c.nome) === norm(nome))) {
        throw new HttpError(409, 'Categoria já cadastrada.')
      }
      if (nome) cat.nome = nome.trim()
      if (descricao !== undefined) cat.descricao = (descricao || '').trim()
      return [200, cat]
    }

    if (metodo === 'DELETE') {
      if (db.tickets.some((t) => t.categoriaId === cat.id)) {
        throw new HttpError(409, 'Esta categoria está em uso por chamados e não pode ser excluída.')
      }
      db.categories = db.categories.filter((c) => c.id !== cat.id)
      return [204, null]
    }
  }

  // ----- Chamados -----
  if (caminho === '/tickets' && metodo === 'GET') {
    // Cliente vê só os dele; técnico e admin veem a fila completa
    let lista = eu.perfil === 'cliente' ? db.tickets.filter((t) => t.clienteId === eu.id) : db.tickets

    const q = url.searchParams
    const busca = norm(q.get('busca') || '').trim()
    if (busca) lista = lista.filter((t) => norm(t.titulo).includes(busca) || norm(t.descricao).includes(busca))
    if (q.get('status')) lista = lista.filter((t) => t.status === q.get('status'))
    if (q.get('prioridade')) lista = lista.filter((t) => t.prioridade === q.get('prioridade'))
    if (q.get('categoriaId')) lista = lista.filter((t) => String(t.categoriaId) === q.get('categoriaId'))

    const maisNovosPrimeiro = [...lista].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    return [200, maisNovosPrimeiro.map(toTicket)]
  }

  if (caminho === '/tickets' && metodo === 'POST') {
    const { titulo, descricao, categoriaId, prioridade } = await lerCorpo(req)
    if (!titulo?.trim() || !descricao?.trim()) throw new HttpError(400, 'Informe título e descrição.')
    if (!categoriaPorId(Number(categoriaId))) throw new HttpError(400, 'Categoria inválida.')
    if (!PRIORIDADE_KEYS.includes(prioridade)) throw new HttpError(400, 'Prioridade inválida.')
    const ticket = {
      id: nextTicketId++,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoriaId: Number(categoriaId),
      prioridade,
      status: 'aberto',
      clienteId: eu.id, // quem abre é o usuário logado (vem do token)
      tecnicoId: null,
      criadoEm: new Date().toISOString(),
      resolvidoEm: null,
    }
    db.tickets.push(ticket)
    return [201, toTicket(ticket)]
  }

  // ----- Dashboard (números mudam conforme o perfil) -----
  if (caminho === '/dashboard' && metodo === 'GET') {
    let lista = db.tickets
    if (eu.perfil === 'cliente') lista = lista.filter((t) => t.clienteId === eu.id)
    if (eu.perfil === 'tecnico') lista = lista.filter((t) => t.tecnicoId === eu.id)

    const porStatus = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0]))
    const porPrioridade = Object.fromEntries(PRIORIDADE_KEYS.map((k) => [k, 0]))
    for (const t of lista) {
      porStatus[t.status]++
      porPrioridade[t.prioridade]++
    }

    const porCategoria = db.categories.map((c) => ({
      id: c.id,
      nome: c.nome,
      total: lista.filter((t) => t.categoriaId === c.id).length,
    }))

    const resolvidos = lista.filter((t) => t.resolvidoEm)
    const tempoMedioAtendimentoHoras = resolvidos.length
      ? Math.round(
          (resolvidos.reduce((soma, t) => soma + (new Date(t.resolvidoEm) - new Date(t.criadoEm)) / HORA, 0) /
            resolvidos.length) *
            100,
        ) / 100
      : null

    return [200, { total: lista.length, porStatus, porPrioridade, porCategoria, tempoMedioAtendimentoHoras }]
  }

  throw new HttpError(404, 'Rota não encontrada no mock.')
}

// ---------------------------------------------------------------------------
// Servidor
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // CORS: permite que o front (localhost:5173) converse com este servidor (localhost:3000)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  res.on('finish', () => console.log(`${req.method} ${url.pathname}${url.search} -> ${res.statusCode}`))

  try {
    await new Promise((r) => setTimeout(r, DELAY_MS))
    const [status, corpo] = await tratar(req, res, url)
    if (corpo === null) {
      res.writeHead(status)
      return res.end()
    }
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(corpo))
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    if (status === 500) console.error(err)
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ message: err instanceof HttpError ? err.message : 'Erro interno do mock.' }))
  }
})

server.listen(PORT, () => {
  console.log(`\nAPI mock rodando em http://localhost:${PORT}/api\n`)
  console.log('Usuários de teste (senha: 123456):')
  console.log('  admin@teste.com    -> Administrador')
  console.log('  tecnico@teste.com  -> Técnico (Carlos)')
  console.log('  tecnico2@teste.com -> Técnico (Paula)')
  console.log('  cliente@teste.com  -> Cliente (Maria)')
  console.log('  cliente2@teste.com -> Cliente (João)\n')
})
