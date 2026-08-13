import { corDoTempo } from '../lib/clp/formatar.js'

const COR_POR_TEMPO_LITURGICO = {
  Verde: 'var(--verde)',
  Roxo: 'var(--roxo)',
  Branco: 'var(--branco-lit)',
  Rosa: 'var(--rosa)',
  Vermelho: 'var(--vinho)',
  Preto: 'var(--tinta-4)',
}

export function FitaLiturgica({ dias, marco }) {
  if (!dias || dias.length === 0) return null

  const tempos = [...new Set(dias.map((d) => d.tempoLiturgicoNome).filter(Boolean))]

  return (
    <div className="fita">
      <div className="fita-tira" role="img" aria-label="Sequência dos tempos litúrgicos deste mês">
        {dias.map((d) => (
          <span
            key={d.dataCivil}
            className={`fita-celula${marco === d.dataCivil ? ' fita-hoje' : ''}`}
            style={{ background: COR_POR_TEMPO_LITURGICO[corDoTempo(d.tempoLiturgicoNome)] }}
            title={d.tempoLiturgicoNome}
          />
        ))}
      </div>
      <div className="fita-legenda">
        {tempos.map((t) => (
          <span key={t} className="fita-item">
            <i style={{ background: COR_POR_TEMPO_LITURGICO[corDoTempo(t)] }} />
            {t}
          </span>
        ))}
        {marco && <span className="fita-posicao">· hoje</span>}
      </div>
    </div>
  )
}