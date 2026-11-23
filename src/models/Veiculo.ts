export interface Veiculo {
  id: string
  placa: string
  chassi: string
  anoFabricacao: number
  cor: string
  kmRodado: number
  modeloId: string
}
export const veiculoInicial: Veiculo = {
  id: '',
  placa: '',
  chassi: '',
  anoFabricacao: 0,
  cor: '',
  kmRodado: 0,
  modeloId: '',
}
