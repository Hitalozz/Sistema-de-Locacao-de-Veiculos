import { api } from './api'
import type { Categoria } from '../models/Categoria'

export const categoriaService = {
  async listar(signal?: AbortSignal): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>('/categorias', { signal })
    return data
  },
}
