import './Button.css'

/**
 * Componente Button reutilizable
 * Basado en el diseño de Figma
 *
 * @param {string} variant - Variante del botón: 'primary', 'secondary', 'outline'
 * @param {string} size - Tamaño: 'small', 'medium', 'large'
 * @param {boolean} fullWidth - Si el botón ocupa todo el ancho disponible
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {boolean} loading - Si el botón está en estado de carga
 * @param {ReactNode} children - Contenido del botón
 * @param {function} onClick - Función al hacer click
 */
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth && 'button--full-width',
    loading && 'button--loading',
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="button__spinner"></span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button