export default function Button({ variant = 'primary', loading, disabled, children, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} {...rest}>
      {loading ? 'Aguarde...' : children}
    </button>
  )
}
