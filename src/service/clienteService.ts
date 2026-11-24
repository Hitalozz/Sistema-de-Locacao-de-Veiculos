import { api } from './api'
import type { Cliente } from '../models/Cliente'
type Dados = Omit<Cliente,'id'>
const documento = (s: string) => s.replace(/[.\s-]/g,'')
async function listar(signal?: AbortSignal) {
  return (await api.get<Cliente[]>('/clientes',{signal})).data
}
async function validar(d: Dados,id?: string) {
  if (Object.values(d).some(s => !s.trim())) throw new Error('Preencha todos os campos.')
  const cpf = documento(d.cpf)
  const cnh = documento(d.cnh)
  if (![cpf,cnh].every(s => /^\d{11}$/.test(s))) throw new Error('CPF e CNH devem conter 11 dígitos.')
  const outros = (await listar()).filter(c => c.id !== id)
  if (outros.some(c => documento(c.cpf) === cpf)) throw new Error('CPF já cadastrado.')
  if (outros.some(c => documento(c.cnh) === cnh)) throw new Error('CNH já cadastrada.')
  return {...d,nome:d.nome.trim(),cpf,cnh}
}
export const clienteService = {
  listar,
  async criar(d: Dados) {
    return (await api.post<Cliente>('/clientes',{...await validar(d),id:crypto.randomUUID()})).data
  },
  async atualizar(id: string,d: Dados) {
    return (await api.patch<Cliente>('/clientes/'+encodeURIComponent(id),await validar(d,id))).data
  },
  async excluir(id: string) {
    const {data} = await api.get<unknown[]>('/locacoes',{params:{clienteId:id}})
    if (data.length) throw new Error('Este cliente possui locações vinculadas.')
    await api.delete('/clientes/'+encodeURIComponent(id))
  }
}
