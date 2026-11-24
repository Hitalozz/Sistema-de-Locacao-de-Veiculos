import { api } from './api'
import type { Manutencao } from '../models/Manutencao'
type Dados = Omit<Manutencao,'id'>
async function validar(d: Dados) {
  if (!d.veiculoId || !d.descricao.trim() || !d.data || !Number.isFinite(d.valor) || d.valor < 0)
    throw new Error('Selecione o veículo e informe a descrição, a data e um valor válido.')
  await api.get('/veiculos/'+encodeURIComponent(d.veiculoId))
  return {...d, descricao:d.descricao.trim()}
}
export const manutencaoService = {
  async listar(signal?: AbortSignal) {
    return (await api.get<Manutencao[]>('/manutencoes',{signal})).data
  },
  async criar(d: Dados) {
    return (await api.post<Manutencao>('/manutencoes',{...await validar(d),id:crypto.randomUUID()})).data
  },
  async atualizar(id: string,d: Dados) {
    return (await api.patch<Manutencao>('/manutencoes/'+encodeURIComponent(id),await validar(d))).data
  },
  async excluir(id: string) {
    await api.delete('/manutencoes/'+encodeURIComponent(id))
  },
}
