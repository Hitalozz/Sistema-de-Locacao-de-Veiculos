import { api } from './api'
import { modeloService } from './modeloService'
import type { Veiculo } from '../models/Veiculo'

type Dados = Omit<Veiculo, 'id'>
const normalizar = (valor: string) => valor.toUpperCase().replace(/[\s-]/g, '')

async function listar(signal?: AbortSignal): Promise<Veiculo[]> {
  return (await api.get<Veiculo[]>('/veiculos', { signal })).data
}

async function validar(dados: Dados, id?: string): Promise<Dados> {
  const placa = normalizar(dados.placa)
  const chassi = normalizar(dados.chassi)
  if (!/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(placa)) throw new Error('Informe uma placa como ABC1234 ou ABC1D23.')
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(chassi)) throw new Error('Informe um chassi de 17 caracteres, sem I, O ou Q.')
  if (!dados.cor.trim() || !dados.modeloId) throw new Error('Informe a cor e selecione o modelo.')
  if (!Number.isInteger(dados.anoFabricacao) || dados.anoFabricacao < 1000 || dados.anoFabricacao > 9999)
    throw new Error('Informe o ano de fabricação com quatro dígitos.')
  if (!Number.isFinite(dados.kmRodado) || dados.kmRodado < 0) throw new Error('Informe uma quilometragem válida.')
  const [veiculos] = await Promise.all([listar(), modeloService.buscarPorId(dados.modeloId)])
  const outros = veiculos.filter(v => v.id !== id)
  if (outros.some(v => normalizar(v.placa) === placa)) throw new Error('Esta placa já está cadastrada.')
  if (outros.some(v => normalizar(v.chassi) === chassi)) throw new Error('Este chassi já está cadastrado.')
  return { ...dados, cor: dados.cor.trim(), placa, chassi }
}

export const veiculoService = {
  listar,
  async criar(dados: Dados): Promise<Veiculo> {
    const veiculo = { ...await validar(dados), id: crypto.randomUUID() }
    return (await api.post<Veiculo>('/veiculos', veiculo)).data
  },
  async atualizar(id: string, dados: Dados): Promise<Veiculo> {
    return (await api.patch<Veiculo>('/veiculos/' + encodeURIComponent(id), await validar(dados, id))).data
  },
  async excluir(id: string): Promise<void> {
    const params = { veiculoId: id }
    const vinculos = await Promise.all(['/locacoes', '/manutencoes'].map(path => api.get<unknown[]>(path, { params })))
    if (vinculos.some(resposta => resposta.data.length)) throw new Error('Este veículo possui locações ou manutenções vinculadas.')
    await api.delete('/veiculos/' + encodeURIComponent(id))
  },
}
