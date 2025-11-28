import { useState, useEffect } from 'react'
import dashboardService from '@/services/dashboardService'
import './DashboardSections.css'

/**
 * AppointmentsList - CON DATOS REALES
 * Muestra las citas del día desde el backend
 */
function AppointmentsList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dashboardService.getStats()

      // Obtener las citas del detalle
      const citasDetalle = data.stats?.citasDetalle || []
      setAppointments(citasDetalle)

    } catch (err) {
      console.error('❌ Error al cargar citas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">
          Citas de Hoy
          <span className="badge badge-primary">{appointments.length}</span>
        </h2>
      </div>

      <div className="section-content">
        {loading ? (
          <div className="section-loading">
            <div className="spinner-small"></div>
            <p>Cargando citas...</p>
          </div>
        ) : error ? (
          <div className="section-error">
            <p>⚠️ {error}</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="section-empty">
            <div className="empty-icon">✓</div>
            <p className="empty-message">No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="appointments-list-container">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-avatar">
                  {appointment.mascota_nombre?.charAt(0) || 'M'}
                </div>
                <div className="appointment-info">
                  <p className="appointment-name">{appointment.mascota_nombre}</p>
                  <p className="appointment-time">
                    {new Date(appointment.fecha_hora).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="appointment-status">
                  <span className={`status-badge status-${appointment.estado?.toLowerCase()}`}>
                    {appointment.estado || 'AGENDADA'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentsList