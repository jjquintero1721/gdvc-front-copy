import './AppointmentsList.css'

/**
 * Componente AppointmentsList
 * Muestra la lista de citas del día
 *
 * Datos mock por ahora - En producción se conectarán a endpoints reales
 *
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza lista de citas
 */
function AppointmentsList() {
  // Datos mock - Estos vendrán de la API en producción
  const mockAppointments = [
    {
      id: 1,
      petName: 'Anthoine',
      dateTime: '2025-11-24 00:44:00',
      status: 'ATENDIDA',
      statusColor: 'success'
    }
  ]

  const getStatusBadgeClass = (statusColor) => {
    return `appointments-list__status appointments-list__status--${statusColor}`
  }

  if (mockAppointments.length === 0) {
    return (
      <div className="appointments-list">
        <h3 className="appointments-list__title">Citas de Hoy</h3>
        <div className="appointments-list__empty">
          <p>No hay citas programadas para hoy</p>
        </div>
      </div>
    )
  }

  return (
    <div className="appointments-list">
      <h3 className="appointments-list__title">Citas de Hoy</h3>

      <div className="appointments-list__content">
        {mockAppointments.map((appointment) => (
          <div key={appointment.id} className="appointments-list__item">
            <div className="appointments-list__item-content">
              <h4 className="appointments-list__pet-name">{appointment.petName}</h4>
              <p className="appointments-list__datetime">{appointment.dateTime}</p>
              <span className={getStatusBadgeClass(appointment.statusColor)}>
                Estado: {appointment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AppointmentsList