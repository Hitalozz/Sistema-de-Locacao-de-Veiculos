import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { modeloInicial, type Modelo } from '../../models/Modelo'
import { modeloService } from '../../service/modeloService'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/Table'
import { ModeloForm } from './ModeloForm'

import type { Marca } from '../../models/Marca'
import type { Categoria } from '../../models/Categoria'
import { marcaService } from '../../service/marcaService'
import { categoriaService } from '../../service/categoriaService'

interface Aviso { type: 'success' | 'danger'; message: string }
export function ModeloList() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [modelos,setModelos] = useState<Modelo[]>([])
  const [carregando,setCarregando] = useState(true)
  const [tentativa,setTentativa] = useState(0)
  const [falha,setFalha] = useState(false)
  const [form,setForm] = useState<Modelo | null>(null)
  const [exclusao,setExclusao] = useState<Modelo | null>(null)
  const [ocupado,setOcupado] = useState(false)
  const [aviso,setAviso] = useState<Aviso | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([modeloService.listar(signal), marcaService.listar(signal), categoriaService.listar(signal)])
      .then(([lista, fabricantes, classes]) => {
      if (signal.aborted) return
      setModelos(lista)
      setMarcas(fabricantes)
      setCategorias(classes)
    }).catch(() => {
      if (!controller.signal.aborted) setFalha(true)
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false)
    })
    return () => controller.abort()
  }, [tentativa])

  async function salvar(dados: Omit<Modelo, 'id'>) {
    if (!form || ocupado) return
    setOcupado(true)
    try {
      const salva = form.id ? await modeloService.atualizar(form.id,dados) : await modeloService.criar(dados)
      setModelos(lista => form.id ? lista.map(m => m.id === salva.id ? salva : m) : [...lista,salva])
      setForm(null)
      setAviso({type:'success',message:'Modelo salvo.'})
    } catch {
      setAviso({type:'danger',message:'Falha ao salvar. Confira a conexão com a API.'})
    } finally { setOcupado(false) }
  }

  async function excluir() {
    if (!exclusao || ocupado) return
    setOcupado(true)
    try {
      await modeloService.excluir(exclusao.id)
      setModelos(lista => lista.filter(m => m.id !== exclusao.id))
      setAviso({type:'success',message:'Modelo excluído.'})
    } catch (erro) {
      const mensagem = erro instanceof Error && !isAxiosError(erro) ? erro.message : 'Falha ao excluir. Confira a conexão com a API.'
      setAviso({type:'danger',message:mensagem})
    } finally { setExclusao(null); setOcupado(false) }
  }

  return <main className="container py-5">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h1 className="display-4 mb-0">Modelos</h1>
      <Button label="Novo modelo" disabled={carregando || falha || Boolean(form)} onClick={() => {setAviso(null); setForm(modeloInicial)}} />
    </header>
    {aviso && <Alert {...aviso} />}
    {form && <ModeloForm marcas={marcas} categorias={categorias} key={form.id || 'nova'} inicial={form} ocupado={ocupado} onSalvar={salvar} onCancelar={() => setForm(null)} />}
    {carregando && <p role="status">Carregando modelos…</p>}
    {falha && <><Alert type="danger" message="Não foi possível carregar os modelos. Confira o JSON Server." />
      <Button label="Tentar novamente" onClick={() => {setFalha(false); setCarregando(true); setTentativa(n => n+1)}} /></>}
    {!falha && !carregando && (modelos.length ? <Table<Modelo> columns={[
      {title:'Modelo', render:m => m.nome},
      {title:'Ano', render:m => m.ano},
      {title:'Marca', render:m => marcas.find(item => item.id === m.marcaId)?.nome ?? 'Marca indisponível'},
      {title:'Categoria', render:m => categorias.find(item => item.id === m.categoriaId)?.nome ?? 'Categoria indisponível'},
    ]} data={modelos}
      disabled={Boolean(form) || ocupado} onEdit={m => {setAviso(null); setForm(m)}} onDelete={setExclusao} /> : <p>Nenhum modelo cadastrado.</p>)}
    <Modal show={Boolean(exclusao)} busy={ocupado} title="Excluir modelo" message={`Confirma a exclusão de ${exclusao?.nome ?? ''}?`}
      onClose={() => setExclusao(null)} onConfirm={excluir} />
  </main>
}
