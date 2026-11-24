interface AlertProps {
  type: 'success' | 'danger' | 'warning'
  message: string
}
export function Alert({type, message}: AlertProps) {
  return <div role={type === 'success' ? 'status' : 'alert'} className={'alert alert-'+type}>{message}</div>
}
