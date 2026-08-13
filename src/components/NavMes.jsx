import { Link, useNavigate } from 'react-router-dom'
import { anosDisponiveis, navegacaoDe } from '../lib/clp/data.js'
import { pad2 } from '../lib/clp/validar.js'

export function NavMes({ ano, mes }) {
  const navegar = useNavigate()
  const nav = navegacaoDe(ano, mes)
  const ir = (meta) => navegar(`/calendario/${meta.ano}/${pad2(meta.mes)}`)

  return (
    <nav className="navmes" aria-label="Navegação entre meses">
      <button
        type="button"
        className="botao-arr"
        disabled={!nav.anterior}
        onClick={() => nav.anterior && ir(nav.anterior)}
        title={nav.anterior ? `Mês anterior` : 'Este é o primeiro mês disponível'}
      >
        <span className="seta" aria-hidden="true">
          ←
        </span>
        <span className="arr-roto">{nav.anterior ? `${nav.anterior.nomeMes} ${nav.anterior.ano}` : 'primeiro mês'}</span>
      </button>
      <button
        type="button"
        className="botao-arr"
        disabled={!nav.seguinte}
        onClick={() => nav.seguinte && ir(nav.seguinte)}
        title={nav.seguinte ? `Mês seguinte` : 'Este é o último mês disponível'}
      >
        <span className="arr-roto">{nav.seguinte ? `${nav.seguinte.nomeMes} ${nav.seguinte.ano}` : 'último mês'}</span>
        <span className="seta" aria-hidden="true">
          →
        </span>
      </button>
    </nav>
  )
}

export function SeletorAno({ ano, aoEscolher }) {
  const anos = anosDisponiveis()
  if (anos.length === 0) return null
  return (
    <label className="seletor">
      <span className="seletor-rotulo">Ano</span>
      <select
        value={ano}
        onChange={(e) => {
          const a = Number(e.target.value)
          if (Number.isInteger(a) && aoEscolher) aoEscolher(a)
        }}
        aria-label="Escolher ano"
      >
        {anos.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </label>
  )
}

export function NavDia({ anterior, seguinte }) {
  return (
    <nav className="navdia" aria-label="Dia anterior e seguinte">
      {anterior ? (
        <Link className="botao-arr" to={`/calendario/${anterior.ano}/${pad2(anterior.mes)}/${pad2(anterior.numero)}`}>
          <span className="seta" aria-hidden="true">
            ←
          </span>
          <span className="arr-roto">{anterior.texto}</span>
        </Link>
      ) : (
        <span className="botao-arr desativado" aria-hidden="true">
          <span className="seta">←</span>
          <span className="arr-roto">início do mês</span>
        </span>
      )}
      {seguinte ? (
        <Link className="botao-arr" to={`/calendario/${seguinte.ano}/${pad2(seguinte.mes)}/${pad2(seguinte.numero)}`}>
          <span className="arr-roto">{seguinte.texto}</span>
          <span className="seta" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <span className="botao-arr desativado" aria-hidden="true">
          <span className="arr-roto">fim do mês</span>
          <span className="seta">→</span>
        </span>
      )}
    </nav>
  )
}