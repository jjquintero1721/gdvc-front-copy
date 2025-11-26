import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  HomeIcon,
  UserIcon,
  PawIcon,
  DnaIcon,
  MedicalCrossIcon,
  ClockIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClipboardIcon
} from '@/assets/icons/DashboardIcons'
import './Sidebar.css'

/**
 * Configuración de navegación por rol - CON ICONOS PROFESIONALES
 * Define qué elementos del sidebar puede ver cada rol
 */
const navigationByRole = {
  superadmin: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Usuarios', path: '/usuarios', icon: 'users' },
    { name: 'Propietarios', path: '/propietarios', icon: 'user' },
    { name: 'Mascotas', path: '/mascotas', icon: 'paw' },
    { name: 'Veterinarios', path: '/veterinarios', icon: 'medical' },
    { name: 'Horarios', path: '/horarios', icon: 'clock' },
    { name: 'Servicios', path: '/servicios', icon: 'briefcase' },
    { name: 'Citas', path: '/citas', icon: 'calendar' },
    { name: 'Consultas', path: '/consultas', icon: 'dna' },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' }
  ],
  veterinario: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Propietarios', path: '/propietarios', icon: 'user' },
    { name: 'Mascotas', path: '/mascotas', icon: 'paw' },
    { name: 'Veterinarios', path: '/veterinarios', icon: 'medical' },
    { name: 'Citas', path: '/citas', icon: 'calendar' },
    { name: 'Consultas', path: '/consultas', icon: 'dna' },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' },
    { name: 'Servicios', path: '/servicios', icon: 'briefcase' },
    { name: 'Horarios', path: '/horarios', icon: 'clock' }
  ],
  auxiliar: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Propietarios', path: '/propietarios', icon: 'user' },
    { name: 'Mascotas', path: '/mascotas', icon: 'paw' },
    { name: 'Veterinarios', path: '/veterinarios', icon: 'medical' },
    { name: 'Horarios', path: '/horarios', icon: 'clock' },
    { name: 'Citas', path: '/citas', icon: 'calendar' },
    { name: 'Consultas', path: '/consultas', icon: 'dna' },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' }
  ],
  propietario: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Mis Mascotas', path: '/mis-mascotas', icon: 'paw' },
    { name: 'Mis Citas', path: '/mis-citas', icon: 'calendar' },
    { name: 'Horarios', path: '/horarios', icon: 'clock' },
  ]
}

/**
 * Mapeo de iconos string a componentes SVG
 */
const iconComponents = {
  home: HomeIcon,
  users: UserIcon,
  user: UserIcon,
  paw: PawIcon,
  dna: DnaIcon,
  medical: MedicalCrossIcon,
  clock: ClockIcon,
  briefcase: BriefcaseIcon,
  calendar: CalendarIcon,
  clipboard: ClipboardIcon
}

/**
 * Componente Sidebar - ACTUALIZADO CON PERFIL CLICKEABLE
 * Navegación lateral con filtro por roles e iconos profesionales
 *
 * Mejoras:
 * - Iconos SVG profesionales en lugar de emojis
 * - Mejor hover y estados activos
 * - Animaciones sutiles
 * - Footer clickeable que navega al perfil del usuario
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja navegación
 * - Open/Closed: Fácil agregar nuevas rutas por rol
 */
function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Obtener navegación según el rol del usuario
  const userRole = user?.rol || 'propietario'
  const navigation = navigationByRole[userRole] || navigationByRole.propietario

  // Función para obtener el componente de icono
  const getIconComponent = (iconKey) => {
    return iconComponents[iconKey] || HomeIcon
  }

  /**
   * Navegar al perfil del usuario
   */
  const handleProfileClick = () => {
    navigate('/mi-perfil')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <PawIcon className="sidebar__logo-icon" />
        </div>
        <h2 className="sidebar__title">Clínica Veterinaria</h2>
        <p className="sidebar__role">{userRole.toUpperCase()}</p>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path
            const IconComponent = getIconComponent(item.icon)

            return (
              <li key={item.path} className="sidebar__item">
                <Link
                  to={item.path}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                  <span className="sidebar__icon">
                    <IconComponent className="w-5 h-5" />
                  </span>
                  <span className="sidebar__text">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__user"
          onClick={handleProfileClick}
          aria-label="Ver mi perfil"
        >
          <div className="sidebar__user-icon">
            <UserIcon className="w-6 h-6" />
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user?.nombre || 'Usuario'}</p>
            <p className="sidebar__user-email">{user?.email || user?.correo}</p>
          </div>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar