const ORDEM = [
  ['primeiraLeitura', 'Primeira leitura'],
  ['salmoResponsorial', 'Salmo responsorial'],
  ['segundaLeitura', 'Segunda leitura'],
  ['aclamacaoEvangelho', 'Aclamação ao Evangelho'],
  ['evangelho', 'Evangelho'],
]

function textoComVersiculos(texto) {
  return String(texto)
    .split('\n')
    .map((linha, indice) => {
      const correspondencia = linha.match(/^(\s*)(\d+[a-z]?(?:[-–]\d+[a-z]?)?)(\s+)(.*)$/i)
      const conteudo = correspondencia ? (
        <>
          {correspondencia[1]}
          <span className="versiculo">{correspondencia[2]}</span>
          {correspondencia[3]}
          {correspondencia[4]}
        </>
      ) : linha

      return (
        <span key={`${indice}-${linha}`}>
          {conteudo}
          {indice < String(texto).split('\n').length - 1 && '\n'}
        </span>
      )
    })
}

export function Lecionario({ leituras }) {
  if (!leituras || typeof leituras !== 'object') return null

  const papeis = ORDEM.filter(([chave]) => {
    const lt = leituras[chave]
    return lt && typeof lt === 'object' && (lt.texto || lt.referencia)
  })

  if (papeis.length === 0) return null

  return (
    <section className="lecionario" aria-label="Leituras da celebração">
      <header className="lecionario-cabeca">
        <h2>Leituras</h2>
        <span className="lecionario-nota">Momento do dia</span>
      </header>
      {papeis.map(([chave, rotulo]) => {
        const lt = leituras[chave]
        const ehEvangelho = chave === 'evangelho'
        return (
          <details key={chave} className={`leitura${ehEvangelho ? ' leitura-evangelho' : ''}`}>
            <summary><span className="leitura-rotulo">{rotulo}</span>{lt.referencia && <span className="leitura-ref">{lt.referencia}</span>}</summary>
            {lt.texto && <div className="leitura-texto">{textoComVersiculos(lt.texto)}</div>}
          </details>
        )
      })}
    </section>
  )
}
