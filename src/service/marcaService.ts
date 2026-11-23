import { api } from './api'
import type { Marca } from '../models/Marca'

export const marcaService = {
  async listar(signal?: AbortSignal): Promise<Marca[]> {
    const { data } = await api.get<Marca[]>('/marcas', { signal })
    return data
  },
}
