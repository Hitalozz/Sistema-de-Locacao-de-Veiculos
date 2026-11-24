import { useState, type FormEvent } from 'react'
import type { Marca } from '../../models/Marca'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

interface MarcaFormProps {
  inicial: Marca
  ocupado: boolean
  onSalvar: (nome: string) => void
  onCancelar: () => void
}
export function MarcaForm({inicial, ocupado, onSalvar, onCancelar}: MarcaFormProps) {
  const [nome,setNome] = useState(inicial.nome)
  const [erro,setErro] = useState('')
  function enviar(event: FormEvent) {
    event.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome da marca.'); return }
    onSalvar(nome.trim())
  }
  return <form onSubmit={enviar} className="card p-4 mb-4"><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar marca' : 'Nova marca'}</legend>
    <Input label="Nome da marca" name="nome" value={nome} error={erro}
      onChange={valor => {setNome(valor); setErro('')}} />
    <div className="d-flex gap-2"><Button type="submit" label="Salvar" disabled={ocupado} />
      <Button label="Cancelar" variant="secondary" onClick={onCancelar} disabled={ocupado} /></div>
  </fieldset></form>
}
