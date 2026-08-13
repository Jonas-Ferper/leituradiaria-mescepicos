import { Link } from 'react-router-dom'

const CONTEUDO = {
  ausente: {
    titulo: 'Calendário ainda não disponível',
    corpo: 'Os dados deste mês ainda não foram disponibilizados no sistema.',
    nota: 'Quando o ficheiro correspondente for publicado, este mês passa a aparecer aqui automaticamente.',
  },
  indisponivel: {
    titulo: 'Mês indisponível por erro de dados',
    corpo: 'O ficheiro deste mês contém erros e não pode ser apresentado.',
    nota: 'Os restantes meses do calendário continuam disponíveis normalmente.',
  },
  dia: {
    titulo: 'Este dia não está no mês publicado',
    corpo: 'O mês está disponível, mas não contém registos para este dia.',
    nota: 'Confira o dia na página do calendário do mês.',
  },
}

export function PaginaIndisponivel({ motivo = 'ausente', voltar = '/' }) {
  const c = CONTEUDO[motivo] || CONTEUDO.ausente
  return (
    <section className="indisponivel">
      <span className="istmo" aria-hidden="true" />
      <div className="indisponivel-caixa">
        <h1>{c.titulo}</h1>
        <p>{c.corpo}</p>
        <p className="indisponivel-nota">{c.nota}</p>
        <Link className="botao" to={voltar}>
          Para o calendário disponível
        </Link>
      </div>
    </section>
  )
}