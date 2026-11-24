export interface Vistoria {
  id: string
  locacaoId: string
  tipo: 'retirada' | 'devolucao'
  quilometragem: number
  combustivel: number
  condicoes: string
  registradaEm: string
}

