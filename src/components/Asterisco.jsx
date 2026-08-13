export function Asterisco({ tamanho = 16, className = '' }) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.5L14.2 9.8 21.5 12l-7.3 2.2L12 21.5 9.8 14.2 2.5 12l7.3-2.2Z"
        fill="currentColor"
      />
    </svg>
  )
}