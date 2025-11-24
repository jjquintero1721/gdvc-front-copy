import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './Sidebar.css'

// Iconos simulados (puedes reemplazarlos con iconos reales)
const icons = {
  dashboard: '📊',
  users: '👥',
  owners: '👤',
  pets: '🐾',
  species: '🦮',
  breeds: '🐕',
  vets: '⚕️',
  schedules: '🕐',
  services: '💼',
  appointments: '📅',
  medicalHistory: '📋'
}

/**
 * Configuración de navegación por rol
 * Define qué elementos del sidebar puede ver cada rol
 */
const navigationByRole = {
  superadmin: [
    { name: 'Dashboard', path: '/dashboard', icon: icons.dashboard },
    { name: 'Usuarios', path: '/usuarios', icon: icons.users },
    { name: 'Propietarios', path: '/propietarios', icon: icons.owners },
    { name: 'Mascotas', path: '/mascotas', icon: icons.pets },
    { name: 'Especies', path: '/especies', icon: icons.species },
    { name: 'Razas', path: '/razas', icon: icons.breeds },
    { name: 'Veterinarios', path: '/veterinarios', icon: icons.vets },
    { name: 'Horarios', path: '/horarios', icon: icons.schedules },
    { name: 'Servicios', path: '/servicios', icon: icons.services },
    { name: 'Citas', path: '/citas', icon: icons.appointments },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: icons.medicalHistory }
  ],
  veterinario: [
    { name: 'Dashboard', path: '/dashboard', icon: icons.dashboard },
    { name: 'Propietarios', path: '/propietarios', icon: icons.owners },
    { name: 'Mascotas', path: '/mascotas', icon: icons.pets },
    { name: 'Citas', path: '/citas', icon: icons.appointments },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: icons.medicalHistory },
    { name: 'Servicios', path: '/servicios', icon: icons.services },
    { name: 'Horarios', path: '/horarios', icon: icons.schedules }
  ],
  auxiliar: [
    { name: 'Dashboard', path: '/dashboard', icon: icons.dashboard },
    { name: 'Propietarios', path: '/propietarios', icon: icons.owners },
    { name: 'Mascotas', path: '/mascotas', icon: icons.pets },
    { name: 'Citas', path: '/citas', icon: icons.appointments },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: icons.medicalHistory }
  ],
  propietario: [
    { name: 'Dashboard', path: '/dashboard', icon: icons.dashboard },
    { name: 'Mis Mascotas', path: '/mis-mascotas', icon: icons.pets },
    { name: 'Mis Citas', path: '/mis-citas', icon: icons.appointments }
  ]
}

/**
 * Componente Sidebar
 * Navegación lateral con filtro por roles
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja navegación
 * - Open/Closed: Fácil agregar nuevas rutas por rol
 */
function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  // Obtener navegación según el rol del usuario
  const userRole = user?.rol || 'propietario'
  const navigation = navigationByRole[userRole] || navigationByRole.propietario

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Clínica Veterinaria</h2>
        <p className="sidebar__role">{userRole.toUpperCase()}</p>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <li key={item.path} className="sidebar__item">
                <Link
                  to={item.path}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span className="sidebar__text">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-icon">👤</div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user?.nombre || 'Usuario'}</p>
            <p className="sidebar__user-email">{user?.email || user?.correo}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar