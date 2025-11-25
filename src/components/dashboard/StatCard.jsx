import { CalendarIcon, UsersIcon, AlertTriangleIcon, BellIcon } from '@/assets/icons/DashboardIcons'
import './StatCard.css'

/**
 * StatCard - Tarjeta de estadística mejorada
 * Diseño profesional con iconos SVG y animaciones sutiles
 *
 * @param {string} title - Título de la estadística
 * @param {number} value - Valor numérico
 * @param {string} icon - Tipo de icono (calendar, users, alert, bell)
 * @param {string} color - Color del tema (blue, green, yellow, red)
 */
function StatCard({ title, value, icon, color = 'blue' }) {
  // Mapeo de iconos
  const iconMap = {
    calendar: CalendarIcon,
    users: UsersIcon,
    alert: AlertTriangleIcon,
    bell: BellIcon
  }

  // Mapeo de colores a clases CSS
  const colorClasses = {
    blue: 'stat-card--blue',
    green: 'stat-card--green',
    yellow: 'stat-card--yellow',
    orange: 'stat-card--orange',
    red: 'stat-card--red'
  }

  // Determinar el icono a usar (soporta tanto string como el formato antiguo de emoji)
  let IconComponent
  if (icon === '📅') {
    IconComponent = CalendarIcon
  } else if (icon === '👥') {
    IconComponent = UsersIcon
  } else if (icon === '⚠️') {
    IconComponent = AlertTriangleIcon
  } else if (icon === '📦' || icon === 'bell') {
    IconComponent = BellIcon
  } else {
    IconComponent = iconMap[icon] || CalendarIcon
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
        <IconComponent className="stat-card__icon" />
      </div>
    </div>
  )
}

export default StatCard