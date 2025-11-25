import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import userService from '@/services/userService'
import petService from '@/services/petService'
import appointmentService from '@/services/appointmentService'
import authService from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import './UserDetailPage.css'

/**
 * Página de Detalle de Usuario
 * Muestra información completa del usuario según su rol:
 * - Propietario: información + mascotas + cambio de contraseña
 * - Veterinario: información + citas + cambio de contraseña
 * - Auxiliar: información + cambio de contraseña
 *
 * Esta página se reutiliza para:
 * 1. Ver usuarios desde la gestión (UsersPage)
 * 2. Ver el perfil propio (desde el botón inferior del Sidebar)
 */
function UserDetailPage() {
  const { userId } = useParams() // Si viene de la URL
  const navigate = useNavigate()
  const currentUser = useAuthStore(state => state.user)

  // Determinar si es el perfil propio o de otro usuario
  const isOwnProfile = !userId || userId === currentUser?.id
  const targetUserId = userId || currentUser?.id

  // Estados de datos
  const [user, setUser] = useState(null)
  const [pets, setPets] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de UI
  const [activeTab, setActiveTab] = useState('informacion') // informacion, mascotas/citas, seguridad

  // Estados de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState(null)

  // Cargar datos del usuario al montar
  useEffect(() => {
    if (targetUserId) {
      loadUserData()
    }
  }, [targetUserId])

  // Auto-ocultar mensajes después de 5 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  /**
   * Cargar datos del usuario
   */
  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos del usuario
      const userResponse = await userService.getUserById(targetUserId)

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data)

        // Si es propietario, cargar sus mascotas
        if (userResponse.data.rol === 'propietario' && userResponse.data.propietario_id) {
          await loadPets(userResponse.data.propietario_id)  // ✅ Usa propietario_id (tabla propietarios)
        }

        // Si es veterinario, cargar sus citas
        if (userResponse.data.rol === 'veterinario') {
          await loadAppointments(targetUserId)
        }
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err)
      setError(err.message || 'Error al cargar la información del usuario')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar mascotas del propietario
   */
  const loadPets = async (ownerId) => {
    try {
      console.log('🐾 Obteniendo mascotas para propietario_id:', ownerId)
      const petsResponse = await petService.getPetsByOwner(ownerId)

      if (petsResponse.success && petsResponse.data) {
        console.log('✅ Mascotas obtenidas:', petsResponse.data.mascotas?.length || 0)
        setPets(petsResponse.data.pets || [])
      }
    } catch (err) {
      console.error('❌ Error al cargar mascotas:', err)
      // No mostramos error aquí, solo log
    }
  }

  /**
   * Cargar citas del veterinario
   */
  const loadAppointments = async (veterinarioId) => {
    try {
      const appointmentsResponse = await appointmentService.getAppointmentsByVeterinarian(
        veterinarioId,
        { limit: 50 } // Limitar a las últimas 50 citas
      )

      if (appointmentsResponse.success && appointmentsResponse.data) {
        setAppointments(appointmentsResponse.data.citas || [])
      }
    } catch (err) {
      console.error('Error al cargar citas:', err)
      // No mostramos error aquí, solo log
    }
  }

  /**
   * Manejar cambio en inputs de contraseña
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Validar formulario de contraseña
   */
  const validatePasswordForm = () => {
    if (!passwordData.oldPassword) {
      throw new Error('La contraseña actual es requerida')
    }

    if (!passwordData.newPassword) {
      throw new Error('La nueva contraseña es requerida')
    }

    if (passwordData.newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres')
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }
  }

  /**
   * Cambiar contraseña
   */
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError(null)

    try {
      // Validar formulario
      validatePasswordForm()

      setPasswordLoading(true)

      // Llamar al servicio
      await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      )

      // Éxito
      setSuccess('Contraseña actualizada correctamente')
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Cambiar a pestaña de información
      setTimeout(() => {
        setActiveTab('informacion')
      }, 2000)
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      setPasswordError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Formatear fecha y hora
   */
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtener badge de estado de cita
   */
  const getAppointmentStatusBadge = (estado) => {
    const statusMap = {
      AGENDADA: { label: 'Agendada', className: 'badge-scheduled' },
      CONFIRMADA: { label: 'Confirmada', className: 'badge-confirmed' },
      ATENDIDA: { label: 'Atendida', className: 'badge-completed' },
      CANCELADA: { label: 'Cancelada', className: 'badge-cancelled' }
    }

    const status = statusMap[estado] || { label: estado, className: 'badge-default' }

    return (
      <span className={`appointment-badge ${status.className}`}>
        {status.label}
      </span>
    )
  }

  // Renderizado de carga
  if (loading) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-page__loading">
          <div className="spinner"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    )
  }

  // Renderizado de error
  if (error && !user) {
    return (
      <div className="user-detail-page">
        <Alert variant="error" onClose={() => navigate(-1)}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Volver
        </Button>
      </div>
    )
  }

  // Renderizado sin usuario
  if (!user) {
    return (
      <div className="user-detail-page">
        <Alert variant="error">
          Usuario no encontrado
        </Alert>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="user-detail-page">
      {/* Header */}
      <div className="user-detail-page__header">
        <div className="user-detail-page__header-content">
          <div className="user-detail-page__avatar">
            <span className="user-detail-page__avatar-icon">
              {user.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="user-detail-page__header-info">
            <h1 className="user-detail-page__title">
              {isOwnProfile ? 'Mi Perfil' : user.nombre}
            </h1>
            <p className="user-detail-page__subtitle">
              {isOwnProfile
                ? 'Gestiona la información de tu cuenta y tus datos personales'
                : `Información del usuario • ${user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}`
              }
            </p>
          </div>
        </div>
        {!isOwnProfile && (
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        )}
      </div>

      {/* Mensajes */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <div className="user-detail-page__tabs">
        <button
          className={`user-detail-page__tab ${activeTab === 'informacion' ? 'user-detail-page__tab--active' : ''}`}
          onClick={() => setActiveTab('informacion')}
        >
          Información Personal
        </button>

        {user.rol === 'propietario' && (
          <button
            className={`user-detail-page__tab ${activeTab === 'mascotas' ? 'user-detail-page__tab--active' : ''}`}
            onClick={() => setActiveTab('mascotas')}
          >
            Mis Mascotas
            {pets.length > 0 && (
              <span className="user-detail-page__tab-badge">{pets.length}</span>
            )}
          </button>
        )}

        {user.rol === 'veterinario' && (
          <button
            className={`user-detail-page__tab ${activeTab === 'citas' ? 'user-detail-page__tab--active' : ''}`}
            onClick={() => setActiveTab('citas')}
          >
            Mis Citas
            {appointments.length > 0 && (
              <span className="user-detail-page__tab-badge">{appointments.length}</span>
            )}
          </button>
        )}

        {isOwnProfile && (
          <button
            className={`user-detail-page__tab ${activeTab === 'seguridad' ? 'user-detail-page__tab--active' : ''}`}
            onClick={() => setActiveTab('seguridad')}
          >
            Seguridad
          </button>
        )}
      </div>

      {/* Contenido de pestañas */}
      <div className="user-detail-page__content">
        {/* Pestaña: Información Personal */}
        {activeTab === 'informacion' && (
          <Card className="user-detail-page__info-card">
            <h2 className="user-detail-page__section-title">Información Personal</h2>
            <div className="user-detail-page__info-grid">
              <div className="user-detail-page__info-item">
                <span className="user-detail-page__info-label">Nombre Completo</span>
                <span className="user-detail-page__info-value">{user.nombre}</span>
              </div>

              <div className="user-detail-page__info-item">
                <span className="user-detail-page__info-label">Correo Electrónico</span>
                <span className="user-detail-page__info-value">{user.correo}</span>
              </div>

              <div className="user-detail-page__info-item">
                <span className="user-detail-page__info-label">Teléfono</span>
                <span className="user-detail-page__info-value">{user.telefono || 'No especificado'}</span>
              </div>

              {user.documento && (
                <div className="user-detail-page__info-item">
                  <span className="user-detail-page__info-label">Documento</span>
                  <span className="user-detail-page__info-value">{user.documento}</span>
                </div>
              )}

              <div className="user-detail-page__info-item">
                <span className="user-detail-page__info-label">Rol</span>
                <span className="user-detail-page__info-value">
                  <span className={`role-badge role-badge--${user.rol}`}>
                    {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                  </span>
                </span>
              </div>

              <div className="user-detail-page__info-item">
                <span className="user-detail-page__info-label">Estado</span>
                <span className="user-detail-page__info-value">
                  <span className={`status-badge ${user.activo ? 'status-badge--active' : 'status-badge--inactive'}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
              </div>

              <div className="user-detail-page__info-item">
                <span className="user-detail-page__info-label">Fecha de Registro</span>
                <span className="user-detail-page__info-value">{formatDate(user.fecha_creacion)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Pestaña: Mascotas (solo para propietarios) */}
        {activeTab === 'mascotas' && user.rol === 'propietario' && (
          <div className="user-detail-page__pets-section">
            <div className="user-detail-page__section-header">
              <h2 className="user-detail-page__section-title">Mascotas Registradas</h2>
              <Button size="small">
                + Agregar Mascota
              </Button>
            </div>

            {pets.length === 0 ? (
              <Card className="user-detail-page__empty-state">
                <div className="user-detail-page__empty-icon">🐾</div>
                <p className="user-detail-page__empty-text">
                  No hay mascotas registradas
                </p>
                <p className="user-detail-page__empty-subtext">
                  Agrega una mascota para comenzar
                </p>
              </Card>
            ) : (
              <div className="user-detail-page__pets-grid">
                {pets.map((pet) => (
                  <Card key={pet.id} className="user-detail-page__pet-card">
                    <div className="user-detail-page__pet-icon">
                      {pet.especie === 'perro' ? '🐕' : '🐈'}
                    </div>
                    <h3 className="user-detail-page__pet-name">{pet.nombre}</h3>
                    <div className="user-detail-page__pet-info">
                      <p><strong>Especie:</strong> {pet.especie}</p>
                      <p><strong>Raza:</strong> {pet.raza}</p>
                      {pet.fecha_nacimiento && (
                        <p><strong>Edad:</strong> {calculateAge(pet.fecha_nacimiento)}</p>
                      )}
                      {pet.microchip && (
                        <p><strong>Microchip:</strong> {pet.microchip}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Citas (solo para veterinarios) */}
        {activeTab === 'citas' && user.rol === 'veterinario' && (
          <div className="user-detail-page__appointments-section">
            <div className="user-detail-page__section-header">
              <h2 className="user-detail-page__section-title">Citas Agendadas</h2>
            </div>

            {appointments.length === 0 ? (
              <Card className="user-detail-page__empty-state">
                <div className="user-detail-page__empty-icon">📅</div>
                <p className="user-detail-page__empty-text">
                  No hay citas registradas
                </p>
              </Card>
            ) : (
              <Card className="user-detail-page__appointments-table">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Mascota</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{formatDateTime(appointment.fecha_hora)}</td>
                          <td>{appointment.mascota?.nombre || 'N/A'}</td>
                          <td>{appointment.servicio?.nombre || 'N/A'}</td>
                          <td>{getAppointmentStatusBadge(appointment.estado)}</td>
                          <td>{appointment.motivo || 'Sin motivo especificado'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Pestaña: Seguridad (solo para perfil propio) */}
        {activeTab === 'seguridad' && isOwnProfile && (
          <Card className="user-detail-page__security-card">
            <h2 className="user-detail-page__section-title">Cambiar Contraseña</h2>
            <p className="user-detail-page__section-subtitle">
              Actualiza tu contraseña regularmente para mantener tu cuenta segura
            </p>

            {passwordError && (
              <Alert variant="error" onClose={() => setPasswordError(null)}>
                {passwordError}
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="user-detail-page__password-form">
              <Input
                label="Contraseña Actual"
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu contraseña actual"
                required
              />

              <Input
                label="Nueva Contraseña"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu nueva contraseña"
                required
              />

              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirma tu nueva contraseña"
                required
              />

              <div className="user-detail-page__password-requirements">
                <p className="user-detail-page__password-requirements-title">
                  Requisitos de la contraseña:
                </p>
                <ul>
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                </ul>
              </div>

              <Button
                type="submit"
                loading={passwordLoading}
                fullWidth
              >
                Actualizar Contraseña
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * Calcular edad de la mascota
 */
function calculateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (years > 0) {
    return `${years} año${years > 1 ? 's' : ''}`
  } else {
    return `${months} mes${months > 1 ? 'es' : ''}`
  }
}

export default UserDetailPage