import { api } from './api'

export interface NotaFiscal {
  id: string
  numero: number
  locacaoId: string
  emitidaEm: string
  cliente: string
  placa: string
  modelo: string
  retirada: string
  devolucaoPrevista: string
  diaria: number
  total: number
}

export async function emitirNota(locacaoId: string) {
  const {data} = await api.post<Partial<NotaFiscal>>('/emitir-nota', {locacaoId})
  if (!notaCompleta(data) || data.locacaoId !== locacaoId)
    throw new Error('A API retornou uma nota incompleta. Confira se o servidor atualizado está rodando.')
  return data
}


function notaCompleta(n: Partial<NotaFiscal> | null): n is NotaFiscal {
  return !!n && [n.id,n.locacaoId,n.cliente,n.modelo,n.placa,n.emitidaEm,n.retirada,n.devolucaoPrevista]
    .every(v => typeof v === 'string' && v.length > 0)
    && Number.isInteger(n.numero) && Number.isFinite(n.diaria) && Number.isFinite(n.total)
}
