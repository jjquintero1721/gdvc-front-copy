import ServiceCard from './ServiceCard'
import Button from '@/components/ui/Button'
import './ServiceGrid.css'

/**
 * Icono de estado vacío
 */
const EmptyServicesIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="service-grid__empty-icon-svg">
    <circle cx="60" cy="60" r="50" fill="#F1F5F9" />
    {/* Cruz médica */}
    <rect x="50" y="30" width="20" height="60" rx="4" fill="#CBD5E1" />
    <rect x="30" y="50" width="60" height="20" rx="4" fill="#CBD5E1" />
    <circle cx="60" cy="60" r="8" fill="#FFFFFF" opacity="0.5" />
  </svg>
)

/**
 * Componente ServiceGrid - Grid de servicios
 *
 * Características:
 * - Grid responsivo (1-3 columnas según viewport)
 * - Estado vacío profesional
 * - Header con acciones
 * - Animaciones de entrada
 *
 * @param {Array} services - Lista de servicios
 * @param {Function} onAddService - Callback para agregar servicio
 * @param {Function} onEditService - Callback para editar servicio
 * @param {Function} onViewService - Callback para ver detalles
 * @param {boolean} loading - Estado de carga
 * @param {string} emptyMessage - Mensaje personalizado de estado vacío
 */
function ServiceGrid({
  services = [],
  onAddService,
  onEditService,
  onViewService,
  loading = false,
  emptyMessage = 'No hay servicios registrados'
}) {

  if (loading) {
    return (
      <div className="service-grid__loading">
        <div className="service-grid__spinner"></div>
        <p>Cargando servicios...</p>
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="service-grid__empty">
        <EmptyServicesIcon />
        <h3 className="service-grid__empty-title">{emptyMessage}</h3>
        <p className="service-grid__empty-subtitle">
          {onAddService ? 'Agrega tu primer servicio para comenzar' : 'Aún no hay servicios en el sistema'}
        </p>
        {onAddService && (
          <Button onClick={onAddService}>
            + Registrar Servicio
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="service-grid">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEditService}
          onView={onViewService}
          showActions={!!onEditService}
        />
      ))}
    </div>
  )
}

export default ServiceGrid