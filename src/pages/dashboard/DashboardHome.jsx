import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

/**
 * Dashboard Home - Página de inicio del dashboard
 * TODO: Implementar en futuras fases
 */
function DashboardHome() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      <h1>¡Bienvenido al Dashboard, {user?.nombre || 'Usuario'}!</h1>
      <p style={{ margin: 'var(--spacing-lg) 0' }}>
        Esta es un área protegida. Solo usuarios autenticados pueden acceder aquí.
      </p>

      <div style={{
        background: 'var(--gray-white)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h3>Información del Usuario</h3>
        <p><strong>Nombre:</strong> {user?.nombre}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Cédula:</strong> {user?.cedula}</p>
        <p><strong>Teléfono:</strong> {user?.telefono}</p>
        <p><strong>Dirección:</strong> {user?.direccion}</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Button onClick={handleLogout} variant="outline">
          Cerrar Sesión
        </Button>
        <Button onClick={() => navigate('/cambiar-contrasena')} variant="secondary">
          Cambiar Contraseña
        </Button>
      </div>

      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        background: 'var(--gray-100)',
        borderRadius: 'var(--border-radius-md)'
      }}>
        <h3>Próximas Funcionalidades</h3>
        <ul>
          <li>Gestión de Mascotas</li>
          <li>Gestión de Citas</li>
          <li>Historial Clínico</li>
          <li>Productos y Servicios</li>
          <li>Facturación</li>
        </ul>
      </div>
    </div>
  )
}

export default DashboardHome