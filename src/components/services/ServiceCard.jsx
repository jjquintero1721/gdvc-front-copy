import { Power, PowerOff, Edit } from 'lucide-react'
import './ServiceCard.css'

/**
 * Icono de servicio médico
 */
const ServiceIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="service-card__icon-svg">
    <circle cx="60" cy="60" r="50" fill="#EFF6FF" />
    {/* Icono de cruz médica */}
    <rect x="50" y="30" width="20" height="60" rx="4" fill="#3B82F6" />
    <rect x="30" y="50" width="60" height="20" rx="4" fill="#3B82F6" />
    {/* Detalles adicionales */}
    <circle cx="60" cy="60" r="8" fill="#FFFFFF" opacity="0.3" />
  </svg>
)

/**
 * Icono de reloj para duración
 */
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

/**
 * Icono de dinero para costo
 */
const MoneyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

/**
 * Componente ServiceCard - Tarjeta de servicio
 *
 * Características:
 * - Diseño profesional con animaciones
 * - Iconos informativos
 * - Información organizada jerárquicamente
 * - Badge de estado
 * - Botones de editar y activar/desactivar
 *
 * @param {Object} service - Datos del servicio
 * @param {Function} onEdit - Callback para editar servicio
 * @param {Function} onView - Callback para ver detalles
 * @param {Function} onToggleStatus - Callback para activar/desactivar servicio
 * @param {boolean} showActions - Mostrar botones de acción
 */
function ServiceCard({ service, onEdit, onView, onToggleStatus, showActions = true }) {

  /**
   * Formatear costo a moneda colombiana
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Formatear duración
   */
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <div
      className={`service-card ${!service.activo ? 'service-card--inactive' : ''}`}
      onClick={onView ? () => onView(service) : undefined}
    >
      {/* Icono del servicio */}
      <div className="service-card__icon">
        <ServiceIcon />
      </div>

      {/* Header con nombre y estado */}
      <div className="service-card__header">
        <h3 className="service-card__name">{service.nombre}</h3>
        <span className={`service-card__status ${service.activo ? 'service-card__status--active' : 'service-card__status--inactive'}`}>
          {service.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Descripción */}
      {service.descripcion && (
        <p className="service-card__description">
          {service.descripcion.length > 100
            ? `${service.descripcion.substring(0, 100)}...`
            : service.descripcion
          }
        </p>
      )}

      {/* Información del servicio */}
      <div className="service-card__info">
        <div className="service-card__info-item">
          <div className="service-card__info-icon">
            <ClockIcon />
          </div>
          <div className="service-card__info-content">
            <span className="service-card__info-label">Duración</span>
            <span className="service-card__info-value">{formatDuration(service.duracion_minutos)}</span>
          </div>
        </div>

        <div className="service-card__info-item">
          <div className="service-card__info-icon">
            <MoneyIcon />
          </div>
          <div className="service-card__info-content">
            <span className="service-card__info-label">Costo</span>
            <span className="service-card__info-value">{formatCurrency(service.costo)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      {showActions && onEdit && (
        <div className="service-card__actions">
          {/* Botón de editar */}
          <button
            className="service-card__action-btn service-card__action-btn--edit"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(service)
            }}
            title="Editar servicio"
          >
            <Edit size={16} />
            <span>Editar</span>
          </button>

          {/* Botón de activar/desactivar */}
          {onToggleStatus && (
            <button
              className={`service-card__action-btn ${
                service.activo 
                  ? 'service-card__action-btn--deactivate' 
                  : 'service-card__action-btn--activate'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleStatus(service)
              }}
              title={service.activo ? 'Desactivar servicio' : 'Activar servicio'}
            >
              {service.activo ? <PowerOff size={16} /> : <Power size={16} />}
              <span>{service.activo ? 'Desactivar' : 'Activar'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ServiceCard