import {
  TRIAGE_PRIORITY_LABELS,
  TRIAGE_PRIORITY_COLORS,
  TRIAGE_PRIORITY_ICONS
} from '@/utils/triageConstants'
import './PriorityBadge.css'

/**
 * Componente PriorityBadge
 * Muestra un badge con color según la prioridad del triage
 *
 * @param {string} priority - Prioridad del triage (urgente, alta, media, baja)
 * @param {boolean} showIcon - Mostrar icono junto al texto
 * @param {string} size - Tamaño del badge (small, medium, large)
 */
function PriorityBadge({ priority, showIcon = true, size = 'medium' }) {
  const label = TRIAGE_PRIORITY_LABELS[priority] || priority
  const color = TRIAGE_PRIORITY_COLORS[priority] || '#6B7280'
  const icon = TRIAGE_PRIORITY_ICONS[priority] || ''

  const badgeClassNames = [
    'priority-badge',
    `priority-badge--${size}`,
    `priority-badge--${priority}`
  ].filter(Boolean).join(' ')

  return (
    <span
      className={badgeClassNames}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1.5px solid ${color}`
      }}
    >
      {showIcon && <span className="priority-badge__icon">{icon}</span>}
      <span className="priority-badge__label">{label}</span>
    </span>
  )
}

export default PriorityBadge