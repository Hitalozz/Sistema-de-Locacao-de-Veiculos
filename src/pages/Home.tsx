import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import bmwAzul from '../assets/mega-motors.png'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Preloader } from '../components/Preloader'

import type { Marca } from '../models/Marca'
import type { Categoria } from '../models/Categoria'
import type { Modelo } from '../models/Modelo'
import type { Veiculo } from '../models/Veiculo'

import { marcaService } from '../service/marcaService'
import { categoriaService } from '../service/categoriaService'
import { modeloService } from '../service/modeloService'
import { veiculoService } from '../service/veiculoService'

import './MegaHome.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface Catalogo {
  marcas: Marca[]
  categorias: Categoria[]
  modelos: Modelo[]
  veiculos: Veiculo[]
}

interface Destaque {
  veiculo: Veiculo
  titulo: string
  categoria?: Categoria
}

interface Etapa {
  titulo: string
  descricao: string
}

const TEMPO_MINIMO_PRELOADER_MS = 850
const QUANTIDADE_DESTAQUES = 3
const QUERY_SEM_MOVIMENTO = '(prefers-reduced-motion: reduce)'
const QUERY_COM_MOVIMENTO = '(prefers-reduced-motion: no-preference)'

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const etapas: Etapa[] = [
  {
    titulo: 'Retirada',
    descricao: 'Escolha o veículo e combine as datas de saída e retorno.',
  },
  {
    titulo: 'Vistoria',
    descricao: 'Confira a quilometragem, o combustível e as condições do carro.',
  },
  {
    titulo: 'Pagamento',
    descricao: 'Consulte o valor da diária e acompanhe os pagamentos da locação.',
  },
  {
    titulo: 'Devolução',
    descricao: 'Faça a vistoria final e confira o valor total da locação.',
  },
]


/* Funções auxiliares                                                  */

// Rola até a seção com animação suave, respeitando quem prefere menos movimento.
function rolarPara(id: string): void {
  const reduzido = window.matchMedia(QUERY_SEM_MOVIMENTO).matches

  document.getElementById(id)?.scrollIntoView({
    behavior: reduzido ? 'auto' : 'smooth',
    block: 'start',
  })
}

// As letras usam <i> (e não <span>) para não herdar o `.mega-title span` do CSS,
// que força display: block e tamanhos de fonte por palavra.
const ESTILO_LETRA: CSSProperties = { display: 'inline-block', fontStyle: 'normal' }

function Letras({ texto }: { texto: string }) {
  return (
    <>
      {[...texto].map((letra, indice) => (
        <i className="mega-letter" style={ESTILO_LETRA} key={`${letra}-${indice}`}>
          {letra}
        </i>
      ))}
    </>
  )
}

// Busca os dados da API (via services) e controla erro e nova tentativa.
function useCatalogo() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function carregar() {
      try {
        const [marcas, categorias, modelos, veiculos] = await Promise.all([
          marcaService.listar(signal),
          categoriaService.listar(signal),
          modeloService.listar(signal),
          veiculoService.listar(signal),
        ])

        if (!signal.aborted) {
          setCatalogo({ marcas, categorias, modelos, veiculos })
        }
      } catch {
        if (!signal.aborted) {
          setErro(true)
        }
      }
    }

    void carregar()

    return () => controller.abort()
  }, [tentativa])

  const tentarNovamente = useCallback(() => {
    setErro(false)
    setTentativa((anterior) => anterior + 1)
  }, [])

  return { catalogo, erro, tentarNovamente }
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export function Home() {
  const root = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { catalogo, erro, tentarNovamente } = useCatalogo()
  const [tempoMinimoConcluido, setTempoMinimoConcluido] = useState(false)
  const [homeVisivel, setHomeVisivel] = useState(false)
  const [preloaderAtivo, setPreloaderAtivo] = useState(true)

  // O hero começa a animar quando as cortinas começam a abrir (ainda por baixo delas)...
  const revelarHome = useCallback(() => {
    setHomeVisivel(true)
  }, [])

  // ...e o preloader só sai da tela quando a animação dele termina de vez.
  const removerPreloader = useCallback(() => {
    setPreloaderAtivo(false)
  }, [])

  // Garante que o preloader fique um tempo mínimo na tela (zero se movimento reduzido).
  useEffect(() => {
    const reduzido = window.matchMedia(QUERY_SEM_MOVIMENTO).matches

    const timer = window.setTimeout(
      () => setTempoMinimoConcluido(true),
      reduzido ? 0 : TEMPO_MINIMO_PRELOADER_MS,
    )

    return () => window.clearTimeout(timer)
  }, [])

  // Relaciona veículo → modelo → marca/categoria uma única vez por carga de dados.
  const destaques = useMemo<Destaque[]>(() => {
    if (!catalogo) return []

    const marcas = new Map(catalogo.marcas.map((m) => [m.id, m] as const))
    const modelos = new Map(catalogo.modelos.map((m) => [m.id, m] as const))
    const categorias = new Map(
      catalogo.categorias.map((c) => [c.id, c] as const),
    )

    return catalogo.veiculos.slice(0, QUANTIDADE_DESTAQUES).map((veiculo) => {
      const modelo = modelos.get(veiculo.modeloId)
      const marca = marcas.get(modelo?.marcaId)
      const categoria = categorias.get(modelo?.categoriaId)

      const titulo =
        [marca?.nome, modelo?.nome].filter(Boolean).join(' ') || veiculo.placa

      return { veiculo, titulo, categoria }
    })
  }, [catalogo])

  // Hero: entrada (letras, carro e botões) quando a cortina do preloader termina
  // e saída com scroll (o hero fica fixo enquanto o carro avança para a tela).
  useGSAP(
    () => {
      if (!homeVisivel) return

      const media = gsap.matchMedia()

      media.add(QUERY_COM_MOVIMENTO, () => {
        // Entrada: letras do título em sequência, depois o carro e os botões.
        gsap
          .timeline()
          .from('.mega-letter', {
            opacity: 0,
            y: 48,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power3.out',
          })
          .from(
            '.mega-poster',
            { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' },
            0.25,
          )
          .from('.mega-actions', { opacity: 0, y: 10, duration: 0.4 }, 0.6)

        // Saída: o hero fica fixo (pin) enquanto o carro cresce em direção à tela
        // e o título some atrás dele. A entrada usa opacity/y e a saída usa scale,
        // assim as duas animações nunca disputam a mesma propriedade.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: '.mega-stage',
              start: 'top top',
              end: '+=60%',
              scrub: 0.6,
              pin: true,
              anticipatePin: 1,
            },
          })
          .to('.mega-poster', { scale: 1.6, transformOrigin: '50% 80%' }, 0)
          .to('.mega-title', { opacity: 0 }, 0.3)
      })

      return () => media.revert()
    },
    {
      scope: root,
      dependencies: [homeVisivel],
      revertOnUpdate: true,
    },
  )

  // Seções aparecem ao entrar na tela; grupos (cards, diárias, etapas) entram em sequência.
  useGSAP(
    () => {
      if (!homeVisivel) return

      const media = gsap.matchMedia()

      media.add(QUERY_COM_MOVIMENTO, () => {
        const secoes = root.current?.querySelectorAll<HTMLElement>('.reveal')

        secoes?.forEach((secao) => {
          const itens = secao.querySelectorAll<HTMLElement>('.reveal-item')
          const titulo = secao.querySelector<HTMLElement>('h2')

          const alvos: HTMLElement[] =
            itens.length > 0 ? [...(titulo ? [titulo] : []), ...itens] : [secao]

          gsap.from(alvos, {
            opacity: 0,
            y: 22,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: secao,
              start: 'top 90%',
              once: true,
            },
          })
        })

        ScrollTrigger.refresh()
      })

      return () => media.revert()
    },
    {
      scope: root,
      dependencies: [homeVisivel, catalogo],
      revertOnUpdate: true,
    },
  )

  const pronto = tempoMinimoConcluido && (catalogo !== null || erro)

  return (
    <div ref={root}>
      {preloaderAtivo && (
        <Preloader ready={pronto} onReveal={revelarHome} onDone={removerPreloader} />
      )}

      <main inert={!homeVisivel}>
        <section className="mega-stage" aria-labelledby="mega-title">
          <div className="mega-scene">
            {/* O CSS posiciona o título atrás do PNG transparente. */}
            <h1 id="mega-title" className="mega-title" aria-label="Mega Motors">
              <span aria-hidden="true">
                <Letras texto="MEGA" />
              </span>{' '}
              <span aria-hidden="true">
                <Letras texto="MOTORS" />
              </span>
            </h1>

            <img
              className="mega-poster"
              src={bmwAzul}
              width={941}
              height={1672}
              fetchPriority="high"
              alt="BMW azul de frente, com aerofólio e bancos laranja"
            />
          </div>

          <div className="mega-actions hero-copy">
            <Button label="Explorar a frota ↓" onClick={() => rolarPara('frota')} />

            <Button
              label="Ver categorias"
              variant="secondary"
              onClick={() => rolarPara('categorias')}
            />
          </div>
        </section>

        <div className="dark-band">
          <section className="container-wide intro reveal">
            <h2>Sobre a Mega Motors</h2>
            <p>
              Compare categorias e diárias, escolha o carro para sua viagem e
              acompanhe a locação da retirada até a devolução.
            </p>
          </section>
        </div>

        <div className="container-wide">
          {erro && (
            <div className="alert alert-warning mt-4" role="alert">
              <p>
                Não foi possível carregar a frota. Confira se o JSON Server está
                rodando.
              </p>
              <Button label="Tentar novamente" onClick={tentarNovamente} />
            </div>
          )}

          {homeVisivel && !catalogo && !erro && (
            <p role="status">Consultando a frota…</p>
          )}

          <section id="categorias" className="section reveal">
            <h2>Categorias e diárias</h2>

            {catalogo?.categorias.map((categoria) => (
              <div className="rate reveal-item" key={categoria.id}>
                <h3>{categoria.nome}</h3>
                <p>
                  <strong>{moeda.format(categoria.valorLocacao)}</strong> / dia
                </p>
              </div>
            ))}

            {catalogo?.categorias.length === 0 && (
              <p>Nenhuma categoria cadastrada.</p>
            )}
          </section>

          <section id="frota" className="section reveal">
            <h2>Destaques da frota</h2>

            <div className="row g-3">
              {destaques.map(({ veiculo, titulo, categoria }) => (
                <div
                  className="col-12 col-md-4 reveal-item"
                  key={veiculo.id ?? veiculo.placa}
                >
                  <Card title={titulo}>
                    <p>
                      {veiculo.cor} · {veiculo.anoFabricacao} ·{' '}
                      {veiculo.kmRodado.toLocaleString('pt-BR')} km
                    </p>

                    <footer>
                      <span>{categoria?.nome ?? 'Categoria pendente'}</span>
                      <strong>
                        {categoria
                          ? `${moeda.format(categoria.valorLocacao)}/dia`
                          : 'Sob consulta'}
                      </strong>
                    </footer>
                  </Card>
                </div>
              ))}
            </div>

            {catalogo?.veiculos.length === 0 && (
              <p>Nenhum veículo cadastrado.</p>
            )}
          </section>

          <section className="section reveal">
            <h2>Como funciona a locação</h2>

            <ol className="row g-4 steps">
              {etapas.map((etapa, indice) => (
                <li
                  className="col-12 col-sm-6 col-lg-3 reveal-item"
                  key={etapa.titulo}
                >
                  <small>{String(indice + 1).padStart(2, '0')}</small>
                  <h3>{etapa.titulo}</h3>
                  <p>{etapa.descricao}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="cta">
          <div className="container-wide reveal">
            <h2>Sua próxima viagem começa aqui.</h2>
            <Button
              label="Acessar locações ↗"
              onClick={() => navigate('/locacoes')}
            />
          </div>
        </section>
      </main>

      <footer className="bottom">
        <div className="container-wide">
          <strong>MEGA MOTORS</strong>
          <span>Sistema de locação de veículos · PUC Goiás</span>
        </div>
      </footer>
    </div>
  )
}