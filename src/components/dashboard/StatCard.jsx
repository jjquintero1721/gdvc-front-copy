import './StatCard.css'

/**
 * Componente StatCard
 * Tarjeta de estadística reutilizable
 *
 * @param {string} title - Título de la estadística
 * @param {number} value - Valor numérico
 * @param {string} icon - Emoji o icono
 * @param {string} color - Color del tema (blue, green, yellow, red)
 * @param {function} onClick - Función opcional al hacer clic
 *
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza una tarjeta de estadística
 * - Open/Closed: Extensible mediante props sin modificar el componente
 */
function StatCard({ title, value, icon, color = 'blue', onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`stat-card stat-card--${color} ${onClick ? 'stat-card--clickable' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="stat-card__content">
        <h3 className="stat-card__title">{title}</h3>
        <p className="stat-card__value">{value}</p>
      </div>

      <div className="stat-card__icon">
        {icon}
      </div>
    </div>
  )
}

export default StatCard