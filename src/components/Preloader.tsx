import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)
interface PreloaderProps { ready: boolean; onDone: () => void }
export function Preloader({ready, onDone}: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const number = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    // A aproximação a 90% representa espera visual, não bytes transferidos.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const progress = { value: Number(number.current?.textContent ?? 0) }
    const timeline = gsap.timeline()
    timeline.to(progress, {
      value: ready ? 100 : 90, duration: reduced ? 0 : ready ? 0.28 : 2,
      ease: 'power2.out', onUpdate: () => {
        if (number.current) number.current.textContent = String(Math.round(progress.value))
        if (bar.current) bar.current.style.transform = `scaleX(${progress.value / 100})`
      },
    })
    if (ready) timeline.to(root.current, { yPercent: reduced ? 0 : -100, opacity: reduced ? 0 : 1, duration: reduced ? 0 : 0.55, ease: 'power3.inOut' }).call(onDone)
  }, {scope: root, dependencies: [ready, onDone], revertOnUpdate: true})
  return <div ref={root} className="loader" role="status" aria-label="Carregando a locadora">
    <div className="loader-inner" aria-hidden="true"><div className="wordmark"><i>///</i> MEGA MOTORS</div>
    <div className="road"><div ref={bar} /></div><div className="meter">Preparando a viagem <b><span ref={number}>0</span>%</b></div></div>
  </div>
}
