import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { Carregando } from './components/Carregando.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { PaginaInexistente } from './pages/PaginaInexistente.jsx'

const HojePage = lazy(() => import('./pages/HojePage.jsx').then((m) => ({ default: m.HojePage })))
const BuscaPage = lazy(() => import('./pages/BuscaPage.jsx').then((m) => ({ default: m.BuscaPage })))
const MesPage = lazy(() => import('./pages/MesPage.jsx').then((m) => ({ default: m.MesPage })))
const DiaPage = lazy(() => import('./pages/DiaPage.jsx').then((m) => ({ default: m.DiaPage })))

export function App() {
  return (
    <Suspense
      fallback={
        <div className="carregando-ambiente">
          <Carregando texto="A preparar o calendário…" />
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hoje" element={<HojePage />} />
          <Route path="/busca" element={<BuscaPage />} />
          <Route path="/calendario/:ano/:mes" element={<MesPage />} />
          <Route path="/calendario/:ano/:mes/:dia" element={<DiaPage />} />
          <Route path="*" element={<PaginaInexistente />} />
        </Route>
      </Routes>
    </Suspense>
  )
}