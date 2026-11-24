import { useId, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { vistoriaService } from '../../service/vistoriaService'
import type { Vistoria } from '../../models/Vistoria'

interface Props {
  locacaoId: string
  placa: string
  kmAtual?: number
}
export function VistoriaRetirada({locacaoId,placa,kmAtual}: Props) {
  const janela = useRef<HTMLDialogElement>(null)
  const titulo = useId()
  const [salva,setSalva] = useState<Vistoria>()
  const [km,setKm] = useState(String(kmAtual ?? ''))
  const [nivel,setNivel] = useState('')
  const [condicoes,setCondicoes] = useState('')
  const [ocupado,setOcupado] = useState(false)
  const [pronto,setPronto] = useState(false)
  const [erro,setErro] = useState('')

  async function abrir() {
    janela.current?.showModal()
    setErro('')
    setPronto(false)
    setOcupado(true)
    try {
      setSalva(await vistoriaService.buscar(locacaoId))
      setPronto(true)
    } catch {setErro('Falha ao consultar a vistoria. Feche e tente novamente.')}
    finally {setOcupado(false)}
  }
  async function salvar() {
    if (ocupado) return
    setOcupado(true)
    setErro('')
    try {
      setSalva(await vistoriaService.registrar(locacaoId,km.trim() ? Number(km) : NaN,
        nivel.trim() ? Number(nivel) : NaN,condicoes))
    } catch (e) {
      setErro(e instanceof Error && !isAxiosError(e) ? e.message : 'Falha ao registrar. Confira o JSON Server e tente novamente.')
    } finally {setOcupado(false)}
  }

  return <>
    <Button label="Vistoria de retirada" variant="secondary" onClick={abrir}/>
    <dialog ref={janela} className="mega-contrato" aria-labelledby={titulo} onCancel={e => {if (ocupado) e.preventDefault()}}>
      <header><strong>MEGA MOTORS</strong><h2 id={titulo}>Vistoria de retirada</h2><p>Placa {placa}</p></header>
      {ocupado && <p role="status">Aguarde…</p>}
      {erro && <p role="alert">{erro}</p>}
      {pronto && (salva ? <section>
        <p>Registrada em {new Date(salva.registradaEm).toLocaleString('pt-BR')}</p>
        <dl><div><dt>Quilometragem</dt><dd>{salva.quilometragem} km</dd></div>
        <div><dt>Combustível</dt><dd>{salva.combustivel}%</dd></div>
        <div><dt>Condições do veículo</dt><dd>{salva.condicoes}</dd></div></dl>
      </section> : <form onSubmit={e => {e.preventDefault();void salvar()}}>
        <fieldset disabled={ocupado}>
          <Input name={titulo+'-km'} label="Quilometragem na retirada (km)" type="number" value={km} onChange={setKm}/>
          <Input name={titulo+'-nivel'} label="Combustível (%)" type="number" value={nivel} onChange={setNivel}/>
          <Input name={titulo+'-condicoes'} label="Condições do veículo" value={condicoes} onChange={setCondicoes}/>
          <Button type="submit" label="Registrar vistoria"/>
        </fieldset></form>)}
      <div className="mt-3"><Button label="Fechar" variant="secondary" disabled={ocupado} onClick={() => janela.current?.close()}/></div>
    </dialog>
  </>
}
