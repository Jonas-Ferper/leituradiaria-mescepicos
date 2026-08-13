import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIndice, useMes } from '../lib/clp/hooks.js'
import { metaMes, mesesDoAno, statusMes } from '../lib/clp/data.js'
import { pad2 } from '../lib/clp/validar.js'
import { corDoTempo, corLegivel, dataCurta, nomeDoMesCap } from '../lib/clp/formatar.js'
import { CalendarioMes } from '../components/CalendarioMes.jsx'
import { FitaLiturgica } from '../components/FitaLiturgica.jsx'
import { NavMes, SeletorAno } from '../components/NavMes.jsx'
import { EsqueletoMes } from '../components/Esqueletos.jsx'
import { Carregando } from '../components/Carregando.jsx'
import { PaginaIndisponivel } from '../components/PaginaIndisponivel.jsx'
import { PaginaInexistente } from './PaginaInexistente.jsx'

const VAR_TEMPO = {
  Verde: 'var(--verde)',
  Roxo: 'var(--roxo)',
  Branco: 'var(--branco-lit)',
  Rosa: 'var(--rosa)',
  Vermelho: 'var(--vinho)',
  Preto: 'var(--tinta-4)',
}

export function MesPage() {
  const { ano: anoRaw, mes: mesRaw } = useParams()
  const navegar = useNavigate()
  const { pronto } = useIndice()

  const ano = Number(anoRaw)
  const mes = Number(mesRaw)
  const parametrosValidos = Number.isInteger(ano) && Number.isInteger(mes) && ano > 0 && mes >= 1 && mes <= 12

  const meses = useMes(parametrosValidos ? ano : NaN, parametrosValidos ? mes : NaN)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ano, mes])

  if (!parametrosValidos) return <PaginaInexistente />
  if (!pronto) return <Carregando texto="A abrir o mês…" />

  const estado = statusMes(ano, mes)
  if (estado !== 'disponivel') {
    return <PaginaIndisponivel motivo={estado === 'indisponivel' ? 'indisponivel' : 'ausente'} voltar="/" />
  }

  const meta = metaMes(ano, mes) || meses.meta

  if (meses.fase === 'erro') {
    return <PaginaIndisponivel motivo="indisponivel" voltar="/" />
  }

  if (!meta) return <Carregando texto="A ler as celebrações do mês…" />

  if (meses.fase !== 'pronto' || !meses.data) {
    return (
      <section className="pagmes">
        <div className="barra">
          <div className="barra-eq">
            <SeletorAno
              ano={ano}
              aoEscolher={(a) => {
                const primeiro = mesesDoAno(a)[0] || mesesDoAno(a, { todos: true })[0]
                navegar(primeiro ? `/calendario/${a}/${pad2(primeiro.mes)}` : `/calendario/${a}/01`)
              }}
            />
          </div>
          <NavMes ano={ano} mes={mes} />
        </div>
        <EsqueletoMes meta={meta} />
      </section>
    )
  }

  const dias = meses.data.dias
  const cores = [...new Set(dias.map((d) => d.corLiturgica).filter(Boolean))]

  return (
    <section className="pagmes">
      <div className="barra">
        <div className="barra-eq">
          <SeletorAno
            ano={ano}
            aoEscolher={(a) => {
              const primeiro = mesesDoAno(a)[0] || mesesDoAno(a, { todos: true })[0]
              navegar(primeiro ? `/calendario/${a}/${pad2(primeiro.mes)}` : `/calendario/${a}/01`)
            }}
          />
        </div>
        <NavMes ano={ano} mes={mes} />
      </div>

      <header className="pagmes-cabeca">
        <h1>
          {nomeDoMesCap(mes)} <small>{ano}</small>
        </h1>
        {meta?.tempo && <p className="pagmes-tempo">{meta.tempo}</p>}
      </header>

      <FitaLiturgica dias={dias} />

      <div className="pagmes-corpo">
        <div className="pagmes-calendario">
          <CalendarioMes ano={ano} mes={mes} dias={dias} />
        </div>

        <aside className="painel" aria-label="Informação do mês">
          <dl>
            <div>
              <dt>Tempo litúrgico predominante</dt>
              <dd>
                <i className="bolha" style={{ background: VAR_TEMPO[corDoTempo(meta?.tempo)] }} aria-hidden="true" />
                {meta?.tempo || '—'}
              </dd>
            </div>
            <div>
              <dt>Período</dt>
              <dd>
                {dataCurta(meta?.inicio)} — {dataCurta(meta?.fim)}
              </dd>
            </div>
            <div>
              <dt>Dias</dt>
              <dd>
                {meta?.totalDias} · {meta?.domingosNoMes || 0} domingos · {meta?.comLeituras || 0} com leituras
              </dd>
            </div>
          </dl>

          <h3 className="painel-titulo">Cores do mês</h3>
          <ul className="legenda">
            {cores.map((c) => (
              <li key={c}>
                <i className="bolha" style={{ background: corLegivel(c) }} aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>

          <p className="painel-nota">
            A fita acima mostra a sequência dos tempos litúrgicos deste mês; cada quadrado é um dia.
          </p>
        </aside>
      </div>
    </section>
  )
}