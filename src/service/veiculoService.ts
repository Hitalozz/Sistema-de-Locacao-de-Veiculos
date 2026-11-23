import { api } from './api'
import type { Veiculo } from '../models/Veiculo'

export const veiculoService = {
  async listar(signal?: AbortSignal): Promise<Veiculo[]> {
    const { data } = await api.get<Veiculo[]>('/veiculos', { signal })
    return data
  },
}
