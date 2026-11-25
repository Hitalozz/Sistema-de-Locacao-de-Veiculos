import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

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
  foto?: string
}

interface InfoCategoria {
  categoria: Categoria
  descricao: string
  veiculos: number
}

interface Indicador {
  rotulo: string
  valor: number
  formatar: (numero: number) => string
}

interface LogoMarca {
  chave: string
  nome: string
  src: string
}

interface Etapa {
  titulo: string
  descricao: string
}

type NomeIcone = 'contrato' | 'vistoria' | 'pagamento' | 'nota'

interface Beneficio {
  icone: NomeIcone
  titulo: string
  descricao: string
}

/* ------------------------------------------------------------------ */
/* Constantes e dados estáticos                                        */
/* ------------------------------------------------------------------ */

const TEMPO_MINIMO_PRELOADER_MS = 850
const QUANTIDADE_DESTAQUES = 3
const QUERY_SEM_MOVIMENTO = '(prefers-reduced-motion: reduce)'
const QUERY_COM_MOVIMENTO = '(prefers-reduced-motion: no-preference)'

// Quantas vezes a lista de logos se repete no carrossel. Precisa bater com o
// translateX(-25%) do @keyframes brands-scroll no CSS (100% ÷ 4 cópias).
const COPIAS_CARROSSEL = 4

const ANO_ATUAL = new Date().getFullYear()

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const moedaInteira = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const formatarInteiro = (numero: number) => String(Math.round(numero))
const formatarDiaria = (numero: number) => moedaInteira.format(numero)

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

const beneficios: Beneficio[] = [
  {
    icone: 'contrato',
    titulo: 'Contrato automático',
    descricao: 'Gerado ao registrar a locação, com número único e data de emissão.',
  },
  {
    icone: 'vistoria',
    titulo: 'Vistoria completa',
    descricao: 'Quilometragem, nível de combustível e observações na retirada e na devolução.',
  },
  {
    icone: 'pagamento',
    titulo: 'Pagamentos flexíveis',
    descricao: 'Caução, parcelas e saldo final, com forma e status de cada pagamento.',
  },
  {
    icone: 'nota',
    titulo: 'Nota fiscal',
    descricao: 'Emitida assim que a locação é finalizada, sempre vinculada ao contrato.',
  },
]

const DESCRICOES_CATEGORIA: Record<string, string> = {
  economico: 'Custo-benefício para o dia a dia e viagens curtas.',
  intermediario: 'Mais espaço e conforto para a família.',
  suv: 'Altura, espaço e segurança para qualquer estrada.',
  executivo: 'Conforto premium para quem não abre mão de estilo.',
}

const DESCRICAO_PADRAO = 'Consulte os modelos disponíveis nesta categoria.'

const NOMES_MARCAS: Record<string, string> = {
  bmw: 'BMW',
  byd: 'BYD',
  chevrolet: 'Chevrolet',
  fiat: 'Fiat',
  ford: 'Ford',
  honda: 'Honda',
  porsche: 'Porsche',
  toyota: 'Toyota',
  volkswagen: 'Volkswagen',
}

// Logos do carrossel: tudo que estiver em src/assets/logo-marcas entra sozinho.
const logosImportados = import.meta.glob<string>(
  '../assets/logo-marcas/*.{png,svg,webp,jpg,jpeg}',
  { eager: true, import: 'default', query: '?url' },
)

const LOGOS_MARCAS: LogoMarca[] = Object.entries(logosImportados)
  .map(([caminho, src]) => {
    const arquivo = caminho.split('/').pop() ?? caminho
    const chave = arquivo.replace(/\.[^.]+$/, '').toLowerCase()
    const nome = NOMES_MARCAS[chave] ?? chave.charAt(0).toUpperCase() + chave.slice(1)

    return { chave, nome, src }
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

// Fotos da frota (mesma pasta usada na tela de locação).
const fotosFrota = import.meta.glob<string>('/src/assets/frota/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
})

/* ------------------------------------------------------------------ */
/* Funções auxiliares                                                  */
/* ------------------------------------------------------------------ */

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

// Rola até a seção com animação suave, respeitando quem prefere menos movimento.
function rolarPara(id: string): void {
  const reduzido = window.matchMedia(QUERY_SEM_MOVIMENTO).matches

  document.getElementById(id)?.scrollIntoView({
    behavior: reduzido ? 'auto' : 'smooth',
    block: 'start',
  })
}

function irPara(evento: MouseEvent<HTMLAnchorElement>, id: string): void {
  evento.preventDefault()
  rolarPara(id)
}

/* ------------------------------------------------------------------ */
/* Componentes pequenos                                                */
/* ------------------------------------------------------------------ */

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

// Silhueta usada quando o veículo não tem foto (ou a foto falha ao carregar).
function IconeCarro() {
  return (
    <svg className="icone-carro" viewBox="0 0 120 56" aria-hidden="true" focusable="false">
      <path d="M6 38c0-5 3-8 8-9l12-12c3-3 7-5 12-5h26c6 0 11 2 15 6l8 9c8 1 13 3 13 9v4c0 2-2 4-4 4h-8a10 10 0 0 0-20 0H44a10 10 0 0 0-20 0H10c-2 0-4-2-4-4z" />
      <circle cx="34" cy="44" r="8" />
      <circle cx="78" cy="44" r="8" />
    </svg>
  )
}

const ICONES: Record<NomeIcone, ReactNode> = {
  contrato: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </>
  ),
  vistoria: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9.5 13l2 2 3.5-4" />
    </>
  ),
  pagamento: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),
  nota: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
}

function Icone({ nome }: { nome: NomeIcone }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {ICONES[nome]}
    </svg>
  )
}

interface FotoVeiculoProps {
  src?: string
  alt: string
}

function FotoVeiculo({ src, alt }: FotoVeiculoProps) {
  const [falhou, setFalhou] = useState(false)

  return (
    <div className="fleet-photo">
      {src && !falhou ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFalhou(true)} />
      ) : (
        <IconeCarro />
      )}
    </div>
  )
}

interface ContadorProps {
  valor: number
  formatar: (numero: number) => string
}

// Número que "sobe" de 0 até o valor quando entra na tela.
function Contador({ valor, formatar }: ContadorProps) {
  const alvo = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const elemento = alvo.current
      if (!elemento) return

      elemento.textContent = formatar(valor)

      const media = gsap.matchMedia()

      media.add(QUERY_COM_MOVIMENTO, () => {
        const contagem = { numero: 0 }
        elemento.textContent = formatar(0)

        gsap.to(contagem, {
          numero: valor,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            elemento.textContent = formatar(contagem.numero)
          },
          scrollTrigger: { trigger: elemento, start: 'top 92%', once: true },
        })
      })

      return () => media.revert()
    },
    { dependencies: [valor, formatar], revertOnUpdate: true },
  )

  return <span ref={alvo} />
}

// Faixa infinita de logos. O texto fica só para leitores de tela.
function CarrosselMarcas({ marcas }: { marcas: LogoMarca[] }) {
  if (marcas.length === 0) return null

  return (
    <section className="brands" aria-labelledby="brands-titulo">
      <h3 id="brands-titulo" className="brands-title">
        Marcas da nossa frota
      </h3>

      <ul className="visually-hidden">
        {marcas.map((marca) => (
          <li key={marca.chave}>{marca.nome}</li>
        ))}
      </ul>

      <div className="brands-viewport" aria-hidden="true">
        <div className="brands-track">
          {Array.from({ length: COPIAS_CARROSSEL }, (_, copia) => (
            <ul className="brands-group" key={copia}>
              {marcas.map((marca) => (
                <li key={marca.chave} title={marca.nome}>
                  <img
                    src={marca.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Busca dos dados                                                     */
/* ------------------------------------------------------------------ */

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

  // Números do topo da página, calculados a partir dos dados da API.
  const indicadores = useMemo<Indicador[]>(() => {
    if (!catalogo) return []

    const itens: Indicador[] = [
      { rotulo: 'Veículos na frota', valor: catalogo.veiculos.length, formatar: formatarInteiro },
      { rotulo: 'Marcas', valor: catalogo.marcas.length, formatar: formatarInteiro },
      { rotulo: 'Categorias', valor: catalogo.categorias.length, formatar: formatarInteiro },
    ]

    if (catalogo.categorias.length > 0) {
      itens.push({
        rotulo: 'Diária a partir de',
        valor: Math.min(...catalogo.categorias.map((c) => c.valorLocacao)),
        formatar: formatarDiaria,
      })
    }

    return itens
  }, [catalogo])

  // Cada categoria com sua descrição e a quantidade de veículos da frota.
  const categoriasInfo = useMemo<InfoCategoria[]>(() => {
    if (!catalogo) return []

    const modelos = new Map(catalogo.modelos.map((m) => [m.id, m] as const))
    const contagem = new Map<string | undefined, number>()

    catalogo.veiculos.forEach((veiculo) => {
      const categoriaId = modelos.get(veiculo.modeloId)?.categoriaId
      contagem.set(categoriaId, (contagem.get(categoriaId) ?? 0) + 1)
    })

    return catalogo.categorias.map((categoria) => ({
      categoria,
      descricao: DESCRICOES_CATEGORIA[normalizar(categoria.nome)] ?? DESCRICAO_PADRAO,
      veiculos: contagem.get(categoria.id) ?? 0,
    }))
  }, [catalogo])

  // Relaciona veículo → modelo → marca/categoria uma única vez por carga de dados.
  const destaques = useMemo<Destaque[]>(() => {
    if (!catalogo) return []

    const marcas = new Map(catalogo.marcas.map((m) => [m.id, m] as const))
    const modelos = new Map(catalogo.modelos.map((m) => [m.id, m] as const))
    const categorias = new Map(catalogo.categorias.map((c) => [c.id, c] as const))

    return catalogo.veiculos.slice(0, QUANTIDADE_DESTAQUES).map((veiculo) => {
      const modelo = modelos.get(veiculo.modeloId)
      const marca = modelo ? marcas.get(modelo.marcaId) : undefined
      const categoria = modelo ? categorias.get(modelo.categoriaId) : undefined

      const titulo = [marca?.nome, modelo?.nome].filter(Boolean).join(' ') || veiculo.placa
      const foto = veiculo.foto ? (fotosFrota[veiculo.foto] ?? veiculo.foto) : undefined

      return { veiculo, titulo, categoria, foto }
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
          .from('.mega-poster', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, 0.25)
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
  // Também controla a barra de progresso da página e a linha do "passo a passo".
  useGSAP(
    () => {
      if (!homeVisivel) return

      const media = gsap.matchMedia()

      media.add(QUERY_COM_MOVIMENTO, () => {
        const secoes = root.current?.querySelectorAll<HTMLElement>('.reveal')

        secoes?.forEach((secao) => {
          const itens = secao.querySelectorAll<HTMLElement>('.reveal-item')
          const cabecalho = secao.querySelector<HTMLElement>('.section-head')

          const alvos: HTMLElement[] =
            itens.length > 0 ? [...(cabecalho ? [cabecalho] : []), ...itens] : [secao]

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

        // Barra fina no topo que acompanha a rolagem da página inteira.
        gsap.to('.scroll-progress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.2 },
        })

        // Linha do passo a passo se desenhando conforme a seção passa pela tela.
        gsap.fromTo(
          '.steps-progress span',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.steps',
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: true,
            },
          },
        )

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

      <div className="scroll-progress" aria-hidden="true" />

      <main inert={!homeVisivel}>
        {/* ---------------------------------------------------------- */}
        {/* Hero                                                        */}
        {/* ---------------------------------------------------------- */}
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

        {/* ---------------------------------------------------------- */}
        {/* Sobre + carrossel de marcas                                 */}
        {/* ---------------------------------------------------------- */}
        <div className="dark-band">
          <section className="container-wide intro reveal">
            <span className="eyebrow eyebrow--claro">Sobre nós</span>
            <h2>Sobre a Mega Motors</h2>
            <p>
              Compare categorias e diárias, escolha o carro para sua viagem e acompanhe a
              locação da retirada até a devolução.
            </p>
          </section>

          <CarrosselMarcas marcas={LOGOS_MARCAS} />
        </div>

        {(erro || (homeVisivel && !catalogo)) && (
          <div className="container-wide status-area">
            {erro && (
              <div className="alert alert-warning" role="alert">
                <p>Não foi possível carregar a frota. Confira se o JSON Server está rodando.</p>
                <Button label="Tentar novamente" onClick={tentarNovamente} />
              </div>
            )}

            {!catalogo && !erro && <p role="status">Consultando a frota…</p>}
          </div>
        )}

        {/* ---------------------------------------------------------- */}
        {/* Números                                                     */}
        {/* ---------------------------------------------------------- */}
        {indicadores.length > 0 && (
          <section className="container-wide stats-wrap" aria-label="Números da locadora">
            <dl className="stats reveal">
              {indicadores.map((indicador) => (
                <div className="stat" key={indicador.rotulo}>
                  <dt>{indicador.rotulo}</dt>
                  <dd>
                    <Contador valor={indicador.valor} formatar={indicador.formatar} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ---------------------------------------------------------- */}
        {/* Categorias                                                  */}
        {/* ---------------------------------------------------------- */}
        <section id="categorias" className="section reveal">
          <div className="container-wide">
            <header className="section-head">
              <span className="eyebrow">Categorias</span>
              <h2>Categorias e diárias</h2>
              <p>Escolha a categoria ideal para a sua viagem. O valor da diária é definido por categoria.</p>
            </header>

            <div className="rates">
              {categoriasInfo.map(({ categoria, descricao, veiculos }) => (
                <article className="rate reveal-item" key={categoria.id}>
                  <h3>{categoria.nome}</h3>
                  <p className="rate-desc">{descricao}</p>
                  <p className="rate-price">
                    <strong>{moeda.format(categoria.valorLocacao)}</strong> / dia
                  </p>
                  <span className="rate-count">
                    {veiculos} {veiculos === 1 ? 'veículo' : 'veículos'} na frota
                  </span>
                </article>
              ))}
            </div>

            {catalogo?.categorias.length === 0 && <p>Nenhuma categoria cadastrada.</p>}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Frota                                                       */}
        {/* ---------------------------------------------------------- */}
        <section id="frota" className="section section--alt reveal">
          <div className="container-wide">
            <header className="section-head">
              <span className="eyebrow">Frota</span>
              <h2>Destaques da frota</h2>
              <p>Conheça alguns dos veículos cadastrados na locadora.</p>
            </header>

            <div className="row g-3 g-lg-4">
              {destaques.map(({ veiculo, titulo, categoria, foto }) => (
                <div className="col-12 col-md-4 reveal-item" key={veiculo.id ?? veiculo.placa}>
                  <Card title={titulo}>
                    <FotoVeiculo src={foto} alt={`${titulo}, placa ${veiculo.placa}`} />

                    <p>
                      {veiculo.cor} · {veiculo.anoFabricacao} ·{' '}
                      {veiculo.kmRodado.toLocaleString('pt-BR')} km
                    </p>

                    <footer>
                      <span>{categoria?.nome ?? 'Categoria pendente'}</span>
                      <strong>
                        {categoria ? `${moeda.format(categoria.valorLocacao)}/dia` : 'Sob consulta'}
                      </strong>
                    </footer>

                    <Button label="Reservar" onClick={() => navigate('/locacoes')} />
                  </Card>
                </div>
              ))}
            </div>

            {catalogo?.veiculos.length === 0 && <p>Nenhum veículo cadastrado.</p>}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Benefícios                                                  */}
        {/* ---------------------------------------------------------- */}
        <section id="beneficios" className="section reveal">
          <div className="container-wide">
            <header className="section-head">
              <span className="eyebrow">Tudo no mesmo lugar</span>
              <h2>Uma locação, do começo ao fim</h2>
              <p>
                Cada locação gera contrato, vistorias, pagamentos e nota fiscal, tudo registrado
                em um só sistema.
              </p>
            </header>

            <div className="features">
              {beneficios.map((beneficio) => (
                <article className="feature reveal-item" key={beneficio.titulo}>
                  <span className="feature-icon">
                    <Icone nome={beneficio.icone} />
                  </span>
                  <h3>{beneficio.titulo}</h3>
                  <p>{beneficio.descricao}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Como funciona                                               */}
        {/* ---------------------------------------------------------- */}
        <section id="como-funciona" className="section section--alt reveal">
          <div className="container-wide">
            <header className="section-head">
              <span className="eyebrow">Passo a passo</span>
              <h2>Como funciona a locação</h2>
            </header>

            <div className="steps-progress" aria-hidden="true">
              <span />
            </div>

            <ol className="row g-4 steps">
              {etapas.map((etapa, indice) => (
                <li className="col-12 col-sm-6 col-lg-3 reveal-item" key={etapa.titulo}>
                  <small>{String(indice + 1).padStart(2, '0')}</small>
                  <h3>{etapa.titulo}</h3>
                  <p>{etapa.descricao}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Chamada final                                               */}
        {/* ---------------------------------------------------------- */}
        <section className="cta">
          <div className="container-wide reveal">
            <h2>Sua próxima viagem começa aqui.</h2>
            <p>Escolha o cliente, o veículo e o período. O valor previsto aparece na hora.</p>
            <Button label="Acessar locações ↗" onClick={() => navigate('/locacoes')} />
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------- */}
      {/* Rodapé                                                          */}
      {/* -------------------------------------------------------------- */}
      <footer className="bottom">
        <div className="container-wide">
          <div className="bottom-grid">
            <div className="bottom-brand">
              <strong>MEGA MOTORS</strong>
              <p>
                Sistema de locação de veículos: frota, clientes e todo o ciclo da locação, da
                retirada à devolução.
              </p>
            </div>

            <nav aria-label="Atalhos da página">
              <h3>Navegue</h3>
              <ul>
                <li>
                  <a href="#categorias" onClick={(e) => irPara(e, 'categorias')}>
                    Categorias
                  </a>
                </li>
                <li>
                  <a href="#frota" onClick={(e) => irPara(e, 'frota')}>
                    Frota
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" onClick={(e) => irPara(e, 'como-funciona')}>
                    Como funciona
                  </a>
                </li>
                <li>
                  <Link to="/locacoes">Locações</Link>
                </li>
              </ul>
            </nav>

            <div>
              <h3>Projeto</h3>
              <ul>
                <li>Atividade de laboratório</li>
                <li>Ciência da Computação</li>
                <li>PUC Goiás</li>
              </ul>
            </div>
          </div>

          <p className="bottom-legal">
            © {ANO_ATUAL} Mega Motors · Sistema de locação de veículos · PUC Goiás
          </p>
        </div>
      </footer>
    </div>
  )
}