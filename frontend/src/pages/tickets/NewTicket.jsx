import { useEffect, useState } from 'react'
import { listCategories } from '../../services/categoryService'
import { createTicket } from '../../services/ticketService'
import { getErrorMessage } from '../../services/api'
import { PRIORIDADES } from '../../constants'
import Button from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { useNavigate } from 'react-router-dom'

const EMPTY = {
  titulo: '',
  descricao: '',
  categoriaId: '',
  prioridade: 'media',
}

const PRIORIDADE_OPTIONS = Object.entries(PRIORIDADES).map(([value, p]) => ({ value, label: p.label, }))

function validate(form) {
    const errors = {}
    if (form.titulo.trim(). length < 3) errors.titulo = 'O título deve ter pelo menos 3 caracteres'
    if (form.descricao.trim().length < 10) errors.descricao = 'A descrição deve ter pelo menos 10 caracteres'
    if (!form.categoriaId) errors.categoriaId = 'Selecione uma categoria'
    if (!form.prioridade) errors.prioridade = 'Selecione uma prioridade'
    return errors
}

export default function NewTicket() {
    const navigate = useNavigate()
    const [form, setForm] = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load(){
            try {
                setCategories(await listCategories())
            } catch (err) {
                setLoadError(getErrorMessage(err, 'Não foi possível carregar as categorias'))
            } finally {
                setLoadingCategories(false)
            }
        }
        load()
    }, [])

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.nome }))

    function onChange(e) {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitError('')

        const found = validate(form)
        setErrors(found)
        if (Object.keys(found).length > 0) return
        const categoria = categories.find((c) => String(c.id) === String(form.categoriaId))

        setSaving(true)
        try {
            await createTicket({
                titulo: form.titulo.trim(),
                descricao: form.descricao.trim(),
                categoriaId: categoria.id,
                prioridade: form.prioridade,
            })
            navigate('/chamados', { state: { flash: 'Chamado aberto com sucesso!' } })
        } catch (err) {
            setSubmitError(getErrorMessage(err, 'Não foi possível abrir o chamado.'))
            setSaving(false)
        }
    }
    
    const semCategorias = !loadingCategories && !loadError && categories.length === 0

    return (
        <>
        <div className="page-header">
            <h1 className="page-title">Abrir novo chamado</h1>
        </div>

        <form className="form-card" onSubmit={handleSubmit} noValidate>
            {submitError && <div className="alert alert-error">{submitError}</div>}
            {semCategorias && (<div className="alert alert-error">Nenhuma categoria cadastrada.</div>)}

            <Input
                label="Título"
                name="titulo"
                value={form.titulo}
                onChange={onChange}
                error={errors.titulo}
                maxLength={120}
                placeholder="Digite o título do chamado"
            />

            <Textarea
                label="Descrição"
                name="descricao"
                value={form.descricao}
                onChange={onChange}
                error={errors.descricao}
                rows={6}
                placeholder="Digite a descrição do chamado"
            />

            <Select
                label="Categoria"
                name="categoriaId"
                value={form.categoriaId}
                onChange={onChange}
                error={errors.categoriaId}
                options={categoryOptions}
                placeholder={loadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria'}
                disabled={loadingCategories || categories.length === 0}
            />

            <Select
                label="Prioridade"
                name="prioridade"
                value={form.prioridade}
                onChange={onChange}
                error={errors.prioridade}
                options={PRIORIDADE_OPTIONS}
                placeholder="Selecione a prioridade"
            />

            <div className="form-actions">
                <Button type="button" variant="secondary"
                    onClick={() => { setForm(EMPTY)
                        setForm(EMPTY) 
                        setErrors({})
                        setSubmitError('')
                    }}
                >
                    Limpar
                </Button>
                <Button type="submit" loading={saving} disabled={loadingCategories || categories.length === 0}>
                    Abrir chamado
                </Button>
            </div>
        </form>
        </>
    )
}