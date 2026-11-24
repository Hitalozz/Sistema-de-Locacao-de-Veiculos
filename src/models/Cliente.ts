export interface Cliente {
  id: string
  nome: string
  cpf: string
  cnh: string
  validadeCnh: string
  telefone: string
  email: string
  endereco: string
}
export const clienteInicial: Cliente = {id:'',nome:'',cpf:'',cnh:'',validadeCnh:'',telefone:'',email:'',endereco:''}
