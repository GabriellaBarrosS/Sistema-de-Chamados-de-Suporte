import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { listTickets } from '../../services/ticketService'
import { listCategories } from '../../services/categoryService'
import { getErrorMessage } from '../../services/api'
import { STATUS, PRIORIDADES } from '../../constants'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'


const EMPTY_FILTERS = {
    busca: '',
    status: '',
    prioridade: '',
    categoriaId: '',
}

const toOptions = (obj) => Object.entries(obj).map(([value, o]) => ({ value, label: o.label }))
const STATUS_OPTIONS = toOptions(STATUS)
const PRIORIDADE_OPTIONS = toOptions(PRIORIDADES)

const formatDate = (iso) => 
    iso ? new Date(iso).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}) : '-'

export default function TicketList({title, emptyMessage, showClient = false, canCreate = false, onlyMine = false}) { 
    const navigate = useNavigate()
    const {state} = useLocation()
    const flash = state?.flash

    const [filters, setFilters] = useState(EMPTY_FILTERS)
    const [busca, setBusca] = useState('')
    const [tickets, setTickets] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        listCategories().then(setCategories).catch(() => [])
    }, [])

    useEffect(() => {
    const t = setTimeout(() => setBusca(filters.busca.trim()), 400)
    return () => clearTimeout(t)
  }, [filters.busca])
    useEffect(() => {
    let cancelled = false

    async function load(){
        setLoading(true)
        setError('')
        try {
            const params = {}
        if (busca) params.busca = busca
        if (filters.status) params.status = filters.status
        if (filters.prioridade) params.prioridade = filters.prioridade
        if (filters.categoriaId) params.categoriaId = filters.categoriaId
        if (onlyMine) params.atribuidos = true
        const data = await listTickets(params)
        if (!cancelled) setTickets(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Não foi possível carregar os chamados.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
        cancelled = true
    }
}, [busca, filters.status, filters.prioridade, filters.categoriaId, onlyMine])

const hasFilters = Object.values(filters).some(Boolean)

const onChange = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }))
const clearFilters = () => {
  setFilters(EMPTY_FILTERS)
  setBusca('')
}

const columns = [
    {key: 'id', header: '#'},
    {key: 'titulo', header: 'Titulo'},
    {key: 'categoria', header: 'Categoria', render: (t) => t.categoria?.nome || '-' }, 
    {key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    ...(showClient
    ? [{ key: 'cliente', header: 'Cliente', render: (t) => t.cliente?.nome || '—' }] : []),
    {key: 'crieadoEm', header: 'Aberto em', render: (t) => formatDate(t.criadoEm)},
    ]

    return (
        <>
        <div className="page-header">
            <h1 className="page-title">{title}</h1>
            {canCreate && <Button onClick={() => navigate('/chamados/novo')}>Novo chamado</Button>}
        </div>

        {flash && <div className="alert alert-success">{flash}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters">
            <Input 
            label="Buscar"
            name="busca"
            value={filters.busca}
            onChange={onChange}
            placeholder="Título ou descrição" />
            <Select
            label="Status"
            name="status"
            value={filters.status}
            onChange={onChange}
            options={STATUS_OPTIONS}
            placeholder="Todos" />
            <Select
            label="Prioridade"
            name="prioridade"
            value={filters.prioridade}
            onChange={onChange}
            options={PRIORIDADE_OPTIONS}
            placeholder="Todas" />
            <Select 
            label="Categoria"
            name="categoriaId"
            value={filters.categoriaId}
            onChange={onChange}
            options={categories.map((c) => ({value: c.id, label: c.nome}))}
            placeholdere="Todas"/>
            <Button variant="secondary" onClick={clearFilters} disabled={!hasFilters}>
                Limpar filtros
            </Button>
        </div>
        {loading ? (
            <p className="mudted">Carregando...</p>
            ) : (
                <Table
                columns={columns}
                rows={tickets}
                empty={hasFilters ? 'Nenhum chamado encontrado com esses filtros.' : emptyMessage} />
            )}
        </>
    )
}