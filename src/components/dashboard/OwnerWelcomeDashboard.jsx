import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import dashboardService from '@/services/dashboardService'
import './OwnerWelcomeDashboard.css'

/**
 * Dashboard de Bienvenida para Propietarios - VERSIÓN PREMIUM
 *
 * Muestra:
 * - Saludo personalizado
 * - Mascota 2D premium con diseño flat profesional
 * - Información de próximas citas
 * - Lista de todas las mascotas
 *
 * Características Premium:
 * - Diseño flat design de alta calidad
 * - Animaciones fluidas y profesionales
 * - Mascota que sigue el cursor
 * - UI moderna y atractiva
 */
function OwnerWelcomeDashboard() {
  const { user } = useAuthStore()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Cargar estadísticas del propietario
   */
  useEffect(() => {
    loadOwnerStats()
  }, [])

  const loadOwnerStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dashboardService.getStats()
      console.log('📊 Estadísticas del propietario:', data)

      setStats(data.stats)

    } catch (err) {
      console.error('❌ Error al cargar estadísticas:', err)
      setError(err.message || 'Error al cargar tus datos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="owner-welcome">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tu información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="owner-welcome">
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={loadOwnerStats} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats || !stats.mascotaSaludo) {
    return (
      <div className="owner-welcome">
        <div className="no-pets-container">
          <h2>¡Bienvenido, {user?.nombre}!</h2>
          <p>Aún no tienes mascotas registradas.</p>
          <p>Visita la sección de Mascotas para registrar a tu compañero peludo 🐾</p>
        </div>
      </div>
    )
  }

  const { mascotaSaludo, proximasCitas } = stats
  const petType = mascotaSaludo.especie === 'perro' ? 'dog' : 'cat'

  return (
    <div className="owner-welcome">
      {/* Saludo Principal */}
      <div className="welcome-header">
        <h1 className="welcome-title">
          ¡Hola, {user?.nombre}! 👋
        </h1>
        <p className="welcome-subtitle">
          ¿Cómo ha estado {mascotaSaludo.nombre}?
        </p>
      </div>
        

      {/* Información de Citas */}
      {proximasCitas && proximasCitas.length > 0 ? (
        <div className="upcoming-appointments">
          <h3 className="upcoming-appointments__title">
            📅 Próximas Citas
          </h3>
          <div className="appointments-list">
            {proximasCitas.map((cita, index) => (
              <div
                key={index}
                className="appointment-card"
                style={{ '--card-index': index }}
              >
                <div className="appointment-card__icon">🩺</div>
                <div className="appointment-card__content">
                  <p className="appointment-card__pet">{cita.mascota_nombre}</p>
                  <p className="appointment-card__service">{cita.servicio}</p>
                  <p className="appointment-card__date">
                    {new Date(cita.fecha_hora).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="appointment-card__vet">Dr(a). {cita.veterinario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-appointments">
          <div className="no-appointments__icon">📅</div>
          <p className="no-appointments__title">
            No tienes citas programadas próximamente
          </p>
          <p className="no-appointments__subtitle">
            ¡Agenda una cita para cuidar de {mascotaSaludo.nombre}! 🏥
          </p>
        </div>
      )}

      {/* Información de Mascotas */}
      {stats.mascotas && stats.mascotas.length > 1 && (
        <div className="all-pets-section">
          <h3 className="all-pets-section__title">🐾 Todas tus mascotas</h3>
          <div className="pets-grid">
            {stats.mascotas.map((mascota, index) => (
              <div
                key={index}
                className="pet-card"
                style={{ '--card-index': index }}
              >
                <span className="pet-card__icon">
                  {mascota.especie === 'perro' ? '🐕' : '🐈'}
                </span>
                <p className="pet-card__name">{mascota.nombre}</p>
                <p className="pet-card__breed">{mascota.raza || 'Mestizo'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerWelcomeDashboard