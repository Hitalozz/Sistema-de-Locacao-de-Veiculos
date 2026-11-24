import { api } from './api'
import type { Categoria } from '../models/Categoria'
import type { Modelo } from '../models/Modelo'

type DadosCategoria = Omit<Categoria, 'id'>

function validar(categoria: DadosCategoria): DadosCategoria {
  const nome = categoria.nome.trim()
  const valor = categoria.valorLocacao
  if (!nome) throw new Error('Informe o nome da categoria.')
  if (!Number.isFinite(valor) || valor <= 0 || Number(valor.toFixed(2)) !== valor) {
    throw new Error('Informe uma diária positiva, com até duas casas decimais.')
  }
  return { nome, valorLocacao: valor }
}

export const categoriaService = {
  async listar(signal?: AbortSignal): Promise<Categoria[]> {
    return (await api.get<Categoria[]>('/categorias', { signal })).data
  },
  async buscarPorId(id: string): Promise<Categoria> {
    return (await api.get<Categoria>(`/categorias/${encodeURIComponent(id)}`)).data
  },
  async criar(categoria: DadosCategoria): Promise<Categoria> {
    const nova = { id: crypto.randomUUID(), ...validar(categoria) }
    return (await api.post<Categoria>('/categorias', nova)).data
  },
  async atualizar(id: string, categoria: DadosCategoria): Promise<Categoria> {
    const dados = validar(categoria)
    return (await api.patch<Categoria>(`/categorias/${encodeURIComponent(id)}`, dados)).data
  },
  async excluir(id: string): Promise<void> {
    const { data } = await api.get<Modelo[]>('/modelos', { params: { categoriaId: id } })
    if (data.length) throw new Error('Esta categoria possui modelos vinculados e não pode ser excluída.')
    await api.delete(`/categorias/${encodeURIComponent(id)}`)
  },
}
