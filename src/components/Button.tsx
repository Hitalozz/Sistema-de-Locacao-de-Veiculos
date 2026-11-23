interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}
export function Button({label, variant='primary', type='button', onClick, disabled=false}: ButtonProps) {
  return <button className={`btn btn-${variant} action`} type={type} onClick={onClick} disabled={disabled}>{label}</button>
}
