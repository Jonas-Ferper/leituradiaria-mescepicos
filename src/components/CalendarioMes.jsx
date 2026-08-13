import { Link } from 'react-router-dom'
import { DIA_SEMANA, SEMANA_ABREV, pad2 } from '../lib/clp/validar.js'
import { corLegivel, ehHoje, indexDiaSemana, nomeDoMesCap } from '../lib/clp/formatar.js'

export function CalendarioMes({ ano, mes, dias, diaAtivo, onSelect }) {
  if (!dias || dias.length === 0) return null

  const primeiro = dias[0]
  const wd = Math.max(0, DIA_SEMANA[String(primeiro.diaSemanaCivil).toLowerCase()] ?? 0)
  const deslocamento = (wd + 6) % 7

  const celulas = [...new Array(deslocamento).fill(null), ...dias]

  return (
    <div className="calendario">
      <div className="calendario-rotulos" aria-hidden="true">
        {SEMANA_ABREV.map((s, i) => (
          <span key={`${s}-${i}`}>{s}</span>
        ))}
      </div>
      <div className="calendario-grade">
        {celulas.map((dia, i) => {
          if (!dia) return <span key={`vazio-${i}`} className="calendario-buraco" aria-hidden="true" />

          const diaNumero = Number(String(dia.dataCivil).slice(-2))
          const nome = dia.celebracaoPrincipal?.nome || ''
          const ativo = diaAtivo === dia.dataCivil
          const hoje = ehHoje(dia.dataCivil)
          const domingo = indexDiaSemana(dia.diaSemanaCivil) === 0
          const solenidade = dia.categoriaLiturgica === 'SOL'
          const festa = dia.categoriaLiturgica === 'FEST'
          const rota = `/calendario/${ano}/${pad2(mes)}/${pad2(diaNumero)}`

          const conteudo = <>
              <span className="dia-numero">
                {diaNumero}
                {hoje && <i className="hoje-ponto" aria-hidden="true" />}
              </span>
              <span className="dia-nome">{nome}</span>
              <span className="dia-pis">
                <i className="bolha" style={{ background: corLegivel(dia.corLiturgica) }} title={dia.corLiturgica} aria-hidden="true" />
              </span>
            </>
          const props = {
              className: `dia${hoje ? ' hoje' : ''}${ativo ? ' ativo' : ''}${domingo ? ' domingo' : ''}${solenidade ? ' solenidade' : ''}${festa ? ' festa' : ''}`,
              'aria-label': `${diaNumero} de ${nomeDoMesCap(mes)}${domingo ? ', domingo' : ''} — ${nome}`,
              'aria-current': hoje ? 'date' : undefined,
              title: nome,
            }
          return onSelect ? (
            <button key={dia.dataCivil} type="button" {...props} onClick={() => onSelect(dia)}>
              {conteudo}
            </button>
          ) : (
            <Link
              key={dia.dataCivil}
              to={rota}
              {...props}
            >
              {conteudo}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
