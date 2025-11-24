import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import DashboardStats from '@/components/dashboard/DashboardStats'
import AppointmentsList from '@/components/dashboard/AppointmentsList'
import StockAlerts from '@/components/dashboard/StockAlerts'
import Button from '@/components/ui/Button'
import './DashboardHome.css'

/**
 * Dashboard Home - Página principal del dashboard
 *
 * Muestra:
 * - Estadísticas del día (filtradas por rol)
 * - Citas del día
 * - Alertas de stock (solo para staff)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza vista principal del dashboard
 * - Open/Closed: Fácil agregar nuevas secciones
 */
function DashboardHome() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const userRole = user?.rol || 'propietario'

  // Determinar si el usuario puede ver inventario
  const canViewInventory = ['superadmin', 'veterinario', 'auxiliar'].includes(userRole)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
          <Button onClick={() => navigate('/cambiar-contrasena')} variant="outline">
            Cambiar Contraseña
          </Button>
          <Button onClick={handleLogout} variant="secondary">
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <DashboardStats />

      {/* Grid de contenido */}
      <div className="dashboard-home__grid">
        {/* Citas del día */}
        <div className="dashboard-home__section">
          <AppointmentsList />
        </div>

        {/* Alertas de stock - Solo para staff */}
        {canViewInventory && (
          <div className="dashboard-home__section">
            <StockAlerts />
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="dashboard-home__info">
        <div className="dashboard-home__info-card">
          <h3>Próximas Funcionalidades</h3>
          <ul>
            <li>✅ Gestión de Usuarios (implementado)</li>
            <li>✅ Gestión de Propietarios (implementado)</li>
            <li>✅ Gestión de Mascotas (implementado)</li>
            <li>✅ Gestión de Citas (implementado)</li>
            <li>✅ Historias Clínicas (implementado)</li>
            <li>✅ Inventario (implementado)</li>
            <li>✅ Notificaciones (implementado)</li>
            <li>⏳ Reportes y Estadísticas (próximamente)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome