import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { clienteInicial, type Cliente } from '../../models/Cliente'
import { clienteService } from '../../service/clienteService'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/Table'
import { ClienteForm } from './ClienteForm'

interface Aviso { type: 'success' | 'danger'; message: string }
export function ClienteList() {
  const [clientes,setClientes] = useState<Cliente[]>([])
  const [carregando,setCarregando] = useState(true)
  const [tentativa,setTentativa] = useState(0)
  const [falha,setFalha] = useState(false)
  const [form,setForm] = useState<Cliente | null>(null)
  const [exclusao,setExclusao] = useState<Cliente | null>(null)
  const [ocupado,setOcupado] = useState(false)
  const [aviso,setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    clienteService.listar(controller.signal).then(lista => {
      if (!controller.signal.aborted) setClientes(lista)
    }).catch(() => {
      if (!controller.signal.aborted) setFalha(true)
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false)
    })
    return () => controller.abort()
  }, [tentativa])

  async function salvar(dados: Omit<Cliente,'id'>) {
    if (!form || ocupado) return
    setOcupado(true)
    try {
      const salva = form.id ? await clienteService.atualizar(form.id,dados) : await clienteService.criar(dados)
      setClientes(lista => form.id ? lista.map(m => m.id === salva.id ? salva : m) : [...lista,salva])
      setForm(null)
      setAviso({type:'success',message:'Cliente salvo.'})
    } catch (erro) {
      setAviso({type:'danger',message:erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao salvar. Confira a conexão com a API.'})
    } finally { setOcupado(false) }
  }

  async function excluir() {
    if (!exclusao || ocupado) return
    setOcupado(true)
    try {
      await clienteService.excluir(exclusao.id)
      setClientes(lista => lista.filter(m => m.id !== exclusao.id))
      setAviso({type:'success',message:'Cliente excluído.'})
    } catch (erro) {
      const mensagem = erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao excluir. Confira a conexão com a API.'
      setAviso({type:'danger',message:mensagem})
    } finally { setExclusao(null); setOcupado(false) }
  }

  return <main className="container py-5">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h1 className="display-4 mb-0">Clientes</h1>
      <Button label="Novo cliente" disabled={carregando || falha || Boolean(form)} onClick={() => {setAviso(null); setForm(clienteInicial)}} />
    </header>
    {aviso && <Alert {...aviso} />}
    {form && <ClienteForm key={form.id || 'nova'} inicial={form} ocupado={ocupado} onSalvar={salvar} onCancelar={() => setForm(null)} />}
    {carregando && <p role="status">Carregando clientes…</p>}
    {falha && <><Alert type="danger" message="Não foi possível carregar as clientes. Confira o JSON Server." />
      <Button label="Tentar novamente" onClick={() => {setFalha(false); setCarregando(true); setTentativa(n => n+1)}} /></>}
    {!falha && !carregando && (clientes.length ? <Table<Cliente> columns={[{title:'Cliente',render:m => m.nome},{title:'CPF',render:m => m.cpf},{title:'CNH',render:m => m.cnh},{title:'Telefone',render:m => m.telefone}]} data={clientes}
      disabled={Boolean(form) || ocupado} onEdit={m => {setAviso(null); setForm(m)}} onDelete={setExclusao} /> : <p>Nenhum cliente cadastrado.</p>)}
    <Modal show={Boolean(exclusao)} busy={ocupado} title="Excluir cliente" message={`Confirma a exclusão de ${exclusao?.nome ?? ''}?`}
      onClose={() => setExclusao(null)} onConfirm={excluir} />
  </main>
}


