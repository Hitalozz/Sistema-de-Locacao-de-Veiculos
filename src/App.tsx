import { CategoriaList } from './pages/categorias/CategoriaList'
import { MarcaList } from './pages/marcas/MarcaList'
import { Link, Route, Routes } from 'react-router-dom'
import { modules } from './modules'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'

interface PlaceholderProps { title: string }
function Placeholder({title}: PlaceholderProps) {
  return <main className="container py-5"><h1>{title}</h1><p>Esta página será implementada na próxima etapa do projeto.</p><Link to="/">Voltar ao início</Link></main>
}
export default function App() {
  return <><Navbar /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/categorias" element={<CategoriaList />} />
    <Route path="/marcas" element={<MarcaList />} />
    {modules.filter(([path]) => path !== 'marcas' && path !== 'categorias').map(([path,title]) => <Route key={path} path={path} element={<Placeholder title={title} />} />)}
    <Route path="*" element={<main className="container py-5"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></main>} />
  </Routes></>
}

