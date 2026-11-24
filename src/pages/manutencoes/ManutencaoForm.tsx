import { useState } from 'react'
import type { Veiculo } from '../../models/Veiculo'
import type { Manutencao } from '../../models/Manutencao'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
interface Props {
  inicial: Manutencao
  veiculos: Veiculo[]
  ocupado: boolean
  onSalvar: (dados: Omit<Manutencao,'id'>) => void
  onCancelar: () => void
}
export function ManutencaoForm({inicial,veiculos,ocupado,onSalvar,onCancelar}: Props) {
  const [veiculoId,setVeiculo] = useState(inicial.veiculoId)
  const [descricao,setDescricao] = useState(inicial.descricao)
  const [data,setData] = useState(inicial.data)
  const [valor,setValor] = useState(inicial.id ? String(inicial.valor) : '')
  return <form className="card p-4 mb-4" onSubmit={e => {
    e.preventDefault()
    onSalvar({veiculoId,descricao,data,valor:/^\d+([,.]\d{1,2})?$/.test(valor.trim()) ? Number(valor.replace(',','.')) : NaN})
  }}><fieldset disabled={ocupado}>
    <legend>{inicial.id ? 'Editar manutenção' : 'Nova manutenção'}</legend>
    <Select name="veiculoId" label="Veículo" value={veiculoId} onChange={setVeiculo} options={veiculos.map(v => ({value:v.id,label:v.placa}))}/>
    <Input name="descricao" label="Descrição do serviço" value={descricao} onChange={setDescricao}/>
    <Input name="data" type="date" label="Data da manutenção" value={data} onChange={setData}/>
    <Input name="valor" label="Valor (R$)" value={valor} onChange={setValor}/>
    <div className="d-flex gap-2"><Button label="Salvar" type="submit"/><Button label="Cancelar" variant="secondary" onClick={onCancelar}/></div>
  </fieldset></form>
}
