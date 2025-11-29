import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import userService from '@/services/userService'
import petService from '@/services/petService'
import appointmentService from '@/services/appointmentService'
import authService from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import PetGrid from '@/components/pets/PetGrid'
import './UserDetailPage.css'
import AuxiliarCard from '@/components/users/AuxiliarCard.jsx'
import VeterinarioInfoCard from '@/components/users/VeterinarioInfoCard.jsx'
import userMeService from "@/services/userMeService.js";

/**
 * Página de Detalle de Usuario - MEJORADA
 * Muestra información completa del usuario según su rol:
 * - Propietario: información + mascotas + cambio de contraseña
 * - Veterinario: información + citas + cambio de contraseña
 * - Auxiliar: información + cambio de contraseña
 *
 *
 * Esta página se reutiliza para:
 * 1. Ver usuarios desde la gestión (UsersPage)
 * 2. Ver el perfil propio (desde el botón inferior del Sidebar)
 */
function UserDetailPage() {
  const { userId } = useParams() // Si viene de la URL
  const navigate = useNavigate()
  const currentUser = useAuthStore(state => state.user)
  const [auxiliares, setAuxiliares] = useState([])
  const [veterinario, setVeterinario] = useState(null)

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
    contrasena_actual: '',
    contrasena_nueva: '',
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
          await loadPets(userResponse.data.propietario_id)  //  Usa propietario_id (tabla propietarios)
        }

        // Si es veterinario, cargar sus citas
        if (userResponse.data.rol === 'veterinario') {
          await loadAppointments(targetUserId)
        }
      // Si el usuario es veterinario, cargar sus auxiliares
        if (userResponse.data.rol === 'veterinario') {
          const auxRes = await userMeService.getMyAuxiliares()
          if (auxRes.success && auxRes.data) {
            setAuxiliares(auxRes.data.auxiliares || [])
          }
        }

        // Si el usuario es auxiliar, cargar su veterinario encargado
        if (userResponse.data.rol === 'auxiliar') {
          const vetRes = await userMeService.getMyVeterinario()
          if (vetRes.success) {
              setVeterinario(vetRes.data || vetRes.data?.veterinario || null)
            }
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
        setPets(petsResponse.data.pets || petsResponse.data.mascotas || [])
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
  // Validar contraseña actual
  if (!passwordData.oldPassword) {
    throw new Error('La contraseña actual es requerida')
  }

  // Validar nueva contraseña
  if (!passwordData.newPassword) {
    throw new Error('La nueva contraseña es requerida')
  }

  if (passwordData.newPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres')
  }

  // Validar confirmación
  if (!passwordData.confirmPassword) {
    throw new Error('Debes confirmar la nueva contraseña')
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    throw new Error('Las contraseñas no coinciden')
  }

  // Validar que la nueva sea diferente a la actual
  if (passwordData.oldPassword === passwordData.newPassword) {
    throw new Error('La nueva contraseña debe ser diferente a la actual')
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
        targetUserId,
        passwordData.contrasena_actual,
        passwordData.contrasena_nueva
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
        {user.rol === 'veterinario' && (
          <button
            className={`user-detail-page__tab ${
              activeTab === 'auxiliares' ? 'user-detail-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab('auxiliares')}
          >
            Mis Auxiliares
            {auxiliares.length > 0 && (
              <span className="user-detail-page__tab-badge">{auxiliares.length}</span>
            )}
          </button>
        )}
        {user.rol === 'auxiliar' && (
          <button
            className={`user-detail-page__tab ${
              activeTab === 'veterinario' ? 'user-detail-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab('veterinario')}
          >
            Mi Veterinario
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

        {/* Pestaña: Mascotas (solo para propietarios) - MEJORADO CON PetGrid */}
        {activeTab === 'mascotas' && user.rol === 'propietario' && (
          <div className="user-detail-page__pets-section">
            <div className="user-detail-page__section-header">
              <h2 className="user-detail-page__section-title">Mascotas Registradas</h2>
              {isOwnProfile && (
                <Button size="small" onClick={() => navigate('/mascotas/crear')}>
                  + Agregar Mascota
                </Button>
              )}
            </div>

            {/* ✨ AQUÍ ESTÁ LA MEJORA: Uso de PetGrid en lugar del renderizado básico */}
            <PetGrid
              pets={pets}
              loading={false}
              onAddPet={isOwnProfile ? () => navigate('/mascotas/crear') : null}
              onEditPet={isOwnProfile ? (pet) => navigate(`/mascotas/${pet.id}/editar`) : null}
              emptyMessage="No hay mascotas registradas"
            />
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
                  <table className="table" style={{ width: '100%', tableLayout: 'auto' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '180px', padding: '12px' }}>Fecha y Hora</th>
                        <th style={{ minWidth: '150px', padding: '12px' }}>Mascota</th>
                        <th style={{ minWidth: '200px', padding: '12px' }}>Servicio</th>
                        <th style={{ minWidth: '130px', padding: '12px', textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                            {formatDateTime(appointment.fecha_hora)}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {appointment.mascota?.nombre || 'N/A'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {appointment.servicio?.nombre || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {getAppointmentStatusBadge(appointment.estado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
        {activeTab === 'auxiliares' && user.rol === 'veterinario' && (
          <div className="user-detail-page__pets-section">
            <div className="user-detail-page__section-header">
              <h2 className="user-detail-page__section-title">Mis Auxiliares</h2>
            </div>

            {auxiliares.length === 0 ? (
              <Card className="user-detail-page__empty-state">
                <div className="user-detail-page__empty-icon">👥</div>
                <p className="user-detail-page__empty-text">
                  No tienes auxiliares asignados actualmente
                </p>
              </Card>
            ) : (
              <div className="user-detail-page__pets-grid">
                {auxiliares.map(aux => (
                  <AuxiliarCard key={aux.id} auxiliar={aux} />
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'veterinario' && user.rol === 'auxiliar' && (
          <div className="user-detail-page__pets-section">
            <h2 className="user-detail-page__section-title">Mi Veterinario Encargado</h2>

            {!veterinario ? (
              <Card className="user-detail-page__empty-state">
                <div className="user-detail-page__empty-icon">🩺</div>
                <p className="user-detail-page__empty-text">
                  No tienes un veterinario asignado actualmente.
                </p>
              </Card>
            ) : (
              <VeterinarioInfoCard veterinario={veterinario} />
            )}
          </div>
        )}
        {/* Pestaña: Seguridad (solo para perfil propio) */}
        {activeTab === 'seguridad' && isOwnProfile && (
          <div className="user-detail-page__security-container">

            {/* ================================
                🔵 FORMULARIO ACTUALIZAR INFORMACIÓN
            ================================= */}
            <Card className="user-detail-page__security-card">
              <h2 className="user-detail-page__section-title">Actualizar Información</h2>
              <p className="user-detail-page__section-subtitle">
                Modifica tus datos personales y mantén tu información actualizada.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()

                  const updatedData = {
                    nombre: user.nombre,
                    telefono: user.telefono,
                    documento: user.documento,
                    correo: user.correo,
                  }

                  try {
                    setLoading(true)
                    const response = await userService.updateUser(user.id, updatedData)

                    if (response.success) {
                      setSuccess("Información actualizada correctamente")
                      loadUserData()   // recargar datos en pantalla
                    } else {
                      setError("No se pudo actualizar la información")
                    }
                  } catch (err) {
                    setError(err.message || "Error al actualizar información")
                  } finally {
                    setLoading(false)
                  }
                }}
                className="user-detail-page__password-form"
              >
                <Input
                  label="Nombre Completo"
                  value={user.nombre}
                  onChange={(e) => setUser({ ...user, nombre: e.target.value })}
                  required
                />

                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={user.correo}
                  onChange={(e) => setUser({ ...user, correo: e.target.value })}
                  required
                />

                <Input
                  label="Teléfono"
                  value={user.telefono || ""}
                  onChange={(e) => setUser({ ...user, telefono: e.target.value })}
                />

                <Input
                  label="Documento"
                  value={user.documento || ""}
                  onChange={(e) => setUser({ ...user, documento: e.target.value })}
                />

                <Button type="submit" fullWidth>
                  Guardar Cambios
                </Button>
              </form>
            </Card>

            {/* ========================================
                🟣 CAMBIAR CONTRASEÑA (EXISTENTE)
            ======================================== */}
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

                <Button type="submit" loading={passwordLoading} fullWidth>
                  Actualizar Contraseña
                </Button>
              </form>
            </Card>

          </div>
        )}

      </div>
    </div>
  )
}

/**
 * Calcular edad de la mascota
 * NOTA: Esta función se mantiene por compatibilidad, pero PetCard ya usa dateUtils
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