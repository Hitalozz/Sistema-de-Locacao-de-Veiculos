interface InputProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}
export function Input({label, name, type='text', value, onChange, placeholder, error}: InputProps) {
  return <div className="mb-3">
    <label htmlFor={name} className="form-label">{label}</label>
    <input id={name} name={name} type={type} value={value} placeholder={placeholder}
      className={error ? 'form-control is-invalid' : 'form-control'}
      aria-invalid={Boolean(error)} aria-describedby={error ? name+'-erro' : undefined}
      onChange={event => onChange(event.target.value)} />
    {error && <div id={name+'-erro'} className="invalid-feedback">{error}</div>}
  </div>
}
