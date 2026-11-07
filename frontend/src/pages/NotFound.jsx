import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <p>Esta página não existe ou ainda não foi implementada.</p>
      <Link to="/">Voltar</Link>
    </>
  )
}
