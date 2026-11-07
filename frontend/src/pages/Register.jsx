import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import { getErrorMessage } from '../services/api'
import { Input } from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.senha.length < 6) return setError('A senha deve ter ao menos 6 caracteres.')
    if (form.senha !== form.confirmar) return setError('As senhas não conferem.')

    setLoading(true)
    try {
      // Cadastro público cria sempre um usuário "cliente"; técnicos/admins são criados pelo administrador
      await register({ nome: form.nome, email: form.email, senha: form.senha })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível concluir o cadastro.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Criar conta</h1>
        <p className="muted">Cadastre-se para abrir e acompanhar chamados.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <Input label="Nome" name="nome" value={form.nome} onChange={onChange} required autoFocus />
        <Input label="E-mail" name="email" type="email" value={form.email} onChange={onChange} required />
        <Input label="Senha" name="senha" type="password" value={form.senha} onChange={onChange} required />
        <Input label="Confirmar senha" name="confirmar" type="password" value={form.confirmar} onChange={onChange} required />
        <Button type="submit" loading={loading}>Cadastrar</Button>
        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  )
}
