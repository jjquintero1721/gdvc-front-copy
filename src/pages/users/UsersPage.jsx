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

      console.log('📦 Respuesta del backend:', response)

      // ✅ CORRECCIÓN: El backend devuelve { success: true, data: { total, usuarios: [...] } }
      // No es { status: 'success', data: {...} }
      if (response.success && response.data) {
        const usuariosArray = response.data.usuarios || []
        console.log('✅ Usuarios cargados:', usuariosArray.length)
        setUsers(usuariosArray)
      } else {
        console.warn('⚠️ Respuesta sin usuarios:', response)
        setUsers([])
      }
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err)
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

    // Filtro de búsqueda por nombre o correo
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.nombre?.toLowerCase().includes(searchLower) ||
        user.correo?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por rol
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.rol === filterRole)
    }

    // Filtro por estado (activo/inactivo)
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
      // Si no hay término de búsqueda, recargar todos
      await loadUsers()
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await userService.searchUsers(searchTerm)

      // ✅ CORRECCIÓN: Usar response.success en lugar de response.status
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
   * Activar/Desactivar usuario
   */
  const handleToggleUserStatus = async (user) => {
    if (!window.confirm(`¿Estás seguro de ${user.activo ? 'desactivar' : 'activar'} a ${user.nombre}?`)) {
      return
    }

    try {
      setError(null)

      const response = user.activo
        ? await userService.deactivateUser(user.id)
        : await userService.activateUser(user.id)

      // ✅ CORRECCIÓN: Usar response.success
      if (response.success) {
        setSuccess(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`)
        await loadUsers()
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      setError(err.message || 'Error al cambiar el estado del usuario')
    }
  }

  /**
   * Guardar cambios del usuario (después de editar en el modal)
   */
  const handleSaveUser = async (userId, userData) => {
    try {
      setError(null)

      const response = await userService.updateUser(userId, userData)

      // ✅ CORRECCIÓN: Usar response.success
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

  // Calcular estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.activo).length,
    inactive: users.filter(u => !u.activo).length,
    filtered: filteredUsers.length
  }

  return (
    <div className="users-page">
      <div className="users-page__header">
        <div className="users-page__header-content">
          <h1 className="users-page__title">Gestión de Usuarios</h1>
          <p className="users-page__subtitle">Administra todos los usuarios del sistema</p>
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

      {/* Filtros y búsqueda */}
      <div className="users-page__filters">
        <div className="users-page__search">
          <Input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

          <Button
            variant="secondary"
            onClick={handleClearFilters}
          >
            🔄 Recargar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="users-page__stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__value">{stats.total}</div>
          <div className="stat-card__label">Total Usuarios</div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__value">{stats.active}</div>
          <div className="stat-card__label">Activos</div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__value">{stats.inactive}</div>
          <div className="stat-card__label">Inactivos</div>
        </div>

        <div className="stat-card stat-card--info">
          <div className="stat-card__value">{stats.filtered}</div>
          <div className="stat-card__label">Filtrados</div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      {loading ? (
        <div className="users-page__loading">
          <p>Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-page__empty">
          <p>No se encontraron usuarios con los filtros aplicados</p>
        </div>
      ) : (
        <div className="users-page__table-container">
          <table className="users-table">
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
                <tr key={user.id} className={!user.activo ? 'user-row--inactive' : ''}>
                  <td>{user.nombre}</td>
                  <td>{user.correo}</td>
                  <td>{user.telefono || 'N/A'}</td>
                  <td>
                    <span className={`role-badge role-badge--${user.rol}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${user.activo ? 'active' : 'inactive'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {user.fecha_creacion
                      ? new Date(user.fecha_creacion).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <div className="users-table__actions">
                      <button
                        className="btn-icon btn-icon--view"
                        onClick={() => handleViewUser(user)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>

                      {currentUser?.rol === 'superadmin' && (
                        <>
                          <button
                            className="btn-icon btn-icon--edit"
                            onClick={() => handleEditUser(user)}
                            title="Editar"
                          >
                            ✏️
                          </button>

                          <button
                            className={`btn-icon ${user.activo ? 'btn-icon--deactivate' : 'btn-icon--activate'}`}
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.activo ? 'Desactivar' : 'Activar'}
                          >
                            {user.activo ? '🚫' : '✅'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de usuario */}
      {modalOpen && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  )
}

export default UsersPage