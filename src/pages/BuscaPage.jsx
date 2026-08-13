import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIndice } from '../lib/clp/hooks.js'
import { carregarMes } from '../lib/clp/data.js'
import { corLegivel, dataCurta, normalizarTexto, nomeDoMesCap } from '../lib/clp/formatar.js'
import { pad2 } from '../lib/clp/validar.js'
import { Carregando } from '../components/Carregando.jsx'

const CAMPOS = [
  (d) => d.celebracaoPrincipal?.nome,
  (d) => d.celebracaoPrincipal?.categoriaNome,
  (d) => d.celebracaoPrincipal?.natureza,
  (d) => d.tempoLiturgicoNome,
  (d) => d.chaveCanonica,
  (d) => d.Leituras?.primeiraLeitura?.referencia,
  (d) => d.Leituras?.salmoResponsorial?.referencia,
  (d) => d.Leituras?.segundaLeitura?.referencia,
  (d) => d.Leituras?.evangelho?.referencia,
]

const MAX_RESULTADOS = 200

export function BuscaPage() {
  const { pronto, indice } = useIndice()
  const [termo, setTermo] = useState('')
  const [atuando, setAtuando] = useState('parado') // parado | percorrendo | feito
  const [progresso, setProgresso] = useState({ feito: 0, total: 0 })
  const [resultados, setResultados] = useState([])
  const [ultimaBusca, setUltimaBusca] = useState('')
  const token = useRef(0)

  useEffect(() => {
    if (pronto) window.scrollTo(0, 0)
  }, [pronto])

  async function executar(evento) {
    evento?.preventDefault()
    const busca = termo.trim()
    if (busca.length < 2 || !indice) return

    const meuToken = ++token.current
    const alvo = normalizarTexto(busca)
    const validos = indice.meses.filter((m) => m.valido)

    setUltimaBusca(busca)
    setResultados([])
    setAtuando('percorrendo')
    setProgresso({ feito: 0, total: validos.length })

    const achados = []
    for (const meta of validos) {
      if (token.current !== meuToken) return
      let dados = null
      try {
        dados = (await carregarMes(meta.ano, meta.mes)).data
      } catch {
        dados = null
      }
      if (dados) {
        for (const dia of dados.dias) {
          const coincide = CAMPOS.some((campo) => {
            const v = campo(dia)
            return !!v && normalizarTexto(v).includes(alvo)
          })
          if (coincide) achados.push({ meta, dia })
        }
      }
      setProgresso((p) => ({ ...p, feito: p.feito + 1 }))
      if (achados.length >= MAX_RESULTADOS) break
    }

    if (token.current !== meuToken) return
    setResultados(achados)
    setAtuando('feito')
  }

  const porMes = {}
  for (const { meta, dia } of resultados) {
    ;(porMes[meta.mesChave] ||= []).push({ meta, dia })
  }

  return (
    <section className="busca">
      <header className="secao-cabeca busca-cabeca">
        <p className="hero-istmo">Busca</p>
        <h1>Procurar no calendário</h1>
        <p className="secao-sub">
          {indice
            ? `Procura nas celebrações e nas referências dos ${indice.validos} ${indice.validos === 1 ? 'mês publicado' : 'meses publicados'}.`
            : ''}
        </p>
      </header>

      <form className="busca-form" onSubmit={executar} role="search">
        <label htmlFor="busca-termo" className="busca-rotulo sr-only">
          Termo a procurar
        </label>
        <input
          id="busca-termo"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="p. ex. Afonso, Assunção, Salmo 68…"
          minLength={2}
          autoComplete="off"
        />
        <button type="submit" className="botao" disabled={termo.trim().length < 2}>
          Procurar
        </button>
      </form>

      {!pronto && <Carregando texto="A preparar a busca…" />}

      {atuando === 'percorrendo' && (
        <p className="busca-progresso" role="status" aria-live="polite">
          A percorrer {progresso.feito} de {progresso.total} meses…
        </p>
      )}

      {atuando === 'feito' && resultados.length === 0 && (
        <div className="busca-vazio">
          <p>Nada encontrado para "{ultimaBusca}".</p>
          <p className="indisponivel-nota">Tente outro nome de celebração, categoria ou referência bíblica.</p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="busca-resultados">
          <p className="busca-aviso">
            {resultados.length === MAX_RESULTADOS ? `Primeiros ${MAX_RESULTADOS} resultados` : `${resultados.length} resultados`} para
            "«{ultimaBusca}»".
          </p>
          {Object.entries(porMes).map(([chave, lista]) => {
            const { meta } = lista[0]
            return (
              <div key={chave} className="busca-mes">
                <h2 className="ano-titulo">
                  <span className="ano-numero">{meta.ano}</span>
                  <span className="ano-contagem">{nomeDoMesCap(meta.mes)}</span>
                </h2>
                <ul className="busca-lista">
                  {lista.map(({ dia }) => (
                    <li key={dia.dataCivil}>
                      <Link
                        to={`/calendario/${meta.ano}/${pad2(meta.mes)}/${dia.dataCivil.slice(-2)}`}
                        className="busca-item"
                      >
                        <i className="bolha" style={{ background: corLegivel(dia.corLiturgica) }} aria-hidden="true" />
                        <span className="busca-item-data mono">{dataCurta(dia.dataCivil)}</span>
                        <strong>{dia.celebracaoPrincipal?.nome}</strong>
                        <span className="busca-item-cat mono">{dia.categoriaLiturgica}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}