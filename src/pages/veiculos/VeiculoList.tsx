import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { veiculoInicial, type Veiculo } from '../../models/Veiculo'
import { veiculoService } from '../../service/veiculoService'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/Table'
import { VeiculoForm } from './VeiculoForm'

import type { Modelo } from '../../models/Modelo'
import { modeloService } from '../../service/modeloService'

interface Aviso { type: 'success' | 'danger'; message: string }
export function VeiculoList() {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [veiculos,setVeiculos] = useState<Veiculo[]>([])
  const [carregando,setCarregando] = useState(true)
  const [tentativa,setTentativa] = useState(0)
  const [falha,setFalha] = useState(false)
  const [form,setForm] = useState<Veiculo | null>(null)
  const [exclusao,setExclusao] = useState<Veiculo | null>(null)
  const [ocupado,setOcupado] = useState(false)
  const [aviso,setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([veiculoService.listar(signal), modeloService.listar(signal)])
      .then(([lista, modelos]) => {
      if (signal.aborted) return
      setVeiculos(lista)
      setModelos(modelos)

    }).catch(() => {
      if (!controller.signal.aborted) setFalha(true)
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false)
    })
    return () => controller.abort()
  }, [tentativa])

  async function salvar(dados: Omit<Veiculo, 'id'>) {
    if (!form || ocupado) return
    setOcupado(true)
    try {
      const salva = form.id ? await veiculoService.atualizar(form.id,dados) : await veiculoService.criar(dados)
      setVeiculos(lista => form.id ? lista.map(m => m.id === salva.id ? salva : m) : [...lista,salva])
      setForm(null)
      setAviso({type:'success',message:'Veículo salvo.'})
    } catch (erro) {
      setAviso({type:'danger',message:erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao salvar. Confira a conexão com a API.'})
    } finally { setOcupado(false) }
  }

  async function excluir() {
    if (!exclusao || ocupado) return
    setOcupado(true)
    try {
      await veiculoService.excluir(exclusao.id)
      setVeiculos(lista => lista.filter(m => m.id !== exclusao.id))
      setAviso({type:'success',message:'Veículo excluído.'})
    } catch (erro) {
      const mensagem = erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao excluir. Confira a conexão com a API.'
      setAviso({type:'danger',message:mensagem})
    } finally { setExclusao(null); setOcupado(false) }
  }

  return <main className="container py-5">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h1 className="display-4 mb-0">Veículos</h1>
      <Button label="Novo veículo" disabled={carregando || falha || Boolean(form)} onClick={() => {setAviso(null); setForm(veiculoInicial)}} />
    </header>
    {aviso && <Alert {...aviso} />}
    {form && <VeiculoForm modelos={modelos} key={form.id || 'nova'} inicial={form} ocupado={ocupado} onSalvar={salvar} onCancelar={() => setForm(null)} />}
    {carregando && <p role="status">Carregando veiculos…</p>}
    {falha && <><Alert type="danger" message="Não foi possível carregar os veículos. Confira o JSON Server." />
      <Button label="Tentar novamente" onClick={() => {setFalha(false); setCarregando(true); setTentativa(n => n+1)}} /></>}
    {!falha && !carregando && (veiculos.length ? <Table<Veiculo> columns={[
      {title:'Placa', render:v => v.placa},
      {title:'Modelo', render:v => modelos.find(m => m.id === v.modeloId)?.nome ?? 'Modelo indisponível'},
      {title:'Cor', render:v => v.cor},
      {title:'Ano', render:v => v.anoFabricacao},
      {title:'Km rodados', render:v => v.kmRodado.toLocaleString('pt-BR')},
    ]} data={veiculos}
      disabled={Boolean(form) || ocupado} onEdit={m => {setAviso(null); setForm(m)}} onDelete={setExclusao} /> : <p>Nenhum veículo cadastrado.</p>)}
    <Modal show={Boolean(exclusao)} busy={ocupado} title="Excluir veículo" message={`Confirma a exclusão de ${exclusao?.placa ?? ''}?`}
      onClose={() => setExclusao(null)} onConfirm={excluir} />
  </main>
}

