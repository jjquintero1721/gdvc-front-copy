import { CalendarIcon, UsersIcon, AlertTriangleIcon as AlertIcon, BellIcon, PawIcon } from '@/assets/icons/DashboardIcons'
import './StatCard.css'

/**
 * StatCard - Tarjeta de estadística mejorada
 *
 * @param {string} title - Título de la estadística
 * @param {number} value - Valor numérico
 * @param {string} icon - Tipo de icono (calendar, users, alert, bell, paw)
 * @param {string} color - Color del tema (blue, green, yellow, red)
 */
function StatCard({ title, value, icon, color = 'blue' }) {

  //  método estándar para seleccionar iconos
  const renderIcon = () => {
    switch (icon) {
      case 'calendar':
      case '📅':
        return <CalendarIcon />

      case 'users':
      case '👥':
        return <UsersIcon />

      case 'alert':
      case '⚠️':
        return <AlertIcon />

      case 'bell':
      case '📦':
        return <BellIcon />

      case 'paw':   // ← NUEVO
        return <PawIcon />

      default:
        return <CalendarIcon />
    }
  }

  const colorClasses = {
    blue: 'stat-card--blue',
    green: 'stat-card--green',
    yellow: 'stat-card--yellow',
    orange: 'stat-card--orange',
    red: 'stat-card--red'
  }

  const colorClass = colorClasses[color] || colorClasses.blue

  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-card__content">
        <div className="stat-card__header">
          <span className="stat-card__title">{title}</span>
        </div>
        <div className="stat-card__value">{value}</div>
      </div>

      <div className="stat-card__icon-wrapper">
        <div className="stat-card__icon-bg"></div>
        {renderIcon()}
      </div>
    </div>
  )
}

export default StatCard
