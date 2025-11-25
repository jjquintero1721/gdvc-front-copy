import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import userService from '@/services/userService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import ConfirmModal from '@/components/ui/ConfirmModal'
import UserActionsMenu from '@/components/users/UserActionsMenu'
import UserModal from '@/components/users/UserModal'
import './UsersPage.css'

/**
 * Página de Gestión de Usuarios - Versión Mejorada
 * RF-02 | Gestión de usuarios internos (Solo SUPERADMIN)
 *
 * Mejoras implementadas:
 * - Modal de confirmación profesional (reemplaza alert nativo)
 * - Menú de acciones con mejores iconos y tooltips
 * - Animaciones suaves y transiciones
 * - Mejor manejo de estados de carga
 *
 * Funcionalidades:
 * - Listar todos los usuarios con paginación
 * - Buscar usuarios por nombre o correo
 * - Filtrar por rol y estado (activo/inactivo)
 * - Editar información de usuarios
 * - Activar/Desactivar usuarios
 *
 * IMPORTANTE: Esta página solo es accesible para SUPERADMIN
 */
function UsersPage() {
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive

  // Estados de modal de edición/vista
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalMode, setModalMode] = useState('view') // view, edit

  // Estados de modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: null,
    loading: false
  })

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, filterRole, filterStatus])

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
   * Cargar todos los usuarios desde el backend
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await userService.getAllUsers({ skip: 0, limit: 100 })

      if (response.success && response.data) {
        setUsers(response.data.usuarios || [])
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError(err.message || 'Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aplicar filtros de búsqueda, rol y estado
   */
  const applyFilters = () => {
    let filtered = [...users]

    // Filtro de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        user =>
          user.nombre.toLowerCase().includes(search) ||
          user.correo.toLowerCase().includes(search)
      )
    }

    // Filtro de rol
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.rol === filterRole)
    }

    // Filtro de estado
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.activo === true)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => user.activo === false)
    }

    setFilteredUsers(filtered)
  }

  /**
   * Buscar usuarios (cuando el usuario presiona Enter o click en buscar)
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadUsers()
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await userService.searchUsers(searchTerm)

      if (response.success && response.data) {
        setUsers(response.data.usuarios || [])
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Error en búsqueda:', err)
      setError(err.message || 'Error al buscar usuarios')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Limpiar filtros y búsqueda
   */
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterRole('all')
    setFilterStatus('all')
    loadUsers()
  }

  /**
   * Abrir modal para ver detalles de un usuario
   */
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setModalMode('view')
    setModalOpen(true)
  }

  /**
   * Abrir modal para editar un usuario
   */
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  /**
   * Mostrar modal de confirmación para activar/desactivar usuario
   */
  const handleToggleUserStatus = (user) => {
    const isDeactivating = user.activo

    setConfirmModal({
      isOpen: true,
      title: isDeactivating ? '¿Desactivar usuario?' : '¿Activar usuario?',
      message: isDeactivating
        ? `El usuario ${user.nombre} no podrá acceder al sistema hasta que sea reactivado.`
        : `El usuario ${user.nombre} podrá acceder nuevamente al sistema.`,
      variant: isDeactivating ? 'danger' : 'success',
      confirmText: isDeactivating ? 'Desactivar' : 'Activar',
      onConfirm: () => executeToggleUserStatus(user),
      loading: false
    })
  }

  /**
   * Ejecutar la acción de activar/desactivar usuario
   */
  const executeToggleUserStatus = async (user) => {
    try {
      // Activar estado de carga en el modal
      setConfirmModal(prev => ({ ...prev, loading: true }))

      const response = user.activo
        ? await userService.deactivateUser(user.id)
        : await userService.activateUser(user.id)

      if (response.success) {
        setSuccess(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`)

        // Cerrar modal
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          variant: 'warning',
          onConfirm: null,
          loading: false
        })

        // Recargar usuarios
        await loadUsers()
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      setError(err.message || 'Error al cambiar el estado del usuario')

      // Cerrar modal incluso si hay error
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        variant: 'warning',
        onConfirm: null,
        loading: false
      })
    }
  }

  /**
   * Guardar cambios del usuario (después de editar en el modal)
   */
  const handleSaveUser = async (userId, userData) => {
    try {
      setError(null)

      const response = await userService.updateUser(userId, userData)

      if (response.success) {
        setSuccess('Usuario actualizado exitosamente')
        setModalOpen(false)
        await loadUsers()
      }
    } catch (err) {
      console.error('Error al actualizar usuario:', err)
      setError(err.message || 'Error al actualizar el usuario')
    }
  }

  /**
   * Cerrar modal de confirmación
   */
  const handleCloseConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        variant: 'warning',
        onConfirm: null,
        loading: false
      })
    }
  }

  // Calcular estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.activo).length,
    inactive: users.filter(u => !u.activo).length,
    filtered: filteredUsers.length
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-page__header">
        <div className="users-page__header-content">
          <h1 className="users-page__title">Gestión de Usuarios</h1>
          <p className="users-page__subtitle">Administra todos los usuarios del sistema</p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <div className="users-page__filters">
        <div className="users-page__search">
          <Input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <Button onClick={handleSearch} disabled={loading}>
            Buscar
          </Button>
        </div>

        <div className="users-page__filter-group">
          <select
            className="users-page__select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="veterinario">Veterinario</option>
            <option value="auxiliar">Auxiliar</option>
            <option value="propietario">Propietario</option>
          </select>

          <select
            className="users-page__select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <Button variant="secondary" onClick={handleClearFilters}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recargar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="users-page__stats">
        <div className="users-page__stat-card">
          <div className="users-page__stat-value">{stats.total}</div>
          <div className="users-page__stat-label">Total Usuarios</div>
        </div>

        <div className="users-page__stat-card users-page__stat-card--success">
          <div className="users-page__stat-value">{stats.active}</div>
          <div className="users-page__stat-label">Activos</div>
        </div>

        <div className="users-page__stat-card users-page__stat-card--danger">
          <div className="users-page__stat-value">{stats.inactive}</div>
          <div className="users-page__stat-label">Inactivos</div>
        </div>

        <div className="users-page__stat-card users-page__stat-card--info">
          <div className="users-page__stat-value">{stats.filtered}</div>
          <div className="users-page__stat-label">Filtrados</div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="users-page__table-container">
        {loading ? (
          <div className="users-page__loading">
            <div className="users-page__loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-page__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <table className="users-page__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="users-page__table-row">
                  <td className="users-page__table-cell users-page__table-cell--name">
                    {user.nombre}
                  </td>
                  <td className="users-page__table-cell">{user.correo}</td>
                  <td className="users-page__table-cell">{user.telefono || '-'}</td>
                  <td className="users-page__table-cell">
                    <span className={`users-page__role-badge users-page__role-badge--${user.rol}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="users-page__table-cell">
                    <span
                      className={`users-page__status-badge ${
                        user.activo
                          ? 'users-page__status-badge--active'
                          : 'users-page__status-badge--inactive'
                      }`}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="users-page__table-cell">
                    {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                  </td>
                  <td className="users-page__table-cell users-page__table-cell--actions">
                    <UserActionsMenu
                      user={user}
                      onView={handleViewUser}
                      onEdit={handleEditUser}
                      onToggleStatus={handleToggleUserStatus}
                      disabled={loading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de edición/vista de usuario */}
      {modalOpen && (
        <UserModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          user={selectedUser}
          mode={modalMode}
          onSave={handleSaveUser}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText || 'Confirmar'}
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />
    </div>
  )
}

export default UsersPage