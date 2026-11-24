import { useState } from 'react'
import type { Cliente } from '../../models/Cliente'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
interface Props {
  inicial: Cliente
  ocupado: boolean
  onSalvar: (dados: Omit<Cliente,'id'>) => void
  onCancelar: () => void
}
const campos = [
  ['nome','Nome','text'],['cpf','CPF','text'],['cnh','CNH','text'],
  ['validadeCnh','Validade da CNH','date'],['telefone','Telefone','tel'],
  ['email','E-mail','email'],['endereco','Endereço','text']
] as const
export function ClienteForm({inicial,ocupado,onSalvar,onCancelar}: Props) {
  const {id,...valores} = inicial
  const [dados,setDados] = useState(valores)
  return <form className="card p-4 mb-4" onSubmit={e => {e.preventDefault();onSalvar(dados)}}>
    <fieldset disabled={ocupado}><legend>{id ? 'Editar cliente' : 'Novo cliente'}</legend>
      {campos.map(([nome,label,type]) => <Input key={nome} name={nome} label={label} type={type}
        value={dados[nome]} onChange={valor => setDados(atual => ({...atual,[nome]:valor}))}/>)}
      <div className="d-flex gap-2"><Button label="Salvar" type="submit"/>
        <Button label="Cancelar" variant="secondary" onClick={onCancelar}/></div>
    </fieldset></form>
}
