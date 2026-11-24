import { api } from './api'
export interface Pagamento {
  id: string
  locacaoId: string
  valor: number
  forma: string
  data: string
}
export function saldoRestante(total:number, pagamentos:Pagamento[]) {
  return (Math.round(total*100)-pagamentos.reduce((s,p) => s+Math.round(p.valor*100),0))/100
}
export async function pagar(p:Pagamento) {
  return (await api.post<Pagamento>('/pagamentos',p)).data
}
