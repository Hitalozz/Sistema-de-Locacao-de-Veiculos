import { api } from './api'
import type { Vistoria } from '../models/Vistoria'
import type { Locacao } from './locacaoService'

async function buscar(locacaoId: string) {
  const {data} = await api.get<Vistoria[]>('/vistorias', {params:{locacaoId,tipo:'retirada'}})
  return data[0] as Vistoria | undefined
}
export const vistoriaService = {
  buscar,
  async registrar(locacaoId: string, quilometragem: number, combustivel: number, condicoes: string) {
    if (!Number.isSafeInteger(quilometragem) || quilometragem < 0)
      throw new Error('Informe a quilometragem em quilômetros inteiros.')
    if (!Number.isInteger(combustivel) || combustivel < 0 || combustivel > 100 || !condicoes.trim())
      throw new Error('Informe o combustível de 0 a 100% e descreva as condições do veículo.')
    const reserva = (await api.get<Locacao>('/locacoes/'+encodeURIComponent(locacaoId))).data
    const existente = await buscar(locacaoId)
    if (existente) return existente
    if (reserva.status !== 'reservada') throw new Error('A locação precisa estar reservada para registrar a retirada.')
    const registro: Vistoria = {id:'retirada-'+locacaoId,locacaoId,tipo:'retirada',quilometragem,combustivel,
      condicoes:condicoes.trim(),registradaEm:new Date().toISOString()}
    try {
      return (await api.post<Vistoria>('/vistorias',registro)).data
    } catch (erro) {
      const salva = await buscar(locacaoId)
      if (salva) return salva
      throw erro
    }
  }
}
