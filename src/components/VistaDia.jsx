import { diaDaSemana, nomeDoMesCap } from '../lib/clp/formatar.js'
import { diaAnterior, diaSeguinte } from '../lib/clp/nav.js'
import { CartolaCelebracao } from './CartolaCelebracao.jsx'
import { Lecionario } from './Lecionario.jsx'
import { NavDia } from './NavMes.jsx'
import { SeloTempo } from './SeloTempo.jsx'

export function VistaDia({ ano, mes, dia, dias }) {
  const [a, m, d] = String(dia.dataCivil).split('-').map(Number)

  return (
    <article className="pagdia">
      <header className="pagdia-cabeca">
        <div className="dia-contexto">
          <span>{diaDaSemana(dia.diaSemanaCivil)}</span>
          <span>Semana litúrgica {dia.semanaLiturgica}</span>
        </div>
        <div className="dia-identidade">
          <h1 className="pagdia-data" aria-label={`${d} de ${nomeDoMesCap(m)} de ${a}`}>
            <span className="pagdia-dia">{d}</span>
            <span className="pagdia-resto">
              <strong>{nomeDoMesCap(m)}</strong>
              <small>{a}</small>
            </span>
          </h1>
          <div className="tempo-contexto">
            <span className="tempo-rotulo">Tempo litúrgico</span>
            <SeloTempo tempo={dia.tempoLiturgicoNome} cor={dia.corLiturgica} />
          </div>
        </div>
      </header>

      <div className="pagdia-corpo">
        <div className="pagdia-principal">
          <CartolaCelebracao dia={dia} />
        </div>
        <div className="pagdia-leituras">
          <Lecionario leituras={dia.Leituras} />
        </div>
      </div>

      <NavDia anterior={diaAnterior(ano, mes, d, dias)} seguinte={diaSeguinte(ano, mes, d, dias)} />
    </article>
  )
}
