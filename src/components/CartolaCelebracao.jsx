export function CartolaCelebracao({ dia }) {
  const c = dia.celebracaoPrincipal || {}

  return (
    <article className="celebra">
      <p className="celebra-rotulo">Celebração do dia</p>
      <h2 className="celebra-nome">{c.nome || '—'}</h2>
      <p className="celebra-det">
        {[c.categoriaNome, c.natureza && `${c.natureza}`].filter(Boolean).join(' · ')}
      </p>
    </article>
  )
}
