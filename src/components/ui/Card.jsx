import './Card.css'

/**
 * Componente Card
 * Tarjeta con header azul y contenido blanco basado en el diseño de Figma
 *
 * @param {ReactNode} children - Contenido de la tarjeta
 * @param {string} title - Título en el header
 * @param {string} subtitle - Subtítulo en el header
 * @param {ReactNode} headerIcon - Icono en el header
 * @param {string} width - Ancho de la tarjeta (default: '520px')
 */
function Card({
  children,
  title,
  subtitle,
  headerIcon,
  width = '520px',
  className = ''
}) {
  const cardClassNames = [
    'card',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClassNames} style={{ width }}>
      {(title || subtitle || headerIcon) && (
        <div className="card__header">
          {headerIcon && (
            <div className="card__icon">
              {headerIcon}
            </div>
          )}
          {title && <h2 className="card__title">{title}</h2>}
          {subtitle && <p className="card__subtitle body-l">{subtitle}</p>}
        </div>
      )}

      <div className="card__content">
        {children}
      </div>
    </div>
  )
}

export default Card