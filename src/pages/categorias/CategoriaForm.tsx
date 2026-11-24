import { useState, type FormEvent } from 'react'
import type { Categoria } from '../../models/Categoria'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

interface CategoriaFormProps {
  inicial: Categoria
  ocupado: boolean
  onSalvar: (dados: Omit<Categoria, 'id'>) => void
  onCancelar: () => void
}
export function CategoriaForm({inicial, ocupado, onSalvar, onCancelar}: CategoriaFormProps) {
  const [nome,setNome] = useState(inicial.nome)
  const [erro,setErro] = useState('')
  const [diaria, setDiaria] = useState(inicial.id ? inicial.valorLocacao.toFixed(2).replace('.', ',') : '')
  const [erroDiaria, setErroDiaria] = useState('')
  function enviar(event: FormEvent) {
    event.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome da categoria.'); return }
    const texto = diaria.trim()
    const valorLocacao = Number(texto.replace(',', '.'))
    if (!/^\d+([,.]\d{1,2})?$/.test(texto) || !Number.isFinite(valorLocacao) || valorLocacao <= 0) {
      setErroDiaria('Informe uma diária maior que zero, com até duas casas decimais.')
      return
    }
    onSalvar({ nome: nome.trim(), valorLocacao })
  }
  return <form onSubmit={enviar} className="card p-4 mb-4"><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar categoria' : 'Nova categoria'}</legend>
    <Input label="Nome da categoria" name="nome" value={nome} error={erro}
      onChange={valor => {setNome(valor); setErro('')}} />
    <Input label="Valor da diária (R$)" name="valorLocacao" value={diaria} placeholder="Ex.: 180,50"
      error={erroDiaria} onChange={valor => {setDiaria(valor); setErroDiaria('')}} />
    <div className="d-flex gap-2"><Button type="submit" label="Salvar" disabled={ocupado} />
      <Button label="Cancelar" variant="secondary" onClick={onCancelar} disabled={ocupado} /></div>
  </fieldset></form>
}
