import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

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
import LogoPawFlow from '../../assets/images/pawflow-logo.jpeg'  // <-- AQUI VA TU LOGO

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
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' },
    { name: 'Inventario', path: '/inventario', icon:'briefcase'},
    { name: 'Triage', path: '/triage', icon: 'medical' },
  ],

  veterinario: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Propietarios', path: '/propietarios', icon: 'user' },
    { name: 'Mascotas', path: '/mascotas', icon: 'paw' },
    { name: 'Veterinarios', path: '/veterinarios', icon: 'medical' },
    { name: 'Horarios', path: '/horarios', icon: 'clock' },
    { name: 'Servicios', path: '/servicios', icon: 'briefcase' },
    { name: 'Citas', path: '/citas', icon: 'calendar' },
    { name: 'Consultas', path: '/consultas', icon: 'dna' },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' },
    { name: 'Inventario', path: '/inventario', icon:'briefcase'},
    { name: 'Triage', path: '/triage', icon: 'medical' },
  ],
  auxiliar: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Propietarios', path: '/propietarios', icon: 'user' },
    { name: 'Mascotas', path: '/mascotas', icon: 'paw' },
    { name: 'Veterinarios', path: '/veterinarios', icon: 'medical' },
    { name: 'Horarios', path: '/horarios', icon: 'clock' },
    { name: 'Citas', path: '/citas', icon: 'calendar' },
    { name: 'Consultas', path: '/consultas', icon: 'dna' },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' },
    { name: 'Inventario', path: '/inventario', icon:'briefcase'},
    { name: 'Triage', path: '/triage', icon: 'medical' },
  ],
  propietario: [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Mis Mascotas', path: '/mascotas', icon: 'paw' },
    { name: 'Citas', path: '/citas', icon: 'calendar' },
    { name: 'Historias Clínicas', path: '/historias-clinicas', icon: 'clipboard' }

  ]
}

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

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const role = user?.rol || 'superadmin'
  const navigation = navigationByRole[role] || []

  const getIcon = (key) => iconComponents[key] || HomeIcon

  return (
    <aside className="sidebar enhanced-sidebar">

      {/* HEADER */}
      <div className="sidebar__header fancy-header">
        <img src={LogoPawFlow} className="sidebar__logo-img" alt="PawFlow Logo" />

        <h2 className="sidebar__title">PawFlow</h2>
        <p className="sidebar__role">{role.toUpperCase()}</p>
      </div>


      {/* NAVIGATION */}
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.path
            const Icon = getIcon(item.icon)

            return (
              <li key={item.path} style={{ animationDelay: `${index * 0.07}s` }} className="slide-item">
                <Link
                  to={item.path}
                  className={`sidebar__link modern-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="sidebar__icon" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>


      {/* USER FOOTER */}
        <div className="sidebar__footer glass-footer">

          {/* Estado del menú */}
          {(() => {
            const [open, setOpen] = useState(false)
            const navigateToProfile = () => navigate('/mi-perfil')
            const logout = () => {
              useAuthStore.getState().logout()
              navigate('/login')
            }

            return (
              <div className="sidebar-user-container">

                {/* Botón principal */}
                <button
                  className="sidebar__user"
                  onClick={() => setOpen(!open)}
                >
                  <div className="sidebar__user-icon">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="sidebar__user-info">
                    <p className="sidebar__user-name">{user?.nombre}</p>
                    <p className="sidebar__user-email">{user?.email || user?.correo}</p>
                  </div>
                </button>

                {/* DESPLEGABLE */}
                <div className={`sidebar-dropdown ${open ? 'open' : ''}`}>
                  <button className="dropdown-item" onClick={navigateToProfile}>
                    Ver mi perfil
                  </button>

                  <button className="dropdown-item logout" onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>

              </div>
            )
          })()}
        </div>


    </aside>
  )
}
