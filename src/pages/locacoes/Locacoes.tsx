import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { logos } from '../../assets/logos'
import { Select } from '../../components/Select'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { calcular, carregar, reservar, type Pedido } from '../../service/locacaoService'

import './Locacoes.css'

gsap.registerPlugin(useGSAP)

/* ------------------------------------------------------------------ */
/* Tipos, constantes e funções auxiliares                              */
/* ------------------------------------------------------------------ */

type Dados = Awaited<ReturnType<typeof carregar>>
type LocacaoSalva = Awaited<ReturnType<typeof reservar>>

interface Aviso {
  tipo: 'sucesso' | 'erro'
  texto: string
}

const fotos = import.meta.glob<string>('/src/assets/frota/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const vazio: Pedido = { clienteId: '', veiculoId: '', retirada: '', devolucaoPrevista: '' }

const DURACOES = [1, 3, 7, 15, 30]
const SEM_REDUCAO_DE_MOVIMENTO = '(prefers-reduced-motion: no-preference)'
const REDUCAO_DE_MOVIMENTO = '(prefers-reduced-motion: reduce)'

const dinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const dataBR = (iso: string) => iso.split('-').reverse().join('/')
const plural = (n: number) => `${n} ${n === 1 ? 'diária' : 'diárias'}`
const pad = (n: number) => String(n).padStart(2, '0')

function paraISO(data: Date): string {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return paraISO(new Date(ano, mes - 1, dia + dias))
}

function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

/* ------------------------------------------------------------------ */
/* Componentes pequenos                                                */
/* ------------------------------------------------------------------ */

// Silhueta usada quando o veículo ainda não foi escolhido ou não tem foto.
function IconeCarro() {
  return (
    <svg className="lf-icone-carro" viewBox="0 0 120 56" aria-hidden="true" focusable="false">
      <path d="M6 38c0-5 3-8 8-9l12-12c3-3 7-5 12-5h26c6 0 11 2 15 6l8 9c8 1 13 3 13 9v4c0 2-2 4-4 4h-8a10 10 0 0 0-20 0H44a10 10 0 0 0-20 0H10c-2 0-4-2-4-4z" />
      <circle cx="34" cy="44" r="8" />
      <circle cx="78" cy="44" r="8" />
    </svg>
  )
}

interface ValorAnimadoProps {
  valor: number
}

// Faz o valor "rolar" até o novo total em vez de trocar de uma vez.
function ValorAnimado({ valor }: ValorAnimadoProps) {
  const alvo = useRef<HTMLSpanElement>(null)
  const atual = useRef({ numero: valor })

  useGSAP(
    () => {
      const pintar = () => {
        if (alvo.current) alvo.current.textContent = dinheiro.format(atual.current.numero)
      }

      if (window.matchMedia(REDUCAO_DE_MOVIMENTO).matches) {
        atual.current.numero = valor
        pintar()
        return
      }

      pintar()
      gsap.to(atual.current, { numero: valor, duration: 0.6, ease: 'power2.out', onUpdate: pintar })
    },
    { dependencies: [valor] },
  )

  return <span ref={alvo} />
}

interface PassoProps {
  numero: number
  titulo: string
  ok: boolean
  children: ReactNode
}

function Passo({ numero, titulo, ok, children }: PassoProps) {
  return (
    <section className="lf-passo" data-ok={ok}>
      <h2>
        <span className="lf-num" aria-hidden="true">
          {ok ? '✓' : numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Página: carrega os dados e delega o formulário                      */
/* ------------------------------------------------------------------ */

export function Locacoes() {
  const [dados, setDados] = useState<Dados>()
  const [erroCarga, setErroCarga] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    carregar()
      .then((d) => {
        if (ativo) setDados(d)
      })
      .catch(() => {
        if (ativo) setErroCarga(true)
      })

    return () => {
      ativo = false
    }
  }, [tentativa])

  function tentarNovamente() {
    setErroCarga(false)
    setTentativa((t) => t + 1)
  }

  function registrar(salva: LocacaoSalva) {
    setDados((d) => d && { ...d, locacoes: [...d.locacoes, salva] })
  }

  if (!dados) {
    return (
      <main className="lf-page">
        <div className="container lf-wrap">
          {erroCarga ? (
            <div className="lf-estado" role="alert">
              <h1>Não foi possível carregar</h1>
              <p>Confira se o JSON Server está rodando (npm run server) e tente de novo.</p>
              <Button label="Tentar novamente" onClick={tentarNovamente} />
            </div>
          ) : (
            <div className="lf-esqueleto" role="status" aria-busy="true">
              <span className="visually-hidden">Carregando locações…</span>
              <div />
              <div />
              <div />
            </div>
          )}
        </div>
      </main>
    )
  }

  return <NovaLocacao dados={dados} onReservada={registrar} />
}

/* ------------------------------------------------------------------ */
/* Formulário, resumo e lista                                          */
/* ------------------------------------------------------------------ */

interface NovaLocacaoProps {
  dados: Dados
  onReservada: (locacao: LocacaoSalva) => void
}

function NovaLocacao({ dados, onReservada }: NovaLocacaoProps) {
  const pagina = useRef<HTMLElement>(null)

  const [pedido, setPedido] = useState(vazio)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [fotoFalhouId, setFotoFalhouId] = useState<string | undefined>()
  const [destaqueId, setDestaqueId] = useState<string | undefined>()

  /* ---- Dados derivados ---- */

  const opcoesClientes = useMemo(
    () => dados.clientes.map((c) => ({ value: c.id, label: c.nome })),
    [dados.clientes],
  )

  // Mostra "PLACA · Modelo" para o usuário escolher sem decorar placas.
  const opcoesVeiculos = useMemo(
    () =>
      dados.veiculos.map((v) => {
        const { modelo: m } = calcular({ ...vazio, veiculoId: v.id }, dados)
        return { value: v.id, label: m ? `${v.placa} · ${m.nome}` : v.placa }
      }),
    [dados],
  )

  const { veiculo, modelo, diaria, dias, total } = calcular(pedido, dados)
  const marca = dados.marcas.find((m) => m.id === modelo?.marcaId)
  const logo = marca?.logo ? logos[marca.logo] : undefined

  const titulo = [marca?.nome, modelo?.nome].filter(Boolean).join(' ') || 'Selecione um veículo'
  const fotoSrc = veiculo?.foto ? (fotos[veiculo.foto] ?? veiculo.foto) : undefined
  const fotoFalhou =
    Boolean(veiculo) && fotoFalhouId !== undefined && fotoFalhouId === veiculo?.id
  const temFoto = Boolean(fotoSrc) && !fotoFalhou

  const passos = [
    { rotulo: 'Cliente', ok: Boolean(pedido.clienteId) },
    { rotulo: 'Veículo', ok: Boolean(veiculo) },
    { rotulo: 'Período', ok: total !== undefined },
  ]
  const concluidos = passos.filter((p) => p.ok).length
  const pendentes = passos.filter((p) => !p.ok).map((p) => p.rotulo.toLowerCase())
  const podeConfirmar = Boolean(pedido.clienteId) && total !== undefined && !ocupado

  // Datas preenchidas, mas o cálculo não fechou: a devolução não é posterior à retirada (RN02).
  const periodoInvalido = Boolean(
    veiculo && pedido.retirada && pedido.devolucaoPrevista && total === undefined,
  )

  const lista = [...dados.locacoes].reverse()

  /* ---- Ações ---- */

  function alterar(campo: keyof Pedido, valor: string) {
    setPedido((p) => ({ ...p, [campo]: valor }))
    setAviso(null)
  }

  function definirDuracao(quantidade: number) {
    setPedido((p) => {
      const retirada = p.retirada || paraISO(new Date())
      return { ...p, retirada, devolucaoPrevista: somarDias(retirada, quantidade) }
    })
    setAviso(null)
  }

  async function salvar() {
    if (ocupado || !podeConfirmar) return

    const cliente = dados.clientes.find((c) => c.id === pedido.clienteId)?.nome ?? 'cliente'
    const placa = veiculo?.placa ?? ''

    setOcupado(true)
    try {
      const salva = await reservar(pedido)
      onReservada(salva)
      setDestaqueId(salva.id)
      setPedido(vazio)
      setAviso({ tipo: 'sucesso', texto: `Locação registrada: ${cliente} · ${placa}. Veja na lista abaixo.` })
    } catch (e) {
      setAviso({
        tipo: 'erro',
        texto: e instanceof Error ? e.message : 'Falha ao registrar a locação.',
      })
    } finally {
      setOcupado(false)
    }
  }

  // Remove o destaque da locação recém-criada depois de alguns segundos.
  useEffect(() => {
    if (destaqueId === undefined) return
    const timer = window.setTimeout(() => setDestaqueId(undefined), 4000)
    return () => window.clearTimeout(timer)
  }, [destaqueId])

  /* ---- Animações ---- */

  // Entrada da página: cabeçalho, passos e resumo surgem em sequência.
  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add(SEM_REDUCAO_DE_MOVIMENTO, () => {
        gsap.from('.lf-topo > *, .lf-progresso, .lf-passo, .lf-ticket', {
          opacity: 0,
          y: 24,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        })
      })

      return () => media.revert()
    },
    { scope: pagina },
  )

  // Ao trocar de veículo, a foto desliza para dentro e os valores aparecem em cascata.
  const veiculoId = veiculo?.id
  useGSAP(
    () => {
      if (!veiculoId) return

      const media = gsap.matchMedia()

      media.add(SEM_REDUCAO_DE_MOVIMENTO, () => {
        const imagem = pagina.current?.querySelector('.lf-veiculo')

        if (imagem) {
          gsap.fromTo(
            imagem,
            { opacity: 0, x: 48, scale: 0.94 },
            { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'power3.out' },
          )
        }

        gsap.from('.lf-valores > div', {
          opacity: 0,
          y: 10,
          duration: 0.4,
          stagger: 0.06,
          delay: 0.15,
        })
      })

      return () => media.revert()
    },
    { scope: pagina, dependencies: [veiculoId], revertOnUpdate: true },
  )

  /* ---- Tela ---- */

  return (
    <main className="lf-page" ref={pagina}>
      <div className="container lf-wrap">
        <header className="lf-topo">
          <span className="lf-eyebrow">Locações</span>
          <h1>Nova locação</h1>
          <p>Escolha o cliente, o veículo e o período. O valor previsto é calculado na hora.</p>
        </header>

        <form
          className="lf-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void salvar()
          }}
        >
          <fieldset className="lf-fieldset" disabled={ocupado}>
            <legend className="visually-hidden">Dados da locação</legend>

            <div className="row g-4">
              <div className="col-lg-7">
                <ol className="lf-progresso" aria-label={`${concluidos} de ${passos.length} etapas concluídas`}>
                  {passos.map((p, i) => (
                    <li key={p.rotulo} data-ok={p.ok}>
                      <span aria-hidden="true">{p.ok ? '✓' : i + 1}</span>
                      {p.rotulo}
                    </li>
                  ))}
                </ol>

                <Passo numero={1} titulo="Cliente" ok={Boolean(pedido.clienteId)}>
                  <Select
                    label="Quem vai alugar?"
                    name="cliente"
                    value={pedido.clienteId}
                    onChange={(v) => alterar('clienteId', v)}
                    options={opcoesClientes}
                  />
                </Passo>

                <Passo numero={2} titulo="Veículo" ok={Boolean(veiculo)}>
                  <Select
                    label="Qual veículo? (placa · modelo)"
                    name="placa"
                    value={pedido.veiculoId}
                    onChange={(v) => alterar('veiculoId', v)}
                    options={opcoesVeiculos}
                  />
                </Passo>

                <Passo numero={3} titulo="Período" ok={total !== undefined}>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <Input
                        type="date"
                        label="Retirada"
                        name="retirada"
                        value={pedido.retirada}
                        onChange={(v) => alterar('retirada', v)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <Input
                        type="date"
                        label="Devolução prevista"
                        name="devolucao"
                        value={pedido.devolucaoPrevista}
                        onChange={(v) => alterar('devolucaoPrevista', v)}
                      />
                    </div>
                  </div>

                  <div className="lf-atalhos" role="group" aria-label="Atalhos de período">
                    <Button
                      label="Retirar hoje"
                      variant="secondary"
                      onClick={() => alterar('retirada', paraISO(new Date()))}
                    />
                    {DURACOES.map((quantidade) => (
                      <Button
                        key={quantidade}
                        label={`${quantidade} ${quantidade === 1 ? 'dia' : 'dias'}`}
                        variant={dias === quantidade && total !== undefined ? 'primary' : 'secondary'}
                        onClick={() => definirDuracao(quantidade)}
                      />
                    ))}
                  </div>

                  {periodoInvalido && (
                    <p className="lf-dica lf-dica--erro" role="alert">
                      A devolução prevista deve ser posterior à data de retirada.
                    </p>
                  )}

                  {total !== undefined && dias !== undefined && (
                    <p className="lf-dica lf-dica--ok">
                      {plural(dias)} · devolução em {dataBR(pedido.devolucaoPrevista)}
                    </p>
                  )}
                </Passo>
              </div>

              <aside className="col-lg-5 lf-lateral" aria-label="Resumo da locação">
                <div className="lf-ticket">
                  <div className="lf-ticket-topo">
                    <div>
                      <span className="lf-eyebrow lf-eyebrow--claro">Resumo</span>
                      <h2>{titulo}</h2>
                    </div>
                    {logo && <img className="lf-emblema" src={logo} alt="" />}
                  </div>

                  {veiculo ? (
                    <>
                      <div className="lf-foto">
                        {temFoto ? (
                          <img
                            className="lf-veiculo"
                            src={fotoSrc}
                            alt={`${titulo} · ${veiculo.placa}`}
                            onError={() => setFotoFalhouId(veiculo.id)}
                          />
                        ) : (
                          <IconeCarro />
                        )}
                      </div>

                      {!temFoto && (
                        <p className="lf-foto-nota">
                          {fotoFalhou ? 'Foto indisponível' : 'Veículo sem foto cadastrada'}
                        </p>
                      )}

                      <ul className="lf-etiquetas">
                        <li>{veiculo.placa}</li>
                        <li>{veiculo.cor}</li>
                      </ul>

                      <dl className="lf-valores">
                        <div>
                          <dt>Diária</dt>
                          <dd>{diaria !== undefined ? dinheiro.format(diaria) : '—'}</dd>
                        </div>
                        <div>
                          <dt>Período</dt>
                          <dd>
                            {total !== undefined && dias !== undefined
                              ? `${plural(dias)} · ${dataBR(pedido.retirada)} → ${dataBR(pedido.devolucaoPrevista)}`
                              : 'Informe as datas'}
                          </dd>
                        </div>
                        <div className="lf-total">
                          <dt>Total previsto</dt>
                          <dd>{total !== undefined ? <ValorAnimado valor={total} /> : '—'}</dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <div className="lf-ticket-vazio">
                      <IconeCarro />
                      <p>Escolha um veículo para ver o resumo e o valor previsto.</p>
                    </div>
                  )}

                  <div className="lf-acoes">
                    <div aria-live="polite">
                      {aviso && <div className={`lf-aviso lf-aviso--${aviso.tipo}`}>{aviso.texto}</div>}
                    </div>

                    <Button
                      label={ocupado ? 'Registrando…' : 'Confirmar locação'}
                      type="submit"
                      disabled={!podeConfirmar}
                    />

                    {!podeConfirmar && !ocupado && (
                      <p className="lf-pendentes">Para confirmar, informe: {pendentes.join(', ')}.</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </fieldset>
        </form>

        <section className="lf-lista" aria-labelledby="lf-lista-titulo">
          <div className="lf-lista-topo">
            <h2 id="lf-lista-titulo">Locações registradas</h2>
            <span className="lf-contador">{lista.length}</span>
          </div>

          {lista.length === 0 ? (
            <div className="lf-vazio">
              <IconeCarro />
              <p>Nenhuma locação registrada ainda.</p>
              <p>Preencha os passos acima para criar a primeira.</p>
            </div>
          ) : (
            <ul className="lf-itens">
              {lista.map((l) => {
                const cliente = dados.clientes.find((c) => c.id === l.clienteId)?.nome ?? 'Cliente removido'
                const calculo = calcular(
                  {
                    clienteId: l.clienteId,
                    veiculoId: l.veiculoId,
                    retirada: l.retirada,
                    devolucaoPrevista: l.devolucaoPrevista,
                  },
                  dados,
                )
                const placa = calculo.veiculo?.placa ?? '—'
                const nomeModelo = calculo.modelo?.nome
                const novo = destaqueId !== undefined && l.id === destaqueId

                return (
                  <li className={novo ? 'lf-item lf-item--novo' : 'lf-item'} key={l.id}>
                    <span className="lf-avatar" aria-hidden="true">
                      {iniciais(cliente)}
                    </span>

                    <div className="lf-item-info">
                      <strong>{cliente}</strong>
                      <span>
                        {placa}
                        {nomeModelo ? ` · ${nomeModelo}` : ''}
                      </span>
                      <span className="lf-item-periodo">
                        {dataBR(l.retirada)} → {dataBR(l.devolucaoPrevista)}
                        {calculo.dias !== undefined ? ` · ${plural(calculo.dias)}` : ''}
                      </span>
                    </div>

                    <span className="lf-item-valor">{dinheiro.format(l.valorPrevisto)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}