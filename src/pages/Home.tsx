import { useCallback, useEffect, useRef, useState } from 'react'
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

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const etapas = [
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

export function Home() {
  const root = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [tempoMinimoConcluido, setTempoMinimoConcluido] = useState(false)
  const [homeVisivel, setHomeVisivel] = useState(false)

  const finalizarPreloader = useCallback(() => {
    setHomeVisivel(true)
  }, [])

  useEffect(() => {
    const movimentoReduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const timer = window.setTimeout(() => {
      setTempoMinimoConcluido(true)
    }, movimentoReduzido ? 0 : 850)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function carregarCatalogo() {
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

    void carregarCatalogo()

    return () => controller.abort()
  }, [tentativa])

  // O título e o BMW entram quando a cortina do preloader termina.
  useGSAP(
    () => {
      if (!homeVisivel) return

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.timeline()
          .from('.mega-title span', {
            opacity: 0,
            y: 18,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
          })
          .from(
            '.mega-poster',
            {
              opacity: 0,
              scale: 0.98,
              duration: 0.65,
              ease: 'power2.out',
            },
            0.1,
          )
          .from(
            '.mega-actions',
            { opacity: 0, y: 10, duration: 0.4 },
            0.35,
          )
      })

      return () => media.revert()
    },
    {
      scope: root,
      dependencies: [homeVisivel],
      revertOnUpdate: true,
    },
  )

  // Cada seção aparece ao entrar na área visível do navegador.
  useGSAP(
    () => {
      if (!homeVisivel) return

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const secoes = root.current?.querySelectorAll<HTMLElement>('.reveal')

        secoes?.forEach((secao) => {
          gsap.from(secao, {
            opacity: 0,
            y: 22,
            duration: 0.55,
            scrollTrigger: {
              trigger: secao,
              start: 'top 96%',
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

  function tentarNovamente() {
    setErro(false)
    setTentativa((anterior) => anterior + 1)
  }

  const pronto = tempoMinimoConcluido && (catalogo !== null || erro)

  return (
    <div ref={root}>
      {!homeVisivel && (
        <Preloader ready={pronto} onDone={finalizarPreloader} />
      )}

      <main inert={!homeVisivel}>
        <section className="mega-stage" aria-labelledby="mega-title">
          <div className="mega-scene">
            {/* O CSS posiciona o título atrás do PNG transparente. */}
            <h1 id="mega-title" className="mega-title">
              <span>MEGA</span>{' '}
              <span>MOTORS</span>
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
            <Button
              label="Explorar a frota ↓"
              onClick={() => document.getElementById('frota')?.scrollIntoView()}
            />

            <Button
              label="Ver categorias"
              variant="secondary"
              onClick={() => document.getElementById('categorias')?.scrollIntoView()}
            />
          </div>
        </section>

        <div className="dark-band">
          <section className="container-wide intro reveal">
            <h2>Sobre a Mega Motors</h2>
            <p>
              Compare categorias e diárias, escolha o carro para sua viagem
              e acompanhe a locação da retirada até a devolução.
            </p>
          </section>
        </div>

        <div className="container-wide">
          {erro && (
            <div className="alert alert-warning mt-4" role="alert">
              <p>Não foi possível carregar a frota. Confira se o JSON Server está rodando.</p>
              <Button label="Tentar novamente" onClick={tentarNovamente} />
            </div>
          )}

          {homeVisivel && !catalogo && !erro && (
            <p role="status">Consultando a frota…</p>
          )}

          <section id="categorias" className="section reveal">
            <h2>Categorias e diárias</h2>

            {catalogo?.categorias.map((categoria) => (
              <div className="rate" key={categoria.id}>
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
              {catalogo?.veiculos.slice(0, 3).map((veiculo) => {
                const modelo = catalogo.modelos.find(
                  (item) => item.id === veiculo.modeloId,
                )
                const marca = catalogo.marcas.find(
                  (item) => item.id === modelo?.marcaId,
                )
                const categoria = catalogo.categorias.find(
                  (item) => item.id === modelo?.categoriaId,
                )

                const titulo =
                  [marca?.nome, modelo?.nome].filter(Boolean).join(' ') ||
                  veiculo.placa

                return (
                  <div className="col-12 col-md-4" key={veiculo.id}>
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
                )
              })}
            </div>

            {catalogo?.veiculos.length === 0 && (
              <p>Nenhum veículo cadastrado.</p>
            )}
          </section>

          <section className="section reveal">
            <h2>Como funciona a locação</h2>

            <ol className="row g-4 steps">
              {etapas.map((etapa, indice) => (
                <li className="col-12 col-sm-6 col-lg-3" key={etapa.titulo}>
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