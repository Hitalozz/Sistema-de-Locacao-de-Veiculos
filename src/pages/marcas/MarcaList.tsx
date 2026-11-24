import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { marcaInicial, type Marca } from '../../models/Marca'
import { marcaService } from '../../service/marcaService'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/Table'
import { MarcaForm } from './MarcaForm'

interface Aviso { type: 'success' | 'danger'; message: string }
export function MarcaList() {
  const [marcas,setMarcas] = useState<Marca[]>([])
  const [carregando,setCarregando] = useState(true)
  const [tentativa,setTentativa] = useState(0)
  const [falha,setFalha] = useState(false)
  const [form,setForm] = useState<Marca | null>(null)
  const [exclusao,setExclusao] = useState<Marca | null>(null)
  const [ocupado,setOcupado] = useState(false)
  const [aviso,setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    marcaService.listar(controller.signal).then(lista => {
      if (!controller.signal.aborted) setMarcas(lista)
    }).catch(() => {
      if (!controller.signal.aborted) setFalha(true)
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false)
    })
    return () => controller.abort()
  }, [tentativa])

  async function salvar(nome: string, logo: string) {
    if (!form || ocupado) return
    setOcupado(true)
    try {
      const salva = form.id ? await marcaService.atualizar(form.id,{nome,logo}) : await marcaService.criar({nome,logo})
      setMarcas(lista => form.id ? lista.map(m => m.id === salva.id ? salva : m) : [...lista,salva])
      setForm(null)
      setAviso({type:'success',message:'Marca salva.'})
    } catch {
      setAviso({type:'danger',message:'Falha ao salvar. Confira a conexão com a API.'})
    } finally { setOcupado(false) }
  }

  async function excluir() {
    if (!exclusao || ocupado) return
    setOcupado(true)
    try {
      await marcaService.excluir(exclusao.id)
      setMarcas(lista => lista.filter(m => m.id !== exclusao.id))
      setAviso({type:'success',message:'Marca excluída.'})
    } catch (erro) {
      const mensagem = erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao excluir. Confira a conexão com a API.'
      setAviso({type:'danger',message:mensagem})
    } finally { setExclusao(null); setOcupado(false) }
  }

  return <main className="container py-5">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h1 className="display-4 mb-0">Marcas</h1>
      <Button label="Nova marca" disabled={carregando || falha || Boolean(form)} onClick={() => {setAviso(null); setForm(marcaInicial)}} />
    </header>
    {aviso && <Alert {...aviso} />}
    {form && <MarcaForm key={form.id || 'nova'} inicial={form} ocupado={ocupado} onSalvar={salvar} onCancelar={() => setForm(null)} />}
    {carregando && <p role="status">Carregando marcas…</p>}
    {falha && <><Alert type="danger" message="Não foi possível carregar as marcas. Confira o JSON Server." />
      <Button label="Tentar novamente" onClick={() => {setFalha(false); setCarregando(true); setTentativa(n => n+1)}} /></>}
    {!falha && !carregando && (marcas.length ? <Table<Marca> columns={[{title:'Marca',render:m => m.nome}]} data={marcas}
      disabled={Boolean(form) || ocupado} onEdit={m => {setAviso(null); setForm(m)}} onDelete={setExclusao} /> : <p>Nenhuma marca cadastrada.</p>)}
    <Modal show={Boolean(exclusao)} busy={ocupado} title="Excluir marca" message={`Confirma a exclusão de ${exclusao?.nome ?? ''}?`}
      onClose={() => setExclusao(null)} onConfirm={excluir} />
  </main>
}

