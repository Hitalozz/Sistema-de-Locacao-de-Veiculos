import { useId, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { Button } from '../../components/Button'
import { emitirNota, type NotaFiscal } from '../../service/notaFiscalService'

const moeda = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})
const data = (iso: string) => iso.split('-').reverse().join('/')

export function NotaDaLocacao({locacaoId}: {locacaoId: string}) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const titulo = useId()
  const [nota,setNota] = useState<NotaFiscal>()
  const [erro,setErro] = useState('')
  const [ocupado,setOcupado] = useState(false)

  async function abrir() {
    dialogo.current?.showModal()
    setNota(undefined)
    setErro('')
    setOcupado(true)
    try {setNota(await emitirNota(locacaoId))}
    catch (e) {setErro(isAxiosError(e) ? e.response?.data?.mensagem ?? 'Confira a conexão com a API.' : e instanceof Error ? e.message : 'Falha ao emitir a nota.')}
    finally {setOcupado(false)}
  }

  return <>
    <Button label={nota ? 'Ver nota' : 'Emitir / ver nota'} variant="secondary" disabled={ocupado} onClick={abrir}/>
    <dialog ref={dialogo} className="mega-contrato" aria-labelledby={titulo}>
      <header><strong>MEGA MOTORS</strong><h2 id={titulo}>Nota fiscal simulada</h2></header>
      {ocupado && <p role="status">Consultando locação…</p>}
      {erro && <p role="alert">{erro}</p>}
      {nota && <><p>Nº {String(nota.numero).padStart(6,'0')} · {new Date(nota.emitidaEm).toLocaleDateString('pt-BR')}</p>
        <dl>{[
          ['Cliente',nota.cliente],['Veículo',nota.modelo+' · '+nota.placa],
          ['Retirada',data(nota.retirada)],['Devolução prevista',data(nota.devolucaoPrevista)],
          ['Diária',moeda.format(nota.diaria)],['Total da locação',moeda.format(nota.total)]
        ].map(([nome,valor]) => <div key={nome}><dt>{nome}</dt><dd>{valor}</dd></div>)}</dl>
        <p>Simulação acadêmica · sem valor fiscal</p></>}
      <Button label="Fechar" onClick={() => dialogo.current?.close()}/>
    </dialog>
  </>
}

