import { Link, NavLink, useLocation } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import { modules } from '../modules'
import logoPuc from '../assets/puc-goias.svg'

export function Navbar() {
  const menu = useRef<HTMLDetailsElement>(null)
  const { pathname } = useLocation()
  useEffect(() => { if (menu.current) menu.current.open = false }, [pathname])
  return <header className="mast"><nav className="container-wide nav-inner" aria-label="Navegação principal">
    <Link to="/" className="wordmark" aria-label="Mega Motors e PUC Goiás, início">
      <img src={logoPuc} alt="" className="logo-puc" />
      <span><i aria-hidden="true">///</i> MEGA MOTORS</span>
    </Link>
    <div className="nav-items"><NavLink to="/" end>Início</NavLink>
    <details ref={menu} className="menu" onKeyDown={e => { if (e.key === 'Escape' && menu.current) {menu.current.open=false; menu.current.querySelector('summary')?.focus()} }}>
      <summary>Módulos</summary><div className="menu-panel">{modules.map(([path,title]) => <Link key={path} to={'/'+path} onClick={() => { if(menu.current) menu.current.open=false }}>{title}</Link>)}</div>
    </details><Link className="nav-action" to="/locacoes">Locações ↗</Link></div>
  </nav></header>
}
