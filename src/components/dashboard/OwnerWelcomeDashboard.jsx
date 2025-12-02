import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import dashboardService from '@/services/dashboardService'
import {
  Calendar,
  Clock,
  Heart,
  PawPrint,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  MapPin
} from 'lucide-react'
import './OwnerWelcomeDashboard.css'

/**
 * Dashboard Mejorado para Propietarios
 *
 * Características:
 * - Layout compacto de 2 columnas
 * - Avatares realistas de perros y gatos
 * - Información completa en citas (motivo, veterinario)
 * - Diseño visual atractivo para fidelización
 *
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza el dashboard del propietario
 * - Open/Closed: Fácil agregar nuevas secciones
 */
function OwnerWelcomeDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Obtener emoji según la especie
   */
  const getPetEmoji = (especie) => {
    const cleanEspecie = especie?.toLowerCase() || 'perro'

    if (cleanEspecie.includes('perro') || cleanEspecie.includes('dog')) {
      return '🐶'
    } else if (cleanEspecie.includes('gato') || cleanEspecie.includes('cat')) {
      return '🐱'
    } else {
      return '🐾'
    }
  }

  /**
   * Obtener color de fondo según especie
   */
  const getPetColor = (especie) => {
    const cleanEspecie = especie?.toLowerCase() || 'perro'

    if (cleanEspecie.includes('perro') || cleanEspecie.includes('dog')) {
      return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' // Azul
    } else if (cleanEspecie.includes('gato') || cleanEspecie.includes('cat')) {
      return 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' // Rosa
    } else {
      return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' // Púrpura
    }
  }

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

  /**
   * Calcular próxima cita
   */
  const getProximaCita = () => {
    if (!stats?.proximasCitas || stats.proximasCitas.length === 0) {
      return null
    }
    return stats.proximasCitas[0]
  }

  /**
   * Formatear fecha de forma amigable
   */
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const opciones = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return fecha.toLocaleDateString('es-ES', opciones)
  }

  /**
   * Calcular días hasta la próxima cita
   */
  const diasHastaCita = (fechaISO) => {
    const hoy = new Date()
    const cita = new Date(fechaISO)
    const diferencia = Math.ceil((cita - hoy) / (1000 * 60 * 60 * 24))
    return diferencia
  }

  // =========================
  // ESTADOS DE CARGA Y ERROR
  // =========================

  if (loading) {
    return (
      <div className="owner-dashboard">
        <div className="owner-dashboard__loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando tu información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="owner-dashboard">
        <div className="owner-dashboard__error">
          <AlertCircle className="error-icon" />
          <h3>Oops! Algo salió mal</h3>
          <p>{error}</p>
          <button onClick={loadOwnerStats} className="btn-retry">
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  if (!stats || !stats.mascotas || stats.mascotas.length === 0) {
    return (
      <div className="owner-dashboard">
        <div className="owner-dashboard__empty">
          <PawPrint className="empty-icon" />
          <h2>¡Bienvenido, {user?.nombre}!</h2>
          <p>Aún no tienes mascotas registradas.</p>
          <button
            onClick={() => navigate('/mascotas')}
            className="btn-primary"
          >
            Consulta con tu veterinario y registra tu primera mascota
          </button>
        </div>
      </div>
    )
  }

  const proximaCita = getProximaCita()
  const totalMascotas = stats.mascotas?.length || 0
  const totalCitas = stats.proximasCitas?.length || 0

  // =========================
  // RENDER PRINCIPAL
  // =========================

  return (
    <div className="owner-dashboard">
      {/* Hero Section - Bienvenida */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            ¡Hola, <span className="hero-name">{user?.nombre}</span>! 👋
          </h1>
          <p className="hero-subtitle">
            Bienvenido de vuelta a tu panel de control
          </p>
        </div>
        {stats.mascotaSaludo && (
          <div className="hero-pet">
            <div className="hero-pet-badge">
              <Heart className="heart-icon" />
            </div>
            <p className="hero-pet-text">
              ¿Cómo ha estado <strong>{stats.mascotaSaludo.nombre}</strong>?
            </p>
          </div>
        )}
      </section>

      {/* Stats Cards - Estadísticas rápidas */}
      <section className="dashboard-stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">
            <PawPrint />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Mis Mascotas</p>
            <h3 className="stat-card__value">{totalMascotas}</h3>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__icon">
            <Calendar />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Próximas Citas</p>
            <h3 className="stat-card__value">{totalCitas}</h3>
          </div>
        </div>

        {proximaCita && (
          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <Clock />
            </div>
            <div className="stat-card__content">
              <p className="stat-card__label">Próxima Cita</p>
              <h3 className="stat-card__value">
                {diasHastaCita(proximaCita.fecha_hora) === 0
                  ? '¡Hoy!'
                  : diasHastaCita(proximaCita.fecha_hora) === 1
                  ? '¡Mañana!'
                  : `En ${diasHastaCita(proximaCita.fecha_hora)} días`
                }
              </h3>
            </div>
          </div>
        )}
      </section>

      {/* LAYOUT DE 2 COLUMNAS - COMPACTO */}
      <div className="dashboard-main-grid">

        {/* COLUMNA IZQUIERDA - Citas y Accesos Rápidos */}
        <div className="dashboard-left-column">

          {/* Próximas Citas */}
          {totalCitas > 0 && (
            <section className="dashboard-appointments">
              <div className="section-header">
                <h2 className="section-title">
                  <Calendar className="section-icon" />
                  Próximas Citas
                </h2>
                <button
                  onClick={() => navigate('/citas')}
                  className="btn-link"
                >
                  Ver todas
                  <ArrowRight className="arrow-icon" />
                </button>
              </div>

              <div className="appointments-list">
                {stats.proximasCitas.slice(0, 4).map((cita, index) => (
                  <div
                    key={cita.id || index}
                    className={`appointment-card ${index === 0 ? 'appointment-card--next' : ''}`}
                  >
                    <div className="appointment-card__indicator">
                      {index === 0 ? (
                        <TrendingUp className="indicator-icon indicator-icon--active" />
                      ) : (
                        <CheckCircle className="indicator-icon" />
                      )}
                    </div>

                    <div className="appointment-card__content">
                      <div className="appointment-card__header">
                        <div className="appointment-card__title-group">
                          <h4 className="appointment-card__pet">{cita.mascota_nombre}</h4>
                          {index === 0 && (
                            <span className="appointment-card__badge">Próxima</span>
                          )}
                        </div>
                      </div>

                      <p className="appointment-card__date">
                        <Clock className="inline-icon" />
                        {formatearFecha(cita.fecha_hora)}
                      </p>

                      {/* INFORMACIÓN ADICIONAL */}
                      {cita.motivo && (
                        <p className="appointment-card__motivo">
                          <Stethoscope className="inline-icon" />
                          <span className="motivo-label">Motivo:</span> {cita.motivo}
                        </p>
                      )}

                      {cita.servicio && (
                        <p className="appointment-card__servicio">
                          <MapPin className="inline-icon" />
                          <span className="servicio-label">Servicio:</span> {cita.servicio}
                        </p>
                      )}

                      <div className="appointment-card__footer">
                        <span className={`appointment-status appointment-status--${cita.estado}`}>
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Accesos Rápidos */}
          <section className="dashboard-quick-actions">
            <h2 className="section-title">Accesos Rápidos</h2>

            <div className="quick-actions-grid">
              <button
                onClick={() => navigate('/citas')}
                className="quick-action-card"
              >
                <Calendar className="quick-action-icon" />
                <span className="quick-action-label">Agendar Cita</span>
              </button>

              <button
                onClick={() => navigate('/historias-clinicas')}
                className="quick-action-card"
              >
                <CheckCircle className="quick-action-icon" />
                <span className="quick-action-label">Historias Clínicas</span>
              </button>

              <button
                onClick={() => navigate('/mascotas')}
                className="quick-action-card"
              >
                <PawPrint className="quick-action-icon" />
                <span className="quick-action-label">Mis Mascotas</span>
              </button>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA - Mascotas */}
        <div className="dashboard-right-column">
          <section className="dashboard-pets">
            <div className="section-header">
              <h2 className="section-title">
                <PawPrint className="section-icon" />
                Todas mis Mascotas
              </h2>
              <button
                onClick={() => navigate('/mascotas')}
                className="btn-link"
              >
                Gestionar
                <ArrowRight className="arrow-icon" />
              </button>
            </div>

            <div className="pets-grid">
              {stats.mascotas.slice(0, 3).map((mascota) => (
                <div
                  key={mascota.id}
                  className="pet-card"
                  onClick={() => navigate(`/mascotas/${mascota.id}`)}
                >
                  <div
                    className="pet-card__emoji"
                    style={{ background: getPetColor(mascota.especie) }}
                  >
                    <span className="pet-emoji">{getPetEmoji(mascota.especie)}</span>
                  </div>

                  <div className="pet-card__content">
                    <h4 className="pet-card__name">{mascota.nombre}</h4>
                    <p className="pet-card__breed">{mascota.raza || 'Sin raza especificada'}</p>

                    <div className="pet-card__details">
                      <span className="pet-detail">
                        <span className="pet-detail__label">Especie:</span>
                        <span className="pet-detail__value">{mascota.especie}</span>
                      </span>

                      {mascota.edad && (
                        <span className="pet-detail">
                          <span className="pet-detail__label">Edad:</span>
                          <span className="pet-detail__value">{mascota.edad}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mostrar botón si hay más de 3 mascotas */}
            {stats.mascotas.length > 3 && (
              <div className="pets-show-more">
                <button
                  onClick={() => navigate('/mascotas')}
                  className="btn-show-more"
                >
                  Ver todas las mascotas ({stats.mascotas.length})
                  <ArrowRight className="arrow-icon" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default OwnerWelcomeDashboard