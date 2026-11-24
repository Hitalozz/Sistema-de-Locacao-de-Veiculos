const jsonServer = require('json-server')
const app = jsonServer.create()
const router = jsonServer.router(process.env.LOCADORA_DB || 'db.json')
app.use(jsonServer.defaults())
app.use(jsonServer.bodyParser)
const centavos = valor => Math.round(valor * 100)
function saldo(l, db) {
  return centavos(l.valorPrevisto) - db.pagamentos.filter(p => p.locacaoId === l.id)
    .reduce((s,p) => s + centavos(p.valor),0)
}
function emUso(l, db) {
  const checks = db.vistorias.filter(v => v.locacaoId === l.id)
  return checks.some(v => v.tipo === 'retirada') &&
    !(checks.some(v => v.tipo === 'devolucao') && saldo(l,db) <= 0)
}
function encerrada(l, db) {
  return db.vistorias.some(v => v.locacaoId === l.id && v.tipo === 'devolucao') && saldo(l,db) <= 0
}
// Validar e gravar no mesmo trecho síncrono evita duas confirmações simultâneas.
app.post(['/locacoes','/pagamentos','/vistorias'], (req,res) => {
  const db = router.db.getState()
  const tabela = req.path.slice(1)
  const item = req.body
  const conflito = mensagem => res.status(409).json({mensagem})
  if (!item.id) return res.status(400).json({mensagem:'Identificador obrigatório.'})
  const existente = db[tabela].find(r => r.id === item.id)
  if (existente) return res.status(409).json({mensagem:'Registro já existente.'})
  if (tabela === 'locacoes') {
    const bloqueada = db.locacoes.some(l => l.veiculoId === item.veiculoId && l.status !== 'cancelada' &&
      (emUso(l,db) || (!encerrada(l,db) && l.retirada < item.devolucaoPrevista && item.retirada < l.devolucaoPrevista)))
    if (bloqueada) return conflito('Veículo indisponível para esta reserva.')
  } else {
    const l = db.locacoes.find(r => r.id === item.locacaoId)
    if (!l || l.status === 'cancelada') return conflito('Locação indisponível.')
    if (tabela === 'pagamentos') {
      const valor = centavos(item.valor)
      if (!Number.isSafeInteger(valor) || valor <= 0 || valor/100 !== item.valor || valor > saldo(l,db) ||
          !['Pix','Dinheiro','Cartão'].includes(item.forma)) return conflito('Confira o valor, o saldo e a forma de pagamento.')
    } else {
      const checks = db.vistorias.filter(v => v.locacaoId === l.id)
      if (checks.some(v => v.tipo === item.tipo)) return conflito('Vistoria já registrada.')
      if (item.tipo === 'retirada' && db.locacoes.some(r => r.id !== l.id && r.veiculoId === l.veiculoId && emUso(r,db)))
        return conflito('Outra locação ainda está com este veículo.')
      if (item.tipo === 'devolucao' && !checks.some(v => v.tipo === 'retirada'))
        return conflito('Registre a retirada primeiro.')
    }
  }
  router.db.get(tabela).push(item).write()
  return res.status(201).json(item)
})
app.use(router)
app.listen(Number(process.env.PORT || 3001), () => console.log('API de locações iniciada.'))
