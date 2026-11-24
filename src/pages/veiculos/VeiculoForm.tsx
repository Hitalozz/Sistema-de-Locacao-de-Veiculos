import { useState, type FormEvent } from 'react'
import type { Veiculo } from '../../models/Veiculo'
import type { Modelo } from '../../models/Modelo'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'

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

  function enviar(event: FormEvent) {
    event.preventDefault()
    onSalvar({ placa, chassi, cor, modeloId, anoFabricacao: Number(ano), kmRodado: km.trim() ? Number(km) : NaN })
  }

  return <form className="card p-4 mb-4" onSubmit={enviar}><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar veículo' : 'Novo veículo'}</legend>
    <Select name="modelo" label="Modelo" value={modeloId} onChange={setModeloId}
      options={modelos.map(m => ({ value: m.id, label: m.nome }))} />
    <Input name="placa" label="Placa" value={placa} onChange={setPlaca} placeholder="ABC1D23" />
    <Input name="chassi" label="Chassi" value={chassi} onChange={setChassi} />
    <Input name="cor" label="Cor" value={cor} onChange={setCor} />
    <Input name="ano" label="Ano de fabricação" type="number" value={ano} onChange={setAno} />
    <Input name="km" label="Quilometragem" value={km} onChange={setKm} />
    <div className="d-flex gap-2">
      <Button label="Salvar" type="submit" disabled={ocupado} />
      <Button label="Cancelar" variant="secondary" onClick={onCancelar} />
    </div>
  </fieldset></form>
}
