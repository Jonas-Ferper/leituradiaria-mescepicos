import { NavLink, Outlet } from 'react-router-dom'
import { Asterisco } from './Asterisco.jsx'

export function Layout() {
  return (
    <div className="moldura">
      <a className="saltar" href="#conteudo">
        Saltar para o conteúdo
      </a>
      <header className="masthead">
        <NavLink to="/" className="marca" aria-label="Calendário Litúrgico — início">
          <span className="marca-emblema">
            <Asterisco tamanho={20} />
          </span>
          <span className="marca-texto">
            <strong>Calendário Litúrgico</strong>
          </span>
        </NavLink>
        <nav className="nav" aria-label="Navegação principal">
          <NavLink to="/hoje" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Hoje
          </NavLink>
          <NavLink to="/busca" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Busca
          </NavLink>
        </nav>
      </header>

      <main className="conteudo" id="conteudo">
        <Outlet />
      </main>

      <footer className="pie">
        <p className="pie-principal">MESCE - Ministros da Sagrada Comunhão Eucarística</p>
        <p className="pie-fino">Paróquia São Francisco de Assis · Picos, Piauí</p>
      </footer>
    </div>
  )
}
