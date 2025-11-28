import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import AppointmentsList from '../../components/dashboard/AppointmentsList.jsx'
import StockAlerts from '../../components/dashboard/StockAlerts'
import OwnerWelcomeDashboard from '../../components/dashboard/OwnerWelcomeDashboard.jsx'
import Button from '@/components/ui/Button'
import './DashboardHome.css'

/**
 * Dashboard Home - ACTUALIZADO CON DATOS REALES
 *
 * Muestra diferentes vistas según el rol:
 * - **Staff (superadmin, veterinario, auxiliar):** Dashboard administrativo con estadísticas,
 *   citas del día, y alertas de stock
 * - **Propietario:** Dashboard personalizado con saludo, mascota animada y próximas citas
 *
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza vista principal del dashboard
 * - Open/Closed: Fácil agregar nuevas secciones
 */
function DashboardHome() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const userRole = user?.rol || 'propietario'

  // Determinar si el usuario es staff o propietario
  const isStaff = ['superadmin', 'veterinario', 'auxiliar'].includes(userRole)
  const canViewInventory = isStaff

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  /**
   * Renderizar Dashboard para PROPIETARIO
   */
  if (!isStaff) {
    return (
      <div className="dashboard-home">
        {/* Header */}
        <div className="dashboard-home__header">
          <div>
            <h1 className="dashboard-home__title">
              Panel de Propietario
            </h1>
            <p className="dashboard-home__subtitle">
              Bienvenido a tu espacio personal
            </p>
          </div>
          <div className="dashboard-home__actions">
            <Button
              variant="outline"
              onClick={() => navigate('/cambiar-contrasena')}
            >
              Cambiar Contraseña
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Dashboard del Propietario */}
        <OwnerWelcomeDashboard />
      </div>
    )
  }

  /**
   * Renderizar Dashboard para STAFF
   * (superadmin, veterinario, auxiliar)
   */
  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="dashboard-home__header">
        <div>
          <h1 className="dashboard-home__title">
            ¡Bienvenido, {user?.nombre || 'Usuario'}!
          </h1>
          <p className="dashboard-home__subtitle">
            Panel de Control - Rol: {userRole.toUpperCase()}
          </p>
        </div>
        <div className="dashboard-home__actions">
          <Button
            variant="secondary"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Estadísticas del Dashboard - CON DATOS REALES */}
      <DashboardStats />

      {/* Grid de Secciones */}
      <div className="dashboard-sections">
        {/* Citas de Hoy - CON DATOS REALES */}
        <AppointmentsList />

        {/* Stock Bajo - Solo para roles que pueden ver inventario */}
        {canViewInventory && <StockAlerts />}
      </div>

      {/* Próximas Funcionalidades */}
      <div className="dashboard-section">
        <h2 className="section-title">Próximas Funcionalidades</h2>
        <div className="features-grid">
          <FeatureCard
            name="Gestión de Usuarios"
            status="completed"
            description="Crear, editar y gestionar usuarios del sistema"
          />
          <FeatureCard
            name="Gestión de Propietarios"
            status="completed"
            description="Administrar información de propietarios"
          />
          <FeatureCard
            name="Gestión de Mascotas"
            status="completed"
            description="Registrar y gestionar mascotas"
          />
          <FeatureCard
            name="Gestión de Citas"
            status="completed"
            description="Agendar y gestionar citas médicas"
          />
          <FeatureCard
            name="Historias Clínicas"
            status="completed"
            description="Consultas y seguimiento médico"
          />
          <FeatureCard
            name="Inventario"
            status="completed"
            description="Control de medicamentos y suministros"
          />
          <FeatureCard
            name="Notificaciones"
            status="completed"
            description="Recordatorios y alertas automáticas"
          />
          <FeatureCard
            name="Reportes y Estadísticas"
            status="pending"
            description="Análisis y métricas del sistema"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de tarjeta de funcionalidad
 */
function FeatureCard({ name, status, description }) {
  const isCompleted = status === 'completed'

  return (
    <div className={`feature-card ${isCompleted ? 'completed' : 'pending'}`}>
      <div className="feature-card__icon">
        {isCompleted ? (
          <svg className="icon-completed" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="icon-pending" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="feature-card__content">
        <h3 className="feature-card__name">{name}</h3>
        <p className="feature-card__description">{description}</p>
        <span className={`feature-card__badge ${isCompleted ? 'completed' : 'pending'}`}>
          {isCompleted ? 'Completado' : 'Próximamente'}
        </span>
      </div>
    </div>
  )
}

export default DashboardHome