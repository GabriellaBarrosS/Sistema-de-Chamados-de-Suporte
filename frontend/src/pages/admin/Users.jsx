import { useCallback, useEffect, useState } from 'react'
import { listUsers, createUser, updateUser, deleteUser } from '../../services/userService'
import { getErrorMessage } from '../../services/api'
import { ROLES, ROLE_LABELS } from '../../constants'
import { useAuth } from '../../contexts/AuthContext'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { RoleBadge } from '../../components/ui/Badge'

const EMPTY = { nome: '', email: '', perfil: ROLES.CLIENTE, senha: '' }
const ROLE_OPTIONS = Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] }))

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null | { id?, ...campos }
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await listUsers())
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os usuários.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setFormError(''); setModal({ ...EMPTY }) }
  const openEdit = (u) => { setFormError(''); setModal({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, senha: '' }) }
  const onChange = (e) => setModal({ ...modal, [e.target.name]: e.target.value })

  async function save(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const { id, ...data } = modal
      if (id && !data.senha) delete data.senha // não altera a senha se vazia
      if (id) await updateUser(id, data)
      else await createUser(data)
      setModal(null)
      load()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Não foi possível salvar o usuário.'))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    try {
      await deleteUser(toDelete.id)
      setToDelete(null)
      load()
    } catch (err) {
      setToDelete(null)
      setError(getErrorMessage(err, 'Não foi possível excluir o usuário.'))
    }
  }

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'perfil', header: 'Perfil', render: (u) => <RoleBadge perfil={u.perfil} /> },
    {
      key: 'acoes',
      header: 'Ações',
      render: (u) => (
        <div className="row-actions">
          <Button variant="secondary" onClick={() => openEdit(u)}>Editar</Button>
          <Button variant="danger" disabled={u.id === me.id} onClick={() => setToDelete(u)}>Excluir</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Usuários</h1>
        <Button onClick={openNew}>Novo usuário</Button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <p className="muted">Carregando...</p> : <Table columns={columns} rows={users} />}

      <Modal
        open={!!modal}
        title={modal?.id ? 'Editar usuário' : 'Novo usuário'}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" form="user-form" loading={saving}>Salvar</Button>
          </>
        }
      >
        {modal && (
          <form id="user-form" onSubmit={save}>
            {formError && <div className="alert alert-error">{formError}</div>}
            <Input label="Nome" name="nome" value={modal.nome} onChange={onChange} required />
            <Input label="E-mail" name="email" type="email" value={modal.email} onChange={onChange} required />
            <Select label="Perfil" name="perfil" value={modal.perfil} onChange={onChange} options={ROLE_OPTIONS} />
            <Input
              label={modal.id ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
              name="senha"
              type="password"
              value={modal.senha}
              onChange={onChange}
              required={!modal.id}
              minLength={6}
            />
          </form>
        )}
      </Modal>

      <Modal
        open={!!toDelete}
        title="Excluir usuário"
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
