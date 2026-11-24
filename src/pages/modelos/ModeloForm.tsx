import { useState, type FormEvent } from 'react'
import type { Modelo } from '../../models/Modelo'
import type { Marca } from '../../models/Marca'
import type { Categoria } from '../../models/Categoria'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'

interface ModeloFormProps {
  inicial: Modelo
  marcas: Marca[]
  categorias: Categoria[]
  ocupado: boolean
  onSalvar: (dados: Omit<Modelo,'id'>) => void
  onCancelar: () => void
}
export function ModeloForm({inicial,marcas,categorias,ocupado,onSalvar,onCancelar}: ModeloFormProps) {
  const [nome,setNome] = useState(inicial.nome)
  const [ano,setAno] = useState(inicial.ano ? String(inicial.ano) : '')
  const [marcaId,setMarcaId] = useState(inicial.marcaId)
  const [categoriaId,setCategoriaId] = useState(inicial.categoriaId)
  const [tentou,setTentou] = useState(false)
  const anoValido = /^[1-9][0-9]{3}$/.test(ano)
  function enviar(event: FormEvent) {
    event.preventDefault()
    setTentou(true)
    if (nome.trim() && anoValido && marcaId && categoriaId)
      onSalvar({nome:nome.trim(), ano:Number(ano), marcaId, categoriaId})
  }
  return <form className="card p-4 mb-4" onSubmit={enviar}><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar modelo' : 'Novo modelo'}</legend>
    <Input name="nome" label="Nome do modelo" value={nome} onChange={setNome}
      error={tentou && !nome.trim() ? 'Informe o nome.' : undefined} />
    <Input name="ano" label="Ano do modelo" value={ano} onChange={setAno}
      error={tentou && !anoValido ? 'Use quatro dígitos, por exemplo 2025.' : undefined} />
    <Select name="marcaId" label="Marca" value={marcaId} onChange={setMarcaId}
      options={marcas.map(m => ({value:m.id,label:m.nome}))} />
    <Select name="categoriaId" label="Categoria" value={categoriaId} onChange={setCategoriaId}
      options={categorias.map(c => ({value:c.id,label:c.nome}))} />
    <div className="d-flex gap-2"><Button label="Salvar" type="submit" disabled={ocupado} />
      <Button label="Cancelar" variant="secondary" onClick={onCancelar} /></div>
  </fieldset></form>
}