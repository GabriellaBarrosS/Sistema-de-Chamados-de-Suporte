export function Input({ label, error, id, ...rest }) {
  const inputId = id || rest.name
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={error ? 'has-error' : ''} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function Select({ label, error, id, options = [], placeholder, ...rest }) {
  const inputId = id || rest.name
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <select id={inputId} className={error ? 'has-error' : ''} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, id, ...rest }) {
  const inputId = id || rest.name
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <textarea id={inputId} rows={4} className={error ? 'has-error' : ''} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
