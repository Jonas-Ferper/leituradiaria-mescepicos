import { corDoTempo, corLegivel } from '../lib/clp/formatar.js'

const COR_VAR = {
  Verde: 'var(--verde)',
  Roxo: 'var(--roxo)',
  Branco: 'var(--branco-lit)',
  Rosa: 'var(--rosa)',
  Vermelho: 'var(--vinho)',
  Preto: 'var(--tinta-4)',
}

export function SeloTempo({ tempo, cor }) {
  if (!tempo) return null
  return (
    <span className="selo-tempo">
      <i
        className="bolha"
        style={{ background: COR_VAR[corDoTempo(tempo)] || corLegivel(cor) }}
        aria-hidden="true"
      />
      <span className="selo-tempo-texto">{tempo}</span>
      {cor && cor.toLowerCase() !== corDoTempo(tempo).toLowerCase() && <b className="selo-tempo-cor">{cor}</b>}
    </span>
  )
}
