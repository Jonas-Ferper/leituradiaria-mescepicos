const ORDEM = [
  ['primeiraLeitura', 'Primeira leitura'],
  ['salmoResponsorial', 'Salmo responsorial'],
  ['segundaLeitura', 'Segunda leitura'],
  ['aclamacaoEvangelho', 'Aclamação ao Evangelho'],
  ['evangelho', 'Evangelho'],
]

function classeDeLinha(texto) {
  const t = String(texto).trim()
  if (!t) return 'leitura-linha'
  if (/^(leitura|proclamação|salmo responsorial|aclamação)/i.test(t)) return 'leitura-rubrica'
  if (/^palavra do senhor\.?$|^palavra da salvação\.?$/i.test(t)) return 'leitura-rubrica'
  if (/^[rv]\.?\s/i.test(t)) return 'leitura-resposta'
  return 'leitura-linha'
}

function textoComVersiculos(texto) {
  const linhas = String(texto)
    .split('\n')
    .map((l) => l.trim())

  const blocos = []
  let numeroPendente = null

  for (const linha of linhas) {
    const m = linha.match(/^(\d+[a-z]?(?:[-–]\d+[a-z]?)?)(?:\s+(.*)|$)/i)
    if (m) {
      const resto = (m[2] || '').trim()
      if (!resto) {
        numeroPendente = m[1]
        continue
      }
      blocos.push({ numero: m[1], texto: resto })
      continue
    }

    if (numeroPendente) {
      blocos.push({ numero: numeroPendente, texto: linha })
      numeroPendente = null
      continue
    }

    blocos.push({ numero: null, texto: linha })
  }

  return blocos.map((b, i) => {
    const classe = classeDeLinha(b.texto)
    return (
      <span key={i} className={classe}>
        {b.numero ? (
          <>
            <span className="versiculo">{b.numero}</span> {b.texto}
          </>
        ) : (
          b.texto
        )}
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
      </header>
      {papeis.map(([chave, rotulo]) => {
        const lt = leituras[chave]
        const ehEvangelho = chave === 'evangelho'
        return (
          <details key={chave} className={`leitura${ehEvangelho ? ' leitura-evangelho' : ''}`}>
            <summary>
              <span className="leitura-rotulo">{rotulo}</span>
              {lt.referencia && <span className="leitura-ref">{lt.referencia}</span>}
            </summary>
            {lt.texto && <div className="leitura-texto">{textoComVersiculos(lt.texto)}</div>}
          </details>
        )
      })}
    </section>
  )
}
