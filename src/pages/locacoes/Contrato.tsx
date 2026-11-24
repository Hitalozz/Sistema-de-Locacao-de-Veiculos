import { useId, useRef } from 'react'
import { Button } from '../../components/Button'
import type { Locacao } from '../../service/locacaoService'

interface Props {
  reserva: Locacao
  cliente: string
  modelo: string
  placa: string
  dias: number
}
const moeda = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})
const data = (iso: string) => iso.split('-').reverse().join('/')

export function Contrato({reserva, cliente, modelo, placa, dias}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const titulo = useId()
  const campos = [
    ['Cliente', cliente], ['Modelo', modelo], ['Placa', placa],
    ['Retirada', data(reserva.retirada)], ['Devolução prevista', data(reserva.devolucaoPrevista)],
    ['Quantidade de diárias', String(dias)], ['Valor da diária', moeda.format(reserva.valorDiaria)],
    ['Total previsto', moeda.format(reserva.valorPrevisto)]
  ]
  return <>
    <Button label="Ver contrato" variant="secondary" onClick={() => dialogo.current?.showModal()} />
    <dialog ref={dialogo} aria-labelledby={titulo} className="mega-contrato">
      <header><strong>MEGA MOTORS</strong><h2 id={titulo}>Contrato de locação</h2>
        <p>Reserva {reserva.id}</p></header>
      <dl>{campos.map(([rotulo,valor]) => <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>)}</dl>
      <Button label="Fechar" onClick={() => dialogo.current?.close()} />
    </dialog>
  </>
}
