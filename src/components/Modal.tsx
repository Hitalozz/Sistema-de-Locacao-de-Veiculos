import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'

interface ModalProps {
  show: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
  busy?: boolean
}
export function Modal({show,title,message,onClose,onConfirm,busy}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (show) dialog?.showModal()
    return () => dialog?.close()
  }, [show])
  return <dialog ref={ref} aria-labelledby={titleId} className="border-0 rounded shadow p-4"
    onCancel={e => { e.preventDefault(); if (!busy) onClose() }}>
    <h2 id={titleId}>{title}</h2><p>{message}</p>
    <div className="d-flex gap-2"><Button label="Cancelar" variant="secondary" disabled={busy} onClick={onClose} />
      <Button label="Confirmar exclusão" variant="danger" disabled={busy} onClick={onConfirm} /></div>
  </dialog>
}
