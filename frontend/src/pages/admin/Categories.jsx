import { useCallback, useEffect, useState } from 'react'
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService'
import { getErrorMessage } from '../../services/api'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'

const EMPTY = { nome: '', descricao: '' }

export default function Categories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await listCategories())
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as categorias.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setFormError(''); setModal({ ...EMPTY }) }
  const openEdit = (c) => { setFormError(''); setModal({ id: c.id, nome: c.nome, descricao: c.descricao || '' }) }
  const onChange = (e) => setModal({ ...modal, [e.target.name]: e.target.value })

  async function save(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const { id, ...data } = modal
      if (id) await updateCategory(id, data)
      else await createCategory(data)
      setModal(null)
      load()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Não foi possível salvar a categoria.'))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    try {
      await deleteCategory(toDelete.id)
      setToDelete(null)
      load()
    } catch (err) {
      setToDelete(null)
      setError(getErrorMessage(err, 'Não foi possível excluir a categoria (ela pode estar em uso).'))
    }
  }

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'descricao', header: 'Descrição', render: (c) => c.descricao || '—' },
    {
      key: 'acoes',
      header: 'Ações',
      render: (c) => (
        <div className="row-actions">
          <Button variant="secondary" onClick={() => openEdit(c)}>Editar</Button>
          <Button variant="danger" onClick={() => setToDelete(c)}>Excluir</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Categorias</h1>
        <Button onClick={openNew}>Nova categoria</Button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <p className="muted">Carregando...</p> : <Table columns={columns} rows={items} />}

      <Modal
        open={!!modal}
        title={modal?.id ? 'Editar categoria' : 'Nova categoria'}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" form="category-form" loading={saving}>Salvar</Button>
          </>
        }
      >
        {modal && (
          <form id="category-form" onSubmit={save}>
            {formError && <div className="alert alert-error">{formError}</div>}
            <Input label="Nome" name="nome" value={modal.nome} onChange={onChange} required />
            <Textarea label="Descrição" name="descricao" value={modal.descricao} onChange={onChange} />
          </form>
        )}
      </Modal>

      <Modal
        open={!!toDelete}
        title="Excluir categoria"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
          </>
        }
      >
        Deseja realmente excluir <strong>{toDelete?.nome}</strong>?
      </Modal>
    </>
  )
}
