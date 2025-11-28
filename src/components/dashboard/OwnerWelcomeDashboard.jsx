import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import dashboardService from '@/services/dashboardService'
import './OwnerWelcomeDashboard.css'

/**
 * Dashboard de Bienvenida para Propietarios
 *
 * Muestra:
 * - Saludo personalizado
 * - Mascota animada (perro/gato con animaciones)
 * - Información de próximas citas
 *
 * Animaciones:
 * - Mascota abre y cierra los ojos
 * - Saca la lengua
 * - Mueve la cola
 */
function OwnerWelcomeDashboard() {
  const { user } = useAuthStore()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para animaciones
  const [isBlinking, setIsBlinking] = useState(false)
  const [isTongueOut, setIsTongueOut] = useState(false)
  const [isTailWagging, setIsTailWagging] = useState(false)

  /**
   * Cargar estadísticas del propietario
   */
  useEffect(() => {
    loadOwnerStats()
  }, [])

  /**
   * Ciclo de animaciones aleatorias
   */
  useEffect(() => {
    // Parpadeo cada 3-5 segundos
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 200)
    }, Math.random() * 2000 + 3000)

    // Lengua fuera cada 5-8 segundos
    const tongueInterval = setInterval(() => {
      setIsTongueOut(true)
      setTimeout(() => setIsTongueOut(false), 1000)
    }, Math.random() * 3000 + 5000)

    // Cola moviéndose cada 2-4 segundos
    const tailInterval = setInterval(() => {
      setIsTailWagging(true)
      setTimeout(() => setIsTailWagging(false), 1500)
    }, Math.random() * 2000 + 2000)

    return () => {
      clearInterval(blinkInterval)
      clearInterval(tongueInterval)
      clearInterval(tailInterval)
    }
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
  const isPet = mascotaSaludo.especie === 'perro'
  const petEmoji = isPet ? '🐕' : '🐈'
  const petType = isPet ? 'perrito' : 'gatito'

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

      {/* Mascota Animada */}
      <div className="pet-animation-container">
        <div className={`animated-pet ${isPet ? 'dog' : 'cat'} ${isTailWagging ? 'wagging' : ''}`}>
          {/* Cuerpo */}
          <div className="pet-body">
            {/* Cabeza */}
            <div className="pet-head">
              {/* Orejas */}
              <div className="pet-ear pet-ear-left"></div>
              <div className="pet-ear pet-ear-right"></div>

              {/* Cara */}
              <div className="pet-face">
                {/* Ojos */}
                <div className={`pet-eye pet-eye-left ${isBlinking ? 'blinking' : ''}`}>
                  <div className="pet-pupil"></div>
                </div>
                <div className={`pet-eye pet-eye-right ${isBlinking ? 'blinking' : ''}`}>
                  <div className="pet-pupil"></div>
                </div>

                {/* Nariz */}
                <div className="pet-nose"></div>

                {/* Boca */}
                <div className="pet-mouth">
                  {isTongueOut && <div className="pet-tongue"></div>}
                </div>
              </div>
            </div>

            {/* Cola */}
            <div className={`pet-tail ${isTailWagging ? 'wagging' : ''}`}></div>
          </div>
        </div>

        <p className="pet-name">{mascotaSaludo.nombre}</p>
        <p className="pet-emoji">{petEmoji}</p>
      </div>

      {/* Información de Citas */}
      {proximasCitas && proximasCitas.length > 0 ? (
        <div className="upcoming-appointments">
          <h3>📅 Próximas Citas</h3>
          <div className="appointments-list">
            {proximasCitas.map((cita, index) => (
              <div key={index} className="appointment-card">
                <div className="appointment-icon">🩺</div>
                <div className="appointment-info">
                  <p className="appointment-pet">{cita.mascota_nombre}</p>
                  <p className="appointment-service">{cita.servicio}</p>
                  <p className="appointment-date">
                    {new Date(cita.fecha_hora).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="appointment-vet">Dr(a). {cita.veterinario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-appointments">
          <p>No tienes citas programadas próximamente</p>
          <p>¡Agenda una cita para cuidar de {mascotaSaludo.nombre}! 🏥</p>
        </div>
      )}

      {/* Información de Mascotas */}
      {stats.mascotas && stats.mascotas.length > 1 && (
        <div className="all-pets-info">
          <h3>🐾 Todas tus mascotas</h3>
          <div className="pets-grid">
            {stats.mascotas.map((mascota, index) => (
              <div key={index} className="pet-card">
                <span className="pet-icon">
                  {mascota.especie === 'perro' ? '🐕' : '🐈'}
                </span>
                <p className="pet-card-name">{mascota.nombre}</p>
                <p className="pet-card-breed">{mascota.raza || 'Mestizo'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerWelcomeDashboard