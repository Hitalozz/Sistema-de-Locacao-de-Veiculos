import { useId,useRef,useState } from 'react'
import { isAxiosError } from 'axios'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { pagar,saldoRestante,type Pagamento } from '../../service/pagamentoService'
import type { Locacao } from '../../service/locacaoService'
const moeda = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})
interface Props { reserva:Locacao; lista:Pagamento[]; atualizar:()=>void }
export function Pagamentos({reserva,lista,atualizar}:Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [valor,setValor] = useState('')
  const [forma,setForma] = useState('Pix')
  const [msg,setMsg] = useState('')
  const [ocupado,setOcupado] = useState(false)
  const saldo = saldoRestante(reserva.valorPrevisto,lista)
  async function salvar() {
    const quantia = Number(valor.replace(',','.'))
    if (!/^\d+([,.]\d{1,2})?$/.test(valor) || quantia <= 0 || quantia > saldo) {
      setMsg('Informe um valor positivo até o saldo restante.'); return
    }
    setOcupado(true)
    try {
      await pagar({id:crypto.randomUUID(),locacaoId:reserva.id,valor:quantia,forma,data:new Date().toISOString()})
      setValor(''); setMsg('Pagamento registrado.')
    } catch(e) {setMsg(isAxiosError(e) ? e.response?.data?.mensagem ?? 'Confira a conexão com a API.' : 'Falha ao registrar.')}
    finally {atualizar();setOcupado(false)}
  }
  return <><Button label="Pagamentos" variant="secondary" onClick={() => {atualizar();setMsg('');dialogo.current?.showModal()}}/>
    <dialog ref={dialogo} className="mega-contrato" aria-labelledby={id}><h2 id={id}>Pagamentos</h2>
      <p>Total previsto {moeda.format(reserva.valorPrevisto)} · Saldo {moeda.format(saldo)}</p>
      <ul>{lista.map(p => <li key={p.id}>{new Date(p.data).toLocaleDateString('pt-BR')} · {p.forma} · {moeda.format(p.valor)}</li>)}</ul>
      {saldo > 0 && reserva.status !== 'cancelada' && <form onSubmit={e => {e.preventDefault();void salvar()}}><fieldset disabled={ocupado}>
        <Input name={id+'valor'} label="Valor pago (R$)" value={valor} onChange={setValor}/>
        <Select name={id+'forma'} label="Forma de pagamento" options={['Pix','Dinheiro','Cartão'].map(v=>({label:v,value:v}))} value={forma} onChange={setForma}/>
        <Button type="submit" label="Registrar pagamento"/></fieldset></form>}
      <p role="status">{msg}</p><Button label="Fechar" onClick={()=>dialogo.current?.close()}/>
    </dialog></>
}
