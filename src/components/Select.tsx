interface SelectProps {
  vazio?: string
  label: string
  name: string
  value: string
  options: {value: string; label: string}[]
  onChange: (value: string) => void
}
export function Select({label,name,value,options,onChange,vazio}: SelectProps) {
  return <div className="mb-3">
    <label className="form-label" htmlFor={name}>{label}</label>
    <select className="form-select" id={name} name={name} value={value} required={!vazio}
      onChange={event => onChange(event.target.value)}>
      <option value="">{vazio ?? 'Selecione'}</option>
      {options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
    </select>
  </div>
}
