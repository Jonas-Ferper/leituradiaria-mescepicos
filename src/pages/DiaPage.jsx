import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIndice, useMes } from '../lib/clp/hooks.js'
import { statusMes, mesesDoAno } from '../lib/clp/data.js'
import { diaKey, pad2 } from '../lib/clp/validar.js'
import { nomeDoMesCap } from '../lib/clp/formatar.js'
import { NavMes, SeletorAno } from '../components/NavMes.jsx'
import { VistaDia } from '../components/VistaDia.jsx'
import { EsqueletoDia } from '../components/Esqueletos.jsx'
import { Carregando } from '../components/Carregando.jsx'
import { PaginaIndisponivel } from '../components/PaginaIndisponivel.jsx'
import { PaginaInexistente } from './PaginaInexistente.jsx'

export function DiaPage() {
  const { ano: anoRaw, mes: mesRaw, dia: diaRaw } = useParams()
  const navegar = useNavigate()
  const { pronto } = useIndice()

  const ano = Number(anoRaw)
  const mes = Number(mesRaw)
  const dia = Number(diaRaw)
  const parametrosValidos =
    Number.isInteger(ano) && ano > 0 && Number.isInteger(mes) && mes >= 1 && mes <= 12 && Number.isInteger(dia) && dia >= 1 && dia <= 31

  const meses = useMes(parametrosValidos ? ano : NaN, parametrosValidos ? mes : NaN)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ano, mes, dia])

  if (!parametrosValidos) return <PaginaInexistente />
  if (!pronto) return <Carregando texto="A abrir o dia…" />

  const estado = statusMes(ano, mes)
  if (estado !== 'disponivel') {
    return <PaginaIndisponivel motivo={estado === 'indisponivel' ? 'indisponivel' : 'ausente'} voltar="/" />
  }

  if (meses.fase === 'erro') {
    return <PaginaIndisponivel motivo="indisponivel" voltar="/" />
  }

  if (meses.fase !== 'pronto' || !meses.data) {
    return (
      <section className="pagmes pagdia">
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
        <EsqueletoDia />
      </section>
    )
  }

  const dias = meses.data.dias
  const diaObj = dias.find((d) => d.dataCivil === diaKey(ano, mes, dia))
  if (!diaObj) {
    return (
      <PaginaIndisponivel motivo="dia" voltar={`/calendario/${ano}/${pad2(mes)}`} />
    )
  }

  return (
    <section className="pagmes pagdia">
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
        <h1 className="pagmes-cabeca-mes">
          {nomeDoMesCap(mes)} <small>{ano}</small>
        </h1>
      </header>

      <VistaDia ano={ano} mes={mes} dia={diaObj} dias={dias} />
    </section>
  )
}