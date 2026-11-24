import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { categoriaInicial, type Categoria } from '../../models/Categoria'
import { categoriaService } from '../../service/categoriaService'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/Table'
import { CategoriaForm } from './CategoriaForm'

const moeda = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})

interface Aviso { type: 'success' | 'danger'; message: string }
export function CategoriaList() {
  const [categorias,setCategorias] = useState<Categoria[]>([])
  const [carregando,setCarregando] = useState(true)
  const [tentativa,setTentativa] = useState(0)
  const [falha,setFalha] = useState(false)
  const [form,setForm] = useState<Categoria | null>(null)
  const [exclusao,setExclusao] = useState<Categoria | null>(null)
  const [ocupado,setOcupado] = useState(false)
  const [aviso,setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    categoriaService.listar(controller.signal).then(lista => {
      if (!controller.signal.aborted) setCategorias(lista)
    }).catch(() => {
      if (!controller.signal.aborted) setFalha(true)
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false)
    })
    return () => controller.abort()
  }, [tentativa])

  async function salvar(dados: Omit<Categoria, 'id'>) {
    if (!form || ocupado) return
    setOcupado(true)
    try {
      const salva = form.id ? await categoriaService.atualizar(form.id,dados) : await categoriaService.criar(dados)
      setCategorias(lista => form.id ? lista.map(m => m.id === salva.id ? salva : m) : [...lista,salva])
      setForm(null)
      setAviso({type:'success',message:'Categoria salva.'})
    } catch {
      setAviso({type:'danger',message:'Falha ao salvar. Confira a conexão com a API.'})
    } finally { setOcupado(false) }
  }

  async function excluir() {
    if (!exclusao || ocupado) return
    setOcupado(true)
    try {
      await categoriaService.excluir(exclusao.id)
      setCategorias(lista => lista.filter(m => m.id !== exclusao.id))
      setAviso({type:'success',message:'Categoria excluída.'})
    } catch (erro) {
      const mensagem = erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao excluir. Confira a conexão com a API.'
      setAviso({type:'danger',message:mensagem})
    } finally { setExclusao(null); setOcupado(false) }
  }

  return <main className="container py-5">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h1 className="display-4 mb-0">Categorias</h1>
      <Button label="Nova categoria" disabled={carregando || falha || Boolean(form)} onClick={() => {setAviso(null); setForm(categoriaInicial)}} />
    </header>
    {aviso && <Alert {...aviso} />}
    {form && <CategoriaForm key={form.id || 'nova'} inicial={form} ocupado={ocupado} onSalvar={salvar} onCancelar={() => setForm(null)} />}
    {carregando && <p role="status">Carregando categorias…</p>}
    {falha && <><Alert type="danger" message="Não foi possível carregar as categorias. Confira o JSON Server." />
      <Button label="Tentar novamente" onClick={() => {setFalha(false); setCarregando(true); setTentativa(n => n+1)}} /></>}
    {!falha && !carregando && (categorias.length ? <Table<Categoria> columns={[{title:'Categoria',render:c => c.nome}, {title:'Diária',render:c => moeda.format(c.valorLocacao)}]} data={categorias}
      disabled={Boolean(form) || ocupado} onEdit={m => {setAviso(null); setForm(m)}} onDelete={setExclusao} /> : <p>Nenhuma categoria cadastrada.</p>)}
    <Modal show={Boolean(exclusao)} busy={ocupado} title="Excluir categoria" message={`Confirma a exclusão de ${exclusao?.nome ?? ''}?`}
      onClose={() => setExclusao(null)} onConfirm={excluir} />
  </main>
}
