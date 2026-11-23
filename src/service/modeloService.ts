import { api } from './api'
import type { Modelo } from '../models/Modelo'

export const modeloService = {
  async listar(signal?: AbortSignal): Promise<Modelo[]> {
    const { data } = await api.get<Modelo[]>('/modelos', { signal })
    return data
  },
}
