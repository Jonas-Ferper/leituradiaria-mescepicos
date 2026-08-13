import { SEMANA_ABREV } from '../lib/clp/validar.js'

function colunasDoMes(meta) {
  const base = new Date(`${meta.inicio}T00:00:00`)
  const wd = base.getDay()
  return { offset: (wd + 6) % 7, total: meta.totalDias }
}

export function EsqueletoMes({ meta }) {
  const { offset, total } = colunasDoMes(meta)
  const celulas = [...new Array(offset).fill(null), ...new Array(total).fill(true)]
  return (
    <div className="esqueleto" aria-hidden="true">
      <div className="sk sk-linha w30" />
      <div className="sk sk-fita" />
      <div className="calendario">
        <div className="calendario-rotulos">
          {SEMANA_ABREV.map((s, i) => (
            <span key={`${s}-${i}`}>{s}</span>
          ))}
        </div>
        <div className="calendario-grade">
          {celulas.map((v, i) =>
            v ? (
              <span key={`sk-${i}`} className="dia dia-esqueleto">
                <span className="sk sk-dia-num" />
                <span className="sk sk-dia-linha" />
              </span>
            ) : (
              <span key={`v-${i}`} className="calendario-buraco" />
            ),
          )}
        </div>
      </div>
    </div>
  )
}

export function EsqueletoDia() {
  return (
    <div className="esqueleto pagmes pagdia" aria-hidden="true">
      <div className="sk sk-istmo" />
      <div className="sk sk-data" />
      <div className="pagdia-corpo">
        <div className="esqueleto-cartao">
          <div className="sk sk-rotulo w40" />
          <div className="sk sk-titulo w80" />
          <div className="sk sk-linha w95" />
          <div className="sk sk-linha w70" />
        </div>
        <div className="esqueleto-pergaminho">
          <div className="sk sk-rotulo w30" />
          {[90, 70, 95, 80, 90, 60].map((w, i) => (
            <div key={i} className="sk sk-linha" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
