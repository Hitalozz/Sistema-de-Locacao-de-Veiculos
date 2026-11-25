import { Locacoes } from './pages/locacoes/Locacoes'
import { ClienteList } from './pages/clientes/ClienteList'
import { ManutencaoList } from './pages/manutencoes/ManutencaoList'
import { VeiculoList } from './pages/veiculos/VeiculoList'
import { ModeloList } from './pages/modelos/ModeloList'
import { CategoriaList } from './pages/categorias/CategoriaList'
import { MarcaList } from './pages/marcas/MarcaList'
import './Cadastros.css'
import { Link, Outlet, Route, Routes } from 'react-router-dom'
import { modules } from './modules'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'

interface PlaceholderProps { title: string }
function Placeholder({title}: PlaceholderProps) {
  return <main className="container py-5"><h1>{title}</h1><p>Esta página será implementada na próxima etapa do projeto.</p><Link to="/">Voltar ao início</Link></main>
}
export default function App() {
  return <><Navbar /><Routes>
    <Route element={<div className="mega-cadastros"><Outlet /></div>}>
      <Route path="/marcas" element={<MarcaList />} />
      <Route path="/categorias" element={<CategoriaList />} />
      <Route path="/modelos" element={<ModeloList />} />
      <Route path="/veiculos" element={<VeiculoList />} />
      <Route path="/manutencoes" element={<ManutencaoList />} />
      <Route path="/clientes" element={<ClienteList />} />
    </Route>
    <Route path="/" element={<Home />} />
    
    
    
    
    {modules.filter(([path]) => path !== 'clientes' && path !== 'manutencoes' && path !== 'marcas' && path !== 'categorias' && path !== 'modelos' && path !== 'veiculos').map(([path,title]) => <Route key={path} path={path} element={path === 'locacoes' ? <Locacoes/> : <Placeholder title={title} />} />)}
    <Route path="*" element={<main className="container py-5"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></main>} />
  </Routes></>
}






