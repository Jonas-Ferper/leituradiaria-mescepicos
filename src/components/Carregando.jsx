export function Carregando({ texto = 'A preparar o calendário…' }) {
  return (
    <p className="carregando" role="status">
      <i className="carregando-espiral" aria-hidden="true" />
      {texto}
    </p>
  )
}