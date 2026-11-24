import { api } from './api'
import type { Vistoria } from '../models/Vistoria'
import type { Locacao } from './locacaoService'

async function buscar(locacaoId: string, tipo: Vistoria['tipo'] = 'retirada') {
  const {data} = await api.get<Vistoria[]>('/vistorias', {params:{locacaoId,tipo}})
  return data[0] as Vistoria | undefined
}
export const vistoriaService = {
  buscar,
  async registrar(locacaoId: string, quilometragem: number, combustivel: number, condicoes: string, tipo: Vistoria['tipo'] = 'retirada') {
    if (!Number.isSafeInteger(quilometragem) || quilometragem < 0)
      throw new Error('Informe a quilometragem em quilômetros inteiros.')
    if (!Number.isInteger(combustivel) || combustivel < 0 || combustivel > 100 || !condicoes.trim())
      throw new Error('Informe o combustível de 0 a 100% e descreva as condições do veículo.')
    const reserva = (await api.get<Locacao>('/locacoes/'+encodeURIComponent(locacaoId))).data
    const existente = await buscar(locacaoId,tipo)
    if (existente) return existente
    if (tipo === 'devolucao') {
      const retirada = await buscar(locacaoId,'retirada')
      if (!retirada) throw new Error('Registre a vistoria de retirada primeiro.')
      if (quilometragem < retirada.quilometragem) throw new Error('A quilometragem final deve ser igual ou superior à da retirada.')
      if (reserva.status === 'cancelada') throw new Error('Esta locação foi cancelada.')
    } else if (reserva.status !== 'reservada') throw new Error('A locação precisa estar reservada para registrar a retirada.')
    const registro: Vistoria = {id:tipo+'-'+locacaoId,locacaoId,tipo,quilometragem,combustivel,
      condicoes:condicoes.trim(),registradaEm:new Date().toISOString()}
    try {
      return (await api.post<Vistoria>('/vistorias',registro)).data
    } catch (erro) {
      const salva = await buscar(locacaoId,tipo)
      if (salva) return salva
      throw erro
    }
  }
}

