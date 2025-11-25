import { useAuthStore } from '@/store/authStore'
import StatCard from './StatCard.jsx'
import './DashboardStats.css'

/**
 * Componente DashboardStats - MEJORADO
 * Muestra las estadísticas del dashboard filtradas por rol
 * Ahora usa iconos SVG profesionales en lugar de emojis
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
  // ICONOS ACTUALIZADOS: calendar, users, alert, bell
  const statsByRole = {
    superadmin: [
      {
        title: 'Citas del Día',
        value: mockStats.citasDelDia,
        icon: 'calendar',  // ✅ Icono profesional
        color: 'blue'
      },
      {
        title: 'Citas Programadas',
        value: mockStats.citasProgramadas,
        icon: 'users',  // ✅ Icono profesional
        color: 'green'
      },
      {
        title: 'Stock Bajo',
        value: mockStats.stockBajo,
        icon: 'alert',  // ✅ Icono profesional
        color: 'orange'
      },
      {
        title: 'Notificaciones',
        value: mockStats.notificaciones,
        icon: 'bell',  // ✅ Icono profesional
        color: 'red'
      }
    ],
    veterinario: [
      {
        title: 'Citas del Día',
        value: mockStats.citasDelDia,
        icon: 'calendar',
        color: 'blue'
      },
      {
        title: 'Citas Programadas',
        value: mockStats.citasProgramadas,
        icon: 'users',
        color: 'green'
      },
      {
        title: 'Notificaciones',
        value: mockStats.notificaciones,
        icon: 'bell',
        color: 'red'
      }
    ],
    auxiliar: [
      {
        title: 'Citas del Día',
        value: mockStats.citasDelDia,
        icon: 'calendar',
        color: 'blue'
      },
      {
        title: 'Citas Programadas',
        value: mockStats.citasProgramadas,
        icon: 'users',
        color: 'green'
      }
    ],
    propietario: [
      {
        title: 'Mis Citas',
        value: mockStats.citasProgramadas,
        icon: 'calendar',
        color: 'blue'
      },
      {
        title: 'Notificaciones',
        value: mockStats.notificaciones,
        icon: 'bell',
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