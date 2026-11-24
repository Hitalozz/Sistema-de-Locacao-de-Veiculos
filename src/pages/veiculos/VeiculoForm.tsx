import { useState, type FormEvent } from 'react'
import type { Veiculo } from '../../models/Veiculo'
import type { Modelo } from '../../models/Modelo'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'

const fontes = import.meta.glob<string>('/src/assets/frota/*.{png,jpg,jpeg,webp,avif}', {eager:true, import:'default', query:'?url'})
const arquivos = fontes

interface Props {
  inicial: Veiculo
  modelos: Modelo[]
  ocupado: boolean
  onSalvar: (dados: Omit<Veiculo, 'id'>) => void
  onCancelar: () => void
}

export function VeiculoForm({ inicial, modelos, ocupado, onSalvar, onCancelar }: Props) {
  const [placa, setPlaca] = useState(inicial.placa)
  const [chassi, setChassi] = useState(inicial.chassi)
  const [cor, setCor] = useState(inicial.cor)
  const [ano, setAno] = useState(inicial.anoFabricacao ? String(inicial.anoFabricacao) : '')
  const [km, setKm] = useState(String(inicial.kmRodado))
  const [modeloId, setModeloId] = useState(inicial.modeloId)

  const [foto,setFoto] = useState(inicial.foto ?? '')

  const opcoes = Object.entries(arquivos).map(([caminho]) => [caminho.split('/').pop()!.replace(/\.[^.]+$/, ''),caminho])
  if (inicial.foto && !opcoes.some(([,url]) => url === inicial.foto)) opcoes.unshift(['Foto atual',inicial.foto])
  function enviar(event: FormEvent) {
    event.preventDefault()
    onSalvar({ foto:foto.trim(), placa, chassi, cor, modeloId, anoFabricacao: Number(ano), kmRodado: km.trim() ? Number(km) : NaN })
  }

  return <form className="card p-4 mb-4" onSubmit={enviar}><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar veículo' : 'Novo veículo'}</legend>
    <Select name="modelo" label="Modelo" value={modeloId} onChange={setModeloId}
      options={modelos.map(m => ({ value: m.id, label: m.nome }))} />
    <Input name="placa" label="Placa" value={placa} onChange={setPlaca} placeholder="ABC1D23" />
    <Input name="chassi" label="Chassi" value={chassi} onChange={setChassi} />
    <fieldset className="mb-3">
      <legend className="fs-6">Foto do veículo</legend>
      <div className="d-flex flex-wrap gap-2">
        {opcoes.map(([nome,url]) => <label key={url} className={'border rounded p-2 ' + (foto === url ? 'border-primary border-2' : '')}>
          <input type="radio" name="foto-veiculo" checked={foto === url} onChange={() => setFoto(url)} />
          <img src={arquivos[url] ?? url} alt={nome} style={{width:110,height:70,objectFit:'contain'}}/>
          <span className="d-block text-center">{nome}</span>
        </label>)}
        <label className="align-self-center"><input type="radio" name="foto-veiculo" checked={!foto} onChange={() => setFoto('')}/> Sem foto</label>
      </div>
    </fieldset>
    <Input name="cor" label="Cor" value={cor} onChange={setCor} />
    <Input name="ano" label="Ano de fabricação" type="number" value={ano} onChange={setAno} />
    <Input name="km" label="Quilometragem" value={km} onChange={setKm} />
    <div className="d-flex gap-2">
      <Button label="Salvar" type="submit" disabled={ocupado} />
      <Button label="Cancelar" variant="secondary" onClick={onCancelar} />
    </div>
  </fieldset></form>
}


