import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <>
      <h1>Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link to="/">Voltar</Link>
    </>
  )
}
