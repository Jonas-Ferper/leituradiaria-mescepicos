import { corLegivel } from '../lib/clp/formatar.js'

export function SeloTempo({ tempo, cor, semana }) {
  if (!tempo) return null
  return (
    <span className="selo-tempo">
      {semana && <span className="selo-tempo-semana">{semana}</span>}
      <span className="selo-tempo-texto">{tempo}</span>
      {cor && (
        <span className="selo-tempo-cor-linha">
          <i className="bolha" style={{ background: corLegivel(cor) }} aria-hidden="true" />
          <b className="selo-tempo-cor">{cor}</b>
        </span>
      )}
    </span>
  )
}
