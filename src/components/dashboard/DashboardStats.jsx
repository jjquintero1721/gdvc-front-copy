import { useAuthStore } from '@store/AuthStore.jsx'
import StatCard from './StatCard.jsx'
import './DashboardStats.css'

/**
 * Componente DashboardStats
 * Muestra las estadísticas del dashboard filtradas por rol
 *
 * Datos mock por ahora - En producción se conectarán a endpoints reales
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja estadísticas del dashboard
 * - Open/Closed: Fácil agregar nuevas estadísticas por rol
 */
function DashboardStats() {
  const { user } = useAuthStore()
  const userRole = user?.rol || 'propietario'

  // Datos mock - Estos vendrán de la API en producción
  const mockStats = {
    citasDelDia: 1,
    citasProgramadas: 0,
    stockBajo: 0,
    notificaciones: 0
  }

  // Configuración de estadísticas visibles por rol
  const statsByRole = {
    superadmin: [
      {
        title: 'Citas del Día',
        value: mockStats.citasDelDia,
        icon: '📅',
        color: 'blue'
      },
      {
        title: 'Citas Programadas',
        value: mockStats.citasProgramadas,
        icon: '👥',
        color: 'green'
      },
      {
        title: 'Stock Bajo',
        value: mockStats.stockBajo,
        icon: '⚠️',
        color: 'yellow'
      },
      {
        title: 'Notificaciones',
        value: mockStats.notificaciones,
        icon: '📦',
        color: 'red'
      }
    ],
    veterinario: [
      {
        title: 'Citas del Día',
        value: mockStats.citasDelDia,
        icon: '📅',
        color: 'blue'
      },
      {
        title: 'Citas Programadas',
        value: mockStats.citasProgramadas,
        icon: '👥',
        color: 'green'
      },
      {
        title: 'Notificaciones',
        value: mockStats.notificaciones,
        icon: '📦',
        color: 'red'
      }
    ],
    auxiliar: [
      {
        title: 'Citas del Día',
        value: mockStats.citasDelDia,
        icon: '📅',
        color: 'blue'
      },
      {
        title: 'Citas Programadas',
        value: mockStats.citasProgramadas,
        icon: '👥',
        color: 'green'
      }
    ],
    propietario: [
      {
        title: 'Mis Citas',
        value: mockStats.citasProgramadas,
        icon: '📅',
        color: 'blue'
      },
      {
        title: 'Notificaciones',
        value: mockStats.notificaciones,
        icon: '📦',
        color: 'red'
      }
    ]
  }

  const stats = statsByRole[userRole] || statsByRole.propietario

  return (
    <div className="dashboard-stats">
      <h2 className="dashboard-stats__title">Panel de Administración</h2>

      <div className="dashboard-stats__grid">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  )
}

export default DashboardStats