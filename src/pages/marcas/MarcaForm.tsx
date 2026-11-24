import { logos } from '../../assets/logos'
import { useState, type FormEvent } from 'react'
import type { Marca } from '../../models/Marca'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

interface MarcaFormProps {
  inicial: Marca
  ocupado: boolean
  onSalvar: (nome: string, logo: string) => void
  onCancelar: () => void
}
export function MarcaForm({inicial, ocupado, onSalvar, onCancelar}: MarcaFormProps) {
  const [nome,setNome] = useState(inicial.nome)
  const [logo,setLogo] = useState(inicial.logo ?? '')
  const [erro,setErro] = useState('')
  function enviar(event: FormEvent) {
    event.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome da marca.'); return }
    onSalvar(nome.trim(),logo)
  }
  return <form onSubmit={enviar} className="card p-4 mb-4"><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar marca' : 'Nova marca'}</legend>
    <Input label="Nome da marca" name="nome" value={nome} error={erro}
      onChange={valor => {setNome(valor); setErro('')}} />
    <fieldset className="mb-3"><legend className="fs-6">Logo da marca</legend>
      <div className="d-flex flex-wrap gap-2">
        {Object.entries(logos).map(([chave,url]) => {
          const marca = chave.split('/').pop()?.replace(/\.png$/, '')
          return <label key={chave} className={'rounded p-2 border '+(logo === chave ? 'border-primary border-2' : '')}>
            <input type="radio" name="logo" checked={logo === chave} onChange={() => setLogo(chave)} aria-label={marca}/>
            <img src={url} alt={marca} width="72" height="48" style={{objectFit:'contain'}}/>
          </label>
        })}
        <label className="align-self-center"><input type="radio" name="logo" checked={!logo} onChange={() => setLogo('')}/> Sem logo</label>
      </div>
    </fieldset>
    <div className="d-flex gap-2"><Button type="submit" label="Salvar" disabled={ocupado} />
      <Button label="Cancelar" variant="secondary" onClick={onCancelar} disabled={ocupado} /></div>
  </fieldset></form>
}

