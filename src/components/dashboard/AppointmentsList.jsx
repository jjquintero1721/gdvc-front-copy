import { CalendarIcon } from '@/assets/icons/DashboardIcons'
import './DashboardSections.css'

/**
 * AppointmentsList - MEJORADO
 * Muestra la lista de citas del día con diseño profesional
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja listado de citas del día
 */
function AppointmentsList() {
  // Datos mock - Estos vendrán de la API en producción
  const mockAppointments = [
    {
      id: 1,
      petName: 'Anthoine',
      ownerName: 'Juan Pérez',
      time: '2025-11-24 00:44:00',
      status: 'ATENDIDA'
    }
  ]

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const statusMap = {
      'CONFIRMADA': 'confirmed',
      'PENDIENTE': 'pending',
      'ATENDIDA': 'attended',
      'CANCELADA': 'cancelled'
    }
    return statusMap[status] || 'pending'
  }

  const getStatusLabel = (status) => {
    const labelMap = {
      'CONFIRMADA': 'Confirmada',
      'PENDIENTE': 'Pendiente',
      'ATENDIDA': 'Atendida',
      'CANCELADA': 'Cancelada'
    }
    return labelMap[status] || status
  }

  return (
    <div className="appointments-list">
      <div className="appointments-list__header">
        <h3 className="appointments-list__title">
          Citas de Hoy
          <span className="appointments-list__count">
            {mockAppointments.length}
          </span>
        </h3>
      </div>

      {mockAppointments.length === 0 ? (
        <div className="appointments-list__empty">
          <CalendarIcon className="appointments-list__empty-icon" color="#9ca3af" />
          <p className="appointments-list__empty-text">
            No hay citas programadas para hoy
          </p>
        </div>
      ) : (
        <div className="appointments-list__items">
          {mockAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-item">
              <div className="appointment-item__icon">
                <CalendarIcon />
              </div>

              <div className="appointment-item__content">
                <p className="appointment-item__name">{appointment.petName}</p>
                <p className="appointment-item__time">
                  {formatDate(appointment.time)} - {formatTime(appointment.time)}
                </p>
              </div>

              <span className={`appointment-item__status appointment-item__status--${getStatusColor(appointment.status)}`}>
                Estado: {getStatusLabel(appointment.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppointmentsList