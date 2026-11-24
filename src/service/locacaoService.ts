import { saldoRestante, type Pagamento } from './pagamentoService'
import type { Vistoria } from '../models/Vistoria'
import { marcaService } from './marcaService'
import { api } from './api'
import { clienteService } from './clienteService'
import { veiculoService } from './veiculoService'
import { modeloService } from './modeloService'
import { categoriaService } from './categoriaService'
export interface Pedido {
  clienteId: string
  veiculoId: string
  retirada: string
  devolucaoPrevista: string
}
export interface Locacao extends Pedido {
  id: string
  valorDiaria: number
  valorPrevisto: number
  status: string
}
export async function carregar() {
  const [clientes,veiculos,modelos,categorias,marcas,lista,pagamentos,vistorias] = await Promise.all([
    clienteService.listar(),veiculoService.listar(),modeloService.listar(),categoriaService.listar(),marcaService.listar(),
    api.get<Locacao[]>('/locacoes'),api.get<Pagamento[]>('/pagamentos'),api.get<Vistoria[]>('/vistorias')
  ])
  return {clientes,veiculos,modelos,categorias,marcas,locacoes:lista.data,pagamentos:pagamentos.data,vistorias:vistorias.data}
}
export function calcular(p: Pedido, dados: Awaited<ReturnType<typeof carregar>>) {
  const veiculo = dados.veiculos.find(v => v.id === p.veiculoId)
  const modelo = dados.modelos.find(m => m.id === veiculo?.modeloId)
  const diaria = dados.categorias.find(c => c.id === modelo?.categoriaId)?.valorLocacao
  const dias = (Date.parse(p.devolucaoPrevista)-Date.parse(p.retirada))/86400000
  const total = diaria !== undefined && dias > 0 ? dias*Math.round(diaria*100)/100 : undefined
  return {veiculo,modelo,diaria,dias,total}
}
export async function reservar(p: Pedido) {
  const dados = await carregar()
  const cliente = dados.clientes.find(c => c.id === p.clienteId)
  const {diaria,total} = calcular(p,dados)
  if (!cliente || !cliente.validadeCnh || cliente.validadeCnh < p.retirada) throw new Error('Confira o cliente e a validade da CNH na retirada.')
  if (diaria === undefined || total === undefined) throw new Error('Selecione um veículo com diária e uma devolução posterior à retirada.')
  if (indisponivel(p,dados)) throw new Error('Veículo indisponível para esta reserva.')
  const registro: Locacao = {...p,id:crypto.randomUUID(),valorDiaria:diaria,valorPrevisto:total,status:'reservada'}
  return (await api.post<Locacao>('/locacoes',registro)).data
}


export function indisponivel(p:Pedido,dados:Awaited<ReturnType<typeof carregar>>) {
  return dados.locacoes.some(l => {
    if (l.veiculoId !== p.veiculoId || l.status === 'cancelada') return false
    const checks = dados.vistorias.filter(v => v.locacaoId === l.id)
    const saldo = saldoRestante(l.valorPrevisto,dados.pagamentos.filter(pg => pg.locacaoId === l.id))
    if (checks.some(v => v.tipo === 'devolucao') && saldo <= 0) return false
    return checks.some(v => v.tipo === 'retirada') ||
      Boolean(p.retirada && p.devolucaoPrevista && l.retirada < p.devolucaoPrevista && p.retirada < l.devolucaoPrevista)
  })
}
