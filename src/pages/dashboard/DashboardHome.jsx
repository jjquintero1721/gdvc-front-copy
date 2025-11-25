import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import DashboardStats from './DashboardStats_IMPROVED'
import AppointmentsList from './AppointmentsList_IMPROVED'
import StockAlerts from './StockAlerts_IMPROVED'
import Button from '@/components/ui/Button'
import { CheckIcon, ClockPendingIcon } from '@/assets/icons/DashboardIcons'
import './DashboardHome.css'
import './DashboardSections.css'

/**
 * Dashboard Home - MEJORADO
 * Página principal del dashboard con diseño profesional
 *
 * Mejoras:
 * - Iconos SVG profesionales en lugar de emojis
 * - Animaciones sutiles
 * - Paleta de colores moderna
 * - Mejor jerarquía visual
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

  // Lista de funcionalidades con estado
  const features = [
    { name: 'Gestión de Usuarios', status: 'completed' },
    { name: 'Gestión de Propietarios', status: 'completed' },
    { name: 'Gestión de Mascotas', status: 'completed' },
    { name: 'Gestión de Citas', status: 'completed' },
    { name: 'Historias Clínicas', status: 'completed' },
    { name: 'Inventario', status: 'completed' },
    { name: 'Notificaciones', status: 'completed' },
    { name: 'Reportes y Estadísticas', status: 'pending' }
  ]

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
            {features.map((feature, index) => (
              <li key={index}>
                <div
                  className={`feature-icon feature-icon--${feature.status}`}
                >
                  {feature.status === 'completed' ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <ClockPendingIcon className="w-4 h-4" />
                  )}
                </div>
                <span>
                  {feature.name} ({feature.status === 'completed' ? 'implementado' : 'próximamente'})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome