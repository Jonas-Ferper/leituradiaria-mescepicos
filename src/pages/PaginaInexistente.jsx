import { Link } from 'react-router-dom'
import { Asterisco } from '../components/Asterisco.jsx'

export function PaginaInexistente() {
  return (
    <section className="indisponivel">
      <span className="istmo" aria-hidden="true" />
      <div className="indisponivel-caixa">
        <Asterisco tamanho={26} />
        <h1>Esta página não está no calendário</h1>
        <p>O endereço que procurou não corresponde a nenhuma celebração ou mês do calendário.</p>
        <p className="indisponivel-nota">Confira o endereço ou recomece pela página inicial.</p>
        <Link className="botao" to="/">
          Voltar ao início
        </Link>
      </div>
    </section>
  )
}