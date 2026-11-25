import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import './Preloader.css'

gsap.registerPlugin(useGSAP)

interface PreloaderProps {
  /** true quando a Home já pode ser revelada (dados carregados + tempo mínimo). */
  ready: boolean
  /** Chamado quando as cortinas começam a abrir: hora de iniciar a animação da Home. */
  onReveal?: () => void
  /** Chamado no fim de toda a animação: o preloader já pode ser removido da tela. */
  onDone: () => void
}

interface Ponto {
  x: number
  y: number
}

interface Risco {
  valor: number
  maior: boolean
  interno: Ponto
  externo: Ponto
  rotulo: Ponto
}

/* ------------------------------------------------------------------ */
/* Constantes de ajuste                                                */
/* ------------------------------------------------------------------ */

const SUBIDA_ALVO = 92 // até onde o ponteiro sobe enquanto os dados carregam (%)
const SUBIDA_DURACAO = 3.2 // segundos até chegar a SUBIDA_ALVO
const QTD_STREAKS = 28 // linhas de velocidade na largada
const QUERY_SEM_MOVIMENTO = '(prefers-reduced-motion: reduce)'

/* Geometria do velocímetro (viewBox 400 x 400, arco de 270°) */
const CENTRO = 200
const RAIO = 150
const ANGULO_INICIAL = 135
const VARREDURA = 270

function pontoNoCirculo(angulo: number, raio: number): Ponto {
  const rad = (angulo * Math.PI) / 180
  return { x: CENTRO + raio * Math.cos(rad), y: CENTRO + raio * Math.sin(rad) }
}

const inicioArco = pontoNoCirculo(ANGULO_INICIAL, RAIO)
const fimArco = pontoNoCirculo(ANGULO_INICIAL + VARREDURA, RAIO)

const CAMINHO_ARCO = `M ${inicioArco.x.toFixed(2)} ${inicioArco.y.toFixed(2)} A ${RAIO} ${RAIO} 0 1 1 ${fimArco.x.toFixed(2)} ${fimArco.y.toFixed(2)}`

const RISCOS: Risco[] = Array.from({ length: 11 }, (_, i) => {
  const angulo = ANGULO_INICIAL + i * (VARREDURA / 10)
  const maior = i % 2 === 0

  return {
    valor: i * 10,
    maior,
    interno: pontoNoCirculo(angulo, 160),
    externo: pontoNoCirculo(angulo, maior ? 178 : 170),
    rotulo: pontoNoCirculo(angulo, 128),
  }
})

const STREAKS = Array.from({ length: QTD_STREAKS }, (_, i) => i)

function rotuloStatus(valor: number): string {
  if (valor >= 100) return 'Largada!'
  if (valor >= 80) return 'Zona vermelha'
  if (valor >= 35) return 'Acelerando'
  return 'Ignição'
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export function Preloader({ ready, onReveal, onDone }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null)
  const contador = useRef<HTMLSpanElement>(null)
  const status = useRef<HTMLParagraphElement>(null)
  const arco = useRef<SVGPathElement>(null)
  const ponteiro = useRef<SVGGElement>(null)
  const preenchimento = useRef<HTMLSpanElement>(null)

  // "valor" é o progresso (0–100, pode passar de 100 no estouro); "tremor" é a vibração do ponteiro.
  const estado = useRef({ valor: 0, tremor: 1 })
  const subida = useRef<gsap.core.Tween | null>(null)
  const overflowAnterior = useRef('')

  // Guardamos os callbacks em refs para a animação sempre chamar a versão mais recente.
  const onDoneRef = useRef(onDone)
  const onRevealRef = useRef(onReveal)
  useEffect(() => {
    onDoneRef.current = onDone
    onRevealRef.current = onReveal
  })

  // Trava a rolagem enquanto as cortinas estão fechadas.
  useEffect(() => {
    overflowAnterior.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    return () => {
      document.body.style.overflow = overflowAnterior.current
    }
  }, [])

  // Desenha o estado atual direto no DOM (sem re-render do React a cada frame).
  const pintar = useCallback(() => {
    const { valor, tremor } = estado.current
    const limitado = Math.min(Math.max(valor, 0), 100)
    const angulo =
      ANGULO_INICIAL + (valor / 100) * VARREDURA + (Math.random() - 0.5) * 2 * tremor

    if (arco.current) {
      arco.current.style.strokeDashoffset = String(100 - limitado)
    }

    ponteiro.current?.setAttribute(
      'transform',
      `rotate(${angulo.toFixed(2)} ${CENTRO} ${CENTRO})`,
    )

    if (contador.current) {
      contador.current.textContent = String(Math.round(limitado)).padStart(3, '0')
    }

    if (preenchimento.current) {
      preenchimento.current.style.clipPath = `inset(0 ${100 - limitado}% 0 0)`
    }

    if (status.current) {
      const texto = rotuloStatus(valor)
      if (status.current.textContent !== texto) status.current.textContent = texto
    }
  }, [])

  const revelar = useCallback(() => {
    document.body.style.overflow = overflowAnterior.current
    onRevealRef.current?.()
  }, [])

  // Entrada: monta o painel e faz o ponteiro subir devagar enquanto os dados carregam.
  useGSAP(
    () => {
      const reduzido = window.matchMedia(QUERY_SEM_MOVIMENTO).matches

      estado.current.valor = 0
      estado.current.tremor = reduzido ? 0 : 1

      gsap.ticker.add(pintar)
      pintar()

      if (!reduzido) {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.pl-gauge', { opacity: 0, scale: 0.85, duration: 0.7 })
          .from('.pl-tick', { opacity: 0, duration: 0.4, stagger: 0.03 }, 0.15)
          .from('.pl-brand', { opacity: 0, y: 16, duration: 0.6 }, 0.25)
          .from('.pl-status', { opacity: 0, duration: 0.4 }, 0.5)
      }

      subida.current = gsap.to(estado.current, {
        valor: SUBIDA_ALVO,
        duration: reduzido ? 0.4 : SUBIDA_DURACAO,
        ease: 'power2.out',
      })

      return () => {
        gsap.ticker.remove(pintar)
      }
    },
    { scope: root },
  )

  // Saída: quando tudo estiver pronto, pisa fundo, estoura, dá o flash e abre as cortinas.
  useGSAP(
    () => {
      if (!ready || !root.current) return

      subida.current?.kill()

      const reduzido = window.matchMedia(QUERY_SEM_MOVIMENTO).matches

      if (reduzido) {
        gsap
          .timeline({ onComplete: () => onDoneRef.current() })
          .to(estado.current, { valor: 100, tremor: 0, duration: 0.3, ease: 'none' })
          .call(revelar)
          .to(root.current, { opacity: 0, duration: 0.3 })
        return
      }

      const q = gsap.utils.selector(root)
      const streaks = q('.pl-streak')

      gsap.set(streaks, {
        rotation: (i: number) => (360 / QTD_STREAKS) * i + gsap.utils.random(-5, 5),
        transformOrigin: '0% 50%',
        height: () => gsap.utils.random(1, 3),
        scaleX: 0,
        opacity: 0,
      })

      gsap
        .timeline({ onComplete: () => onDoneRef.current() })
        // pisa fundo e passa da zona vermelha
        .to(estado.current, { valor: 100, duration: 0.8, ease: 'power2.in' })
        .to(estado.current, { valor: 104, tremor: 3, duration: 0.18, ease: 'power1.out' })
        .addLabel('lancar')
        // flash + zoom no velocímetro + linhas de velocidade
        .to('.pl-flash', { opacity: 1, duration: 0.12, ease: 'power2.out' }, 'lancar')
        .to('.pl-gauge', { scale: 1.8, duration: 0.45, ease: 'power3.in' }, 'lancar')
        .to('.pl-content', { opacity: 0, duration: 0.35, ease: 'power2.in' }, 'lancar+=0.1')
        .to('.pl-flash', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 'lancar+=0.2')
        .fromTo(
          streaks,
          { scaleX: 0, opacity: 1 },
          {
            scaleX: () => gsap.utils.random(0.4, 1),
            opacity: 0,
            duration: 0.7,
            stagger: { amount: 0.2, from: 'random' },
            ease: 'power2.out',
          },
          'lancar+=0.1',
        )
        // as duas metades se abrem e a Home começa a animar por baixo
        .addLabel('abrir', 'lancar+=0.5')
        .call(revelar, [], 'abrir')
        .to('.pl-panel--esq', { xPercent: -101, duration: 0.95, ease: 'power4.inOut' }, 'abrir')
        .to('.pl-panel--dir', { xPercent: 101, duration: 0.95, ease: 'power4.inOut' }, 'abrir')
    },
    { scope: root, dependencies: [ready] },
  )

  return createPortal(<div ref={root} className="pl-root" role="status">
      <span className="visually-hidden">Carregando a Mega Motors…</span>

      <div className="pl-panel pl-panel--esq" aria-hidden="true" />
      <div className="pl-panel pl-panel--dir" aria-hidden="true" />

      <div className="pl-content" aria-hidden="true">
        <div className="pl-glow" />

        <div className="pl-brand">
          <span className="pl-brand-contorno">MEGA MOTORS</span>
          <span ref={preenchimento} className="pl-brand-preenchido">
            MEGA MOTORS
          </span>
        </div>

        <div className="pl-gauge">
          <svg className="pl-svg" viewBox="0 0 400 400" focusable="false">
            <defs>
              <linearGradient
                id="pl-grad"
                gradientUnits="userSpaceOnUse"
                x1="50"
                y1="0"
                x2="350"
                y2="0"
              >
                <stop offset="0" stopColor="#55bce7" />
                <stop offset="1" stopColor="#ff7a1a" />
              </linearGradient>
            </defs>

            <path className="pl-trilho" d={CAMINHO_ARCO} pathLength={100} />
            <path className="pl-zona" d={CAMINHO_ARCO} pathLength={100} />
            <path ref={arco} className="pl-arco" d={CAMINHO_ARCO} pathLength={100} />

            {RISCOS.map((risco) => (
              <line
                key={risco.valor}
                className={risco.maior ? 'pl-tick pl-tick--maior' : 'pl-tick'}
                x1={risco.interno.x}
                y1={risco.interno.y}
                x2={risco.externo.x}
                y2={risco.externo.y}
              />
            ))}

            {RISCOS.filter((risco) => risco.maior).map((risco) => (
              <text
                key={risco.valor}
                className="pl-tick pl-rotulo"
                x={risco.rotulo.x}
                y={risco.rotulo.y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {risco.valor}
              </text>
            ))}

            <g
              ref={ponteiro}
              className="pl-ponteiro"
              transform={`rotate(${ANGULO_INICIAL} ${CENTRO} ${CENTRO})`}
            >
              <polygon points="188,195 338,200 188,205" />
            </g>
            <circle className="pl-eixo" cx={CENTRO} cy={CENTRO} r="13" />
          </svg>

          <div className="pl-readout">
            <span ref={contador} className="pl-count">
              000
            </span>
            <span className="pl-unit">%</span>
          </div>
        </div>

        <p ref={status} className="pl-status">
          Ignição
        </p>
      </div>

      <div className="pl-streaks" aria-hidden="true">
        {STREAKS.map((i) => (
          <i className="pl-streak" key={i} />
        ))}
      </div>

      <div className="pl-flash" aria-hidden="true" />
    </div>, document.body)
}
