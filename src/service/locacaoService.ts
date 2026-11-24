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
  const [clientes,veiculos,modelos,categorias,marcas,lista] = await Promise.all([
    clienteService.listar(),veiculoService.listar(),modeloService.listar(),categoriaService.listar(),marcaService.listar(),
    api.get<Locacao[]>('/locacoes')
  ])
  return {clientes,veiculos,modelos,categorias,marcas,locacoes:lista.data}
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
  if (dados.locacoes.some(l => l.veiculoId === p.veiculoId && l.status !== 'cancelada' && l.retirada < p.devolucaoPrevista && p.retirada < l.devolucaoPrevista))
    throw new Error('O veículo já possui uma locação nesse período.')
  const registro: Locacao = {...p,id:crypto.randomUUID(),valorDiaria:diaria,valorPrevisto:total,status:'reservada'}
  return (await api.post<Locacao>('/locacoes',registro)).data
}

