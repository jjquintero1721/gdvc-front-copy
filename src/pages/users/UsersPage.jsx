import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import userService from '@/services/userService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import UserModal from '@/components/users/UserModal'
import './UsersPage.css'

/**
 * Página de Gestión de Usuarios
 * RF-02 | Gestión de usuarios internos (Solo SUPERADMIN)
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

  // Estados de modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalMode, setModalMode] = useState('view') // view, edit

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, filterRole, filterStatus])

  /**
   * Cargar todos los usuarios desde el backend
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await userService.getAllUsers({
        skip: 0,
        limit: 100,
        activo: null // Traer todos (activos e inactivos)
      })

      if (response.status === 'success' && response.data) {
        setUsers(response.data.usuarios || [])
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

    // Filtro de búsqueda (nombre o correo)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(search) ||
          user.correo.toLowerCase().includes(search)
      )
    }

    // Filtro por rol
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.rol === filterRole)
    }

    // Filtro por estado
    if (filterStatus === 'active') {
      filtered = filtered.filter((user) => user.activo === true)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((user) => user.activo === false)
    }

    setFilteredUsers(filtered)
  }

  /**
   * Abrir modal para ver detalles de usuario
   */
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setModalMode('view')
    setModalOpen(true)
  }

  /**
   * Abrir modal para editar usuario
   */
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  /**
   * Activar usuario
   */
  const handleActivateUser = async (userId) => {
    if (!confirm('¿Estás seguro de que deseas activar este usuario?')) {
      return
    }

    try {
      const response = await userService.activateUser(userId)

      if (response.status === 'success') {
        setSuccess('Usuario activado exitosamente')
        loadUsers() // Recargar lista
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      console.error('Error al activar usuario:', err)
      setError(err.message || 'Error al activar el usuario')
      setTimeout(() => setError(null), 5000)
    }
  }

  /**
   * Desactivar usuario
   */
  const handleDeactivateUser = async (userId) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario? No podrá acceder al sistema.')) {
      return
    }

    try {
      const response = await userService.deactivateUser(userId)

      if (response.status === 'success') {
        setSuccess('Usuario desactivado exitosamente')
        loadUsers() // Recargar lista
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      console.error('Error al desactivar usuario:', err)
      setError(err.message || 'Error al desactivar el usuario')
      setTimeout(() => setError(null), 5000)
    }
  }

  /**
   * Guardar cambios del modal
   */
  const handleSaveUser = async (userData) => {
    try {
      const response = await userService.updateUser(userData.id, {
        nombre: userData.nombre,
        telefono: userData.telefono
      })

      if (response.status === 'success') {
        setSuccess('Usuario actualizado exitosamente')
        setModalOpen(false)
        loadUsers()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      console.error('Error al actualizar usuario:', err)
      throw err // El modal manejará el error
    }
  }

  /**
   * Obtener el ícono según el rol
   */
  const getRoleIcon = (role) => {
    const icons = {
      superadmin: '👑',
      veterinario: '⚕️',
      auxiliar: '🩺',
      propietario: '👤'
    }
    return icons[role] || '👤'
  }

  /**
   * Obtener el color de la badge según el rol
   */
  const getRoleBadgeClass = (role) => {
    const classes = {
      superadmin: 'user-badge--superadmin',
      veterinario: 'user-badge--veterinario',
      auxiliar: 'user-badge--auxiliar',
      propietario: 'user-badge--propietario'
    }
    return classes[role] || 'user-badge--default'
  }

  // Verificar que el usuario actual sea superadmin
  if (currentUser?.rol !== 'superadmin') {
    return (
      <div className="users-page">
        <Alert
          type="error"
          message="Acceso denegado. Solo el SUPERADMIN puede acceder a esta página."
        />
      </div>
    )
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-page__header">
        <div>
          <h1 className="users-page__title">Gestión de Usuarios</h1>
          <p className="users-page__subtitle">
            Administra todos los usuarios del sistema
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Filtros y Búsqueda */}
      <div className="users-page__filters">
        <div className="users-page__search">
          <Input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
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

          <Button onClick={loadUsers} variant="outline">
            🔄 Recargar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="users-page__stats">
        <div className="user-stat-card">
          <div className="user-stat-card__value">{users.length}</div>
          <div className="user-stat-card__label">Total Usuarios</div>
        </div>
        <div className="user-stat-card user-stat-card--success">
          <div className="user-stat-card__value">
            {users.filter((u) => u.activo).length}
          </div>
          <div className="user-stat-card__label">Activos</div>
        </div>
        <div className="user-stat-card user-stat-card--danger">
          <div className="user-stat-card__value">
            {users.filter((u) => !u.activo).length}
          </div>
          <div className="user-stat-card__label">Inactivos</div>
        </div>
        <div className="user-stat-card user-stat-card--info">
          <div className="user-stat-card__value">{filteredUsers.length}</div>
          <div className="user-stat-card__label">Filtrados</div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {loading ? (
        <div className="users-page__loading">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-page__empty">
          <p>No se encontraron usuarios con los filtros aplicados</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
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
                <tr key={user.id} className={!user.activo ? 'user-row--inactive' : ''}>
                  <td>
                    <div className="user-cell">
                      <span className="user-cell__icon">
                        {getRoleIcon(user.rol)}
                      </span>
                      <span className="user-cell__name">{user.nombre}</span>
                    </div>
                  </td>
                  <td>{user.correo}</td>
                  <td>{user.telefono || 'No especificado'}</td>
                  <td>
                    <span className={`user-badge ${getRoleBadgeClass(user.rol)}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.activo ? 'status-badge--active' : 'status-badge--inactive'
                      }`}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {user.fecha_creacion
                      ? new Date(user.fecha_creacion).toLocaleDateString('es-CO')
                      : 'N/A'}
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="action-btn action-btn--view"
                        onClick={() => handleViewUser(user)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => handleEditUser(user)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {user.activo ? (
                        <button
                          className="action-btn action-btn--deactivate"
                          onClick={() => handleDeactivateUser(user.id)}
                          title="Desactivar"
                          disabled={user.id === currentUser.id}
                        >
                          🚫
                        </button>
                      ) : (
                        <button
                          className="action-btn action-btn--activate"
                          onClick={() => handleActivateUser(user.id)}
                          title="Activar"
                        >
                          ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Usuario */}
      {modalOpen && (
        <UserModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          user={selectedUser}
          mode={modalMode}
          onSave={handleSaveUser}
        />
      )}
    </div>
  )
}

export default UsersPage