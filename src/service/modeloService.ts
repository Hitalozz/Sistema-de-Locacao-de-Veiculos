import { api } from './api'
import type { Modelo } from '../models/Modelo'
import type { Veiculo } from '../models/Veiculo'
import { marcaService } from './marcaService'
import { categoriaService } from './categoriaService'

type Dados = Omit<Modelo, 'id'>
async function validar(dados: Dados): Promise<Dados> {
  const nome = dados.nome.trim()
  if (!nome || !Number.isInteger(dados.ano) || dados.ano < 1000 || dados.ano > 9999)
    throw new Error('Informe o nome e um ano com quatro dígitos.')
  if (!dados.marcaId || !dados.categoriaId) throw new Error('Selecione a marca e a categoria.')
  await Promise.all([marcaService.buscarPorId(dados.marcaId), categoriaService.buscarPorId(dados.categoriaId)])
  return {...dados, nome}
}
export const modeloService = {
  async listar(signal?: AbortSignal): Promise<Modelo[]> {
    return (await api.get<Modelo[]>('/modelos', {signal})).data
  },
  async buscarPorId(id: string): Promise<Modelo> {
    return (await api.get<Modelo>('/modelos/'+encodeURIComponent(id))).data
  },
  async criar(dados: Dados): Promise<Modelo> {
    const modelo = {...await validar(dados), id:crypto.randomUUID()}
    return (await api.post<Modelo>('/modelos', modelo)).data
  },
  async atualizar(id: string, dados: Dados): Promise<Modelo> {
    return (await api.patch<Modelo>('/modelos/'+encodeURIComponent(id), await validar(dados))).data
  },
  async excluir(id: string): Promise<void> {
    const {data} = await api.get<Veiculo[]>('/veiculos', {params:{modeloId:id}})
    if (data.length) throw new Error('Este modelo possui veículos vinculados e não pode ser excluído.')
    await api.delete('/modelos/'+encodeURIComponent(id))
  },
}