export interface Manutencao {
  id: string
  veiculoId: string
  descricao: string
  data: string
  valor: number
}
export const manutencaoInicial: Manutencao = { id:'', veiculoId:'', descricao:'', data:'', valor:0 }
