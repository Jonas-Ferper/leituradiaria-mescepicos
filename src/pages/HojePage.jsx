import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIndice, useMes } from '../lib/clp/hooks.js'
import { metaMes } from '../lib/clp/data.js'
import { pad2 } from '../lib/clp/validar.js'
import { hojeCivil, dataPorExtenso, nomeDoMesCap } from '../lib/clp/formatar.js'
import { FitaLiturgica } from '../components/FitaLiturgica.jsx'
import { VistaDia } from '../components/VistaDia.jsx'
import { EsqueletoDia } from '../components/Esqueletos.jsx'
import { Carregando } from '../components/Carregando.jsx'
import { Asterisco } from '../components/Asterisco.jsx'

export function HojePage() {
  const { pronto } = useIndice()
  const hoje = hojeCivil()
  const [ano, mes, dia] = hoje.split('-').map(Number)

  const meses = useMes(ano, mes)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!pronto) return <Carregando texto="A procurar a liturgia de hoje…" />

  const meta = metaMes(ano, mes)

  if (!meta || !meta.valido) {
    return (
      <section className="hoje-indisponivel">
        <p className="hero-istmo">
          <Asterisco tamanho={13} /> Hoje
        </p>
        <h1>{dataPorExtenso(hoje)}</h1>
        <p>
          Os dados deste período ainda não foram disponibilizados no Calendário Litúrgico Perpétuo.
        </p>
        <p className="indisponivel-nota">
          Quando o mês de {nomeDoMesCap(mes)} de {ano} for publicado, a liturgia de hoje aparecerá aqui
          automaticamente.
        </p>
        <Link className="botao" to="/calendario">
          Abrir o calendário
        </Link>
      </section>
    )
  }

  if (meses.fase === 'erro') {
    return (
      <section className="hoje-indisponivel">
        <p className="hero-istmo">
          <Asterisco tamanho={13} /> Hoje
        </p>
        <h1>{dataPorExtenso(hoje)}</h1>
        <p>O ficheiro deste mês contém erros de dados e a liturgia de hoje não pode ser apresentada.</p>
        <p className="indisponivel-nota">
          Os restantes meses do calendário continuam disponíveis normalmente.
        </p>
        <Link className="botao" to="/calendario">
          Abrir o calendário
        </Link>
      </section>
    )
  }

  if (meses.fase !== 'pronto' || !meses.data) {
    return (
      <section className="pagmes pagdia">
        <header className="pagmes-cabeca pagmes-cabeca-hoje">
          <p className="hero-istmo">
            <Asterisco tamanho={13} /> Hoje
          </p>
          <h1 className="pagmes-cabeca-mes">{dataPorExtenso(hoje)}</h1>
        </header>
        <EsqueletoDia />
      </section>
    )
  }

  const dias = meses.data.dias
  const diaObj = dias.find((d) => d.dataCivil === hoje)

  if (!diaObj) {
    return (
      <section className="hoje-indisponivel">
        <p className="hero-istmo">
          <Asterisco tamanho={13} /> Hoje
        </p>
        <h1>{dataPorExtenso(hoje)}</h1>
        <p>O mês está disponível, mas não contém registos para o dia de hoje.</p>
        <Link className="botao" to={`/calendario/${ano}/${pad2(mes)}`}>
          Ver o calendário de {nomeDoMesCap(mes)}
        </Link>
      </section>
    )
  }

  return (
    <section className="pagmes pagdia">
      <header className="pagmes-cabeca pagmes-cabeca-hoje">
        <p className="hero-istmo">
          <Asterisco tamanho={13} /> Hoje
        </p>
        <h1 className="pagmes-cabeca-mes">
          {dataPorExtenso(hoje)}
        </h1>
      </header>

      <FitaLiturgica dias={dias} marco={hoje} />

      <VistaDia ano={ano} mes={mes} dia={diaObj} dias={dias} />

      <p className="secao-nota">
        Também pode ver este dia na sua página própria:{' '}
        <Link to={`/calendario/${ano}/${pad2(mes)}/${pad2(dia)}`}>
          /calendario/{ano}/{pad2(mes)}/{pad2(dia)}
        </Link>
      </p>
    </section>
  )
}