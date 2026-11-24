interface SelectProps {
  label: string
  name: string
  value: string
  options: {value: string; label: string}[]
  onChange: (value: string) => void
}
export function Select({label,name,value,options,onChange}: SelectProps) {
  return <div className="mb-3">
    <label className="form-label" htmlFor={name}>{label}</label>
    <select className="form-select" id={name} name={name} value={value} required
      onChange={event => onChange(event.target.value)}>
      <option value="">Selecione</option>
      {options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
    </select>
  </div>
}