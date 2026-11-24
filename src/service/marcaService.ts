import { api } from './api'
import type { Marca } from '../models/Marca'
import type { Modelo } from '../models/Modelo'

function nomeValido(nome: string): string {
  const valor = nome.trim()
  if (!valor) throw new Error('Informe o nome da marca.')
  return valor
}

export const marcaService = {
  async listar(signal?: AbortSignal): Promise<Marca[]> {
    return (await api.get<Marca[]>('/marcas', { signal })).data
  },
  async buscarPorId(id: string): Promise<Marca> {
    return (await api.get<Marca>(`/marcas/${encodeURIComponent(id)}`)).data
  },
  async criar(marca: Pick<Marca, 'nome'>): Promise<Marca> {
    const nova = { id: crypto.randomUUID(), nome: nomeValido(marca.nome) }
    return (await api.post<Marca>('/marcas', nova)).data
  },
  async atualizar(id: string, marca: Pick<Marca, 'nome'>): Promise<Marca> {
    const dados = { nome: nomeValido(marca.nome) }
    return (await api.patch<Marca>(`/marcas/${encodeURIComponent(id)}`, dados)).data
  },
  async excluir(id: string): Promise<void> {
    const { data } = await api.get<Modelo[]>('/modelos', { params: { marcaId: id } })
    if (data.length) throw new Error('Esta marca possui modelos vinculados e não pode ser excluída.')
    await api.delete(`/marcas/${encodeURIComponent(id)}`)
  },
}
