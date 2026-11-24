import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { manutencaoInicial, type Manutencao } from '../../models/Manutencao'
import { manutencaoService } from '../../service/manutencaoService'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/Table'
import { ManutencaoForm } from './ManutencaoForm'

import type { Veiculo } from '../../models/Veiculo'
import { veiculoService } from '../../service/veiculoService'

interface Aviso { type: 'success' | 'danger'; message: string }
export function ManutencaoList() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [manutencoes,setManutencoes] = useState<Manutencao[]>([])
  const [carregando,setCarregando] = useState(true)
  const [tentativa,setTentativa] = useState(0)
  const [falha,setFalha] = useState(false)
  const [form,setForm] = useState<Manutencao | null>(null)
  const [exclusao,setExclusao] = useState<Manutencao | null>(null)
  const [ocupado,setOcupado] = useState(false)
  const [aviso,setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([manutencaoService.listar(signal), veiculoService.listar(signal)])
      .then(([lista, veiculos]) => {
      if (signal.aborted) return
      setManutencoes(lista)
      setVeiculos(veiculos)

    }).catch(() => {
      if (!controller.signal.aborted) setFalha(true)
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false)
    })
    return () => controller.abort()
  }, [tentativa])

  async function salvar(dados: Omit<Manutencao, 'id'>) {
    if (!form || ocupado) return
    setOcupado(true)
    try {
      const salva = form.id ? await manutencaoService.atualizar(form.id,dados) : await manutencaoService.criar(dados)
      setManutencoes(lista => form.id ? lista.map(m => m.id === salva.id ? salva : m) : [...lista,salva])
      setForm(null)
      setAviso({type:'success',message:'Manutenção salva.'})
    } catch (erro) {
      setAviso({type:'danger',message:erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao salvar. Confira a conexão com a API.'})
    } finally { setOcupado(false) }
  }

  async function excluir() {
    if (!exclusao || ocupado) return
    setOcupado(true)
    try {
      await manutencaoService.excluir(exclusao.id)
      setManutencoes(lista => lista.filter(m => m.id !== exclusao.id))
      setAviso({type:'success',message:'Manutenção excluída.'})
    } catch (erro) {
      const mensagem = erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao excluir. Confira a conexão com a API.'
      setAviso({type:'danger',message:mensagem})
    } finally { setExclusao(null); setOcupado(false) }
  }

  return <main className="container py-5">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h1 className="display-4 mb-0">Manutenções</h1>
      <Button label="Nova manutenção" disabled={carregando || falha || Boolean(form)} onClick={() => {setAviso(null); setForm(manutencaoInicial)}} />
    </header>
    {aviso && <Alert {...aviso} />}
    {form && <ManutencaoForm veiculos={veiculos} key={form.id || 'nova'} inicial={form} ocupado={ocupado} onSalvar={salvar} onCancelar={() => setForm(null)} />}
    {carregando && <p role="status">Carregando manutencoes…</p>}
    {falha && <><Alert type="danger" message="Não foi possível carregar os manutenções. Confira o JSON Server." />
      <Button label="Tentar novamente" onClick={() => {setFalha(false); setCarregando(true); setTentativa(n => n+1)}} /></>}
    {!falha && !carregando && (manutencoes.length ? <Table<Manutencao> columns={[
      {title:'Veículo', render:m => veiculos.find(v => v.id === m.veiculoId)?.placa ?? 'Indisponível'},
      {title:'Descrição', render:m => m.descricao},
      {title:'Data', render:m => m.data.split('-').reverse().join('/')},
      {title:'Valor', render:m => m.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})},
    ]} data={manutencoes}
      disabled={Boolean(form) || ocupado} onEdit={m => {setAviso(null); setForm(m)}} onDelete={setExclusao} /> : <p>Nenhuma manutenção cadastrada.</p>)}
    <Modal show={Boolean(exclusao)} busy={ocupado} title="Excluir manutenção" message={`Confirma a exclusão de ${exclusao?.descricao ?? ''}?`}
      onClose={() => setExclusao(null)} onConfirm={excluir} />
  </main>
}


