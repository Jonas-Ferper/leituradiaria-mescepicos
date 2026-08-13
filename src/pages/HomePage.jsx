import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIndice, useMes } from '../lib/clp/hooks.js'
import { navegacaoDe } from '../lib/clp/data.js'
import { hojeCivil, nomeDoMesCap } from '../lib/clp/formatar.js'
import { pad2 } from '../lib/clp/validar.js'
import { CalendarioMes } from '../components/CalendarioMes.jsx'
import { VistaDia } from '../components/VistaDia.jsx'
import { EsqueletoMes } from '../components/Esqueletos.jsx'
import { Carregando } from '../components/Carregando.jsx'

export function HomePage() {
  const { pronto, falhou, recarregar, indice } = useIndice()
  const navegar = useNavigate()
  const hoje = hojeCivil()
  const metaInicial = useMemo(() => {
    if (!indice) return null
    return indice.meses.find((m) => m.valido && hoje >= m.inicio && hoje <= m.fim) || indice.meses.find((m) => m.valido) || null
  }, [indice, hoje])
  const [alvo, setAlvo] = useState(null)
  const meta = alvo || metaInicial
  const meses = useMes(meta?.ano ?? NaN, meta?.mes ?? NaN)
  const [selecionado, setSelecionado] = useState('')
  const painelRef = useRef(null)
  const estreito = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 900px)').matches : false,
  )

  useEffect(() => {
    if (meta) setSelecionado(hoje >= meta.inicio && hoje <= meta.fim ? hoje : meta.inicio)
  }, [meta?.mesChave])

  if (!pronto && !falhou) return <Carregando texto="A abrir o calendário…" />
  if (falhou) return <section className="erro-cartao"><Asterisco tamanho={26} /><h1>Não foi possível ler o calendário</h1><p>O índice de dados não pôde ser carregado.</p><button className="botao" onClick={recarregar}>Tentar novamente</button></section>
  if (!meta) return <section className="erro-cartao"><h1>Nenhum mês publicado</h1><p>A liturgia será apresentada quando os dados estiverem disponíveis.</p></section>
  if (meses.fase !== 'pronto' || !meses.data) return <EsqueletoMes meta={meta} />

  const dias = meses.data.dias
  const dia = dias.find((item) => item.dataCivil === selecionado) || dias[0]
  const nav = navegacaoDe(meta.ano, meta.mes)
  const trocarMes = (novo) => {
    if (!novo) return
    setAlvo(novo)
    if (estreito.current) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const aoSelecionar = (item) => {
    const mudou = item.dataCivil !== selecionado
    setSelecionado(item.dataCivil)
    if (mudou && estreito.current) {
      painelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="experiencia" aria-label="Calendário litúrgico">
      <header className="experiencia-intro">
        <p className="experiencia-chamada">A liturgia diária todos os dias na sua mão</p>
        <p className="experiencia-orientacao">Acesse as leituras do dia de hoje ou escolha uma data no calendário.</p>
      </header>

      <div className="experiencia-grade">
        <section className="calendario-painel" aria-label={`Calendário de ${meta.nomeMes} de ${meta.ano}`}>
          <header className="calendario-cabeca">
            <button type="button" className="controle-seta" onClick={() => trocarMes(nav.anterior)} disabled={!nav.anterior} aria-label="Mês anterior">←</button>
            <details className="seletor-meses">
              <summary>{nomeDoMesCap(meta.mes)} <span>{meta.ano}</span></summary>
              <div className="lista-meses" role="list">
                {indice.meses.filter((m) => m.valido).map((m) => (
                  <button type="button" role="listitem" key={m.mesChave} className={m.mesChave === meta.mesChave ? 'selecionado' : ''} onClick={() => trocarMes(m)}>
                    {m.nomeMes} <small>{m.ano}</small>
                  </button>
                ))}
              </div>
            </details>
            <button type="button" className="controle-seta" onClick={() => trocarMes(nav.seguinte)} disabled={!nav.seguinte} aria-label="Mês seguinte">→</button>
          </header>
          <CalendarioMes ano={meta.ano} mes={meta.mes} dias={dias} diaAtivo={dia.dataCivil} onSelect={aoSelecionar} />
          <button type="button" className="acao-hoje" onClick={() => { const h = indice.meses.find((m) => m.valido && hoje >= m.inicio && hoje <= m.fim); trocarMes(h) }}>
            <i className="hoje-ponto" aria-hidden="true" /> Ir para hoje
          </button>
        </section>

        <section className="dia-painel" aria-live="polite" ref={painelRef}>
          <VistaDia ano={meta.ano} mes={meta.mes} dia={dia} dias={dias} />
          <button type="button" className="ver-pagina" onClick={() => navegar(`/calendario/${meta.ano}/${pad2(meta.mes)}/${dia.dataCivil.slice(-2)}`)}>Abrir página deste dia →</button>
        </section>
      </div>
    </section>
  )
}
