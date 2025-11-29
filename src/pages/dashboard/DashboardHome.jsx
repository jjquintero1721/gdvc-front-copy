import { useAuthStore } from '@/store/AuthStore.jsx'
import { useNavigate } from 'react-router-dom'
import DashboardStats from '../../components/dashboard/DashboardStats.jsx'
import AppointmentsList from '../../components/dashboard/AppointmentsList.jsx'
import StockAlerts from '../../components/dashboard/StockAlerts'
import OwnerWelcomeDashboard from '../../components/dashboard/OwnerWelcomeDashboard.jsx'
import './DashboardHome.css'

function DashboardHome() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const userRole = user?.rol || 'propietario'

  const isStaff = ['superadmin', 'veterinario', 'auxiliar'].includes(userRole)
  const canViewInventory = isStaff

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  /**
   * Dashboard para PROPIETARIO (usando MISMO HEADER QUE STAFF)
   */
  if (!isStaff) {
    return (
      <div className="dashboard-home">
        {/* Header idéntico al del Staff */}
        <div className="dashboard-home__header">
          <div>
            <h1 className="dashboard-home__title">
              ¡Bienvenido, {user?.nombre || 'Usuario'}!
            </h1>
            <p className="dashboard-home__subtitle">
              Panel de Control - Propietario
            </p>
          </div>


        </div>

        {/* Dashboard visual del propietario */}
        <OwnerWelcomeDashboard />
      </div>
    )
  }

  /**
   * Dashboard para STAFF (NO TOCADO)
   */
  return (
    <div className="dashboard-home">
      <div className="dashboard-home__header">
        <div>
          <h1 className="dashboard-home__title">
            ¡Bienvenido, {user?.nombre || 'Usuario'}!
          </h1>
          <p className="dashboard-home__subtitle">
            Panel de Control - Rol: {userRole.toUpperCase()}
          </p>
        </div>

      </div>

      <DashboardStats />

      <div className="dashboard-sections">
        <AppointmentsList />
        {canViewInventory && <StockAlerts />}
      </div>

      <div className="dashboard-section-2">
        <h2 className="section-title">Funcionalidades</h2>
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
