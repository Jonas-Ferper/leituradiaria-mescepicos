import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIndice, useMes } from '../lib/clp/hooks.js'
import { metaMes, mesesDoAno, statusMes } from '../lib/clp/data.js'
import { pad2 } from '../lib/clp/validar.js'
import { nomeDoMesCap } from '../lib/clp/formatar.js'
import { CalendarioMes } from '../components/CalendarioMes.jsx'
import { NavMes, SeletorAno } from '../components/NavMes.jsx'
import { EsqueletoMes } from '../components/Esqueletos.jsx'
import { Carregando } from '../components/Carregando.jsx'
import { PaginaIndisponivel } from '../components/PaginaIndisponivel.jsx'
import { PaginaInexistente } from './PaginaInexistente.jsx'

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

      <div className="pagmes-corpo">
        <div className="pagmes-calendario">
          <CalendarioMes ano={ano} mes={mes} dias={dias} />
        </div>
      </div>
    </section>
  )
}