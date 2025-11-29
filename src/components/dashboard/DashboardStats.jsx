import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/AuthStore.jsx'
import dashboardService from '@/services/dashboardService'
import StatCard from './StatCard.jsx'
import './DashboardStats.css'

/**
 * Componente DashboardStats - CON DATOS REALES
 * Muestra las estadísticas del dashboard consumiendo datos del backend
 * Diferencia entre roles: staff vs propietario
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja estadísticas del dashboard
 * - Open/Closed: Fácil agregar nuevas estadísticas por rol
 */
function DashboardStats() {
  const { user } = useAuthStore()
  const userRole = user?.rol || 'propietario'

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Cargar estadísticas al montar el componente
   */
  useEffect(() => {
    loadStats()
  }, [])

  /**
   * Obtener estadísticas desde el backend
   */
  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dashboardService.getStats()
      console.log('📊 Estadísticas recibidas:', data)

      setStats(data.stats)

    } catch (err) {
      console.error('❌ Error al cargar estadísticas:', err)
      setError(err.message || 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="dashboard-stats">
        <div className="loading-stats">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="dashboard-stats">
        <div className="error-stats">
          <p>⚠️ {error}</p>
          <button onClick={loadStats} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Si no hay datos
  if (!stats) {
    return (
      <div className="dashboard-stats">
        <p>No hay estadísticas disponibles</p>
      </div>
    )
  }

  /**
   * Renderizar estadísticas para STAFF
   * (superadmin, veterinario, auxiliar)
   */
  const renderStaffStats = () => {
    const statsConfig = {
      superadmin: [
        {
          title: 'Citas del Día',
          value: stats.citasDelDia || 0,
          icon: 'calendar',
          color: 'blue'
        },
        {
          title: 'Citas Programadas',
          value: stats.citasProgramadas || 0,
          icon: 'users',
          color: 'green'
        },
        {
          title: 'Stock Bajo',
          value: stats.stockBajo || 0,
          icon: 'alert',
          color: 'orange'
        },
        {
          title: 'Notificaciones',
          value: stats.notificaciones || 0,
          icon: 'bell',
          color: 'red'
        }
      ],
      veterinario: [
        {
          title: 'Citas del Día',
          value: stats.citasDelDia || 0,
          icon: 'calendar',
          color: 'blue'
        },
        {
          title: 'Citas Programadas',
          value: stats.citasProgramadas || 0,
          icon: 'users',
          color: 'green'
        },
        {
          title: 'Notificaciones',
          value: stats.notificaciones || 0,
          icon: 'bell',
          color: 'red'
        }
      ],
      auxiliar: [
        {
          title: 'Citas del Día',
          value: stats.citasDelDia || 0,
          icon: 'calendar',
          color: 'blue'
        },
        {
          title: 'Citas Programadas',
          value: stats.citasProgramadas || 0,
          icon: 'users',
          color: 'green'
        },
        {
          title: 'Stock Bajo',
          value: stats.stockBajo || 0,
          icon: 'alert',
          color: 'orange'
        }
      ]
    }

    const currentStats = statsConfig[userRole] || statsConfig.auxiliar

    return (
      <div className="dashboard-stats">
        {currentStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    )
  }

  /**
   * Renderizar estadísticas para PROPIETARIO
   * Muestra información de sus mascotas y próximas citas
   */
  const renderOwnerStats = () => {
    const totalMascotas = stats.mascotas?.length || 0
    const proximasCitas = stats.proximasCitas?.length || 0

    return (
      <div className="dashboard-stats">
        <StatCard
          title="Mis Mascotas"
          value={totalMascotas}
          icon="paw"
          color="blue"
        />
        <StatCard
          title="Próximas Citas"
          value={proximasCitas}
          icon="calendar"
          color="green"
        />
      </div>
    )
  }

  // Renderizar según el rol
  const isStaff = ['superadmin', 'veterinario', 'auxiliar'].includes(userRole)

  return isStaff ? renderStaffStats() : renderOwnerStats()
}

export default DashboardStats