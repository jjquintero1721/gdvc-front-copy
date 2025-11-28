import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import userService from '@/services/userService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import '../users/UsersPage.css'
import './OwnerPage.css'

function PropietariosPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore(state => state.user)

  // ⚠ Validar roles permitidos
  useEffect(() => {
    if (!['superadmin', 'veterinario', 'auxiliar'].includes(currentUser?.rol)) {
      navigate('/') // Redirigir si no tiene permisos
    }
  }, [currentUser])

  const [owners, setOwners] = useState([])
  const [filteredOwners, setFilteredOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadOwners()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [owners, searchTerm])

  const loadOwners = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await userService.getAllUsers({ rol: 'propietario' })

      if (res.success && res.data) {
          const propietarios = res.data.usuarios.filter(
            user => user.rol === 'propietario'
          )
      setOwners(propietarios)
      } else {
        setOwners([])
      }
    } catch (err) {
      setError(err.message || 'Error al cargar propietarios')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...owners]

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(o =>
        o.nombre.toLowerCase().includes(search) ||
        o.correo.toLowerCase().includes(search)
      )
    }

    setFilteredOwners(filtered)
  }

  const handleSearch = () => {
    applyFilters()
  }

  const handleClear = () => {
    setSearchTerm('')
    loadOwners()
  }

  const handleViewOwner = (owner) => {
    navigate(`/usuarios/${owner.id}`)
  }

  const stats = {
    total: owners.length,
    activos: owners.filter(u => u.activo).length,
    inactivos: owners.filter(u => !u.activo).length,
    filtrados: filteredOwners.length
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-page__header">
        <div className="users-page__header-content">
          <h1 className="users-page__title">Gestión de Propietarios</h1>
          <p className="users-page__subtitle">Lista de propietarios registrados en el sistema</p>
        </div>
      </div>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Filtros - ESTRUCTURA MEJORADA */}
        <div className="owners-page__filters">
          <div className="owners-page__filters-row">
            {/* Campo de búsqueda */}
            <div className="owners-page__search">
              <Input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="🔍"
              />
            </div>

            {/* Botón Recargar */}
            <button
              className="owners-page__reload-button"
              onClick={loadOwners}
              disabled={loading}
            >
              🔄 Recargar
            </button>
          </div>
        </div>

      {/* Estadísticas */}
      <div className="users-page__stats">
        <div className="users-page__stat-card users-page__stat-card--primary">
          <div className="users-page__stat-value">{stats.total}</div>
          <div className="users-page__stat-label">TOTAL PROPIETARIOS</div>
        </div>

        <div className="users-page__stat-card users-page__stat-card--success">
          <div className="users-page__stat-value">{stats.activos}</div>
          <div className="users-page__stat-label">ACTIVOS</div>
        </div>

        <div className="users-page__stat-card users-page__stat-card--danger">
          <div className="users-page__stat-value">{stats.inactivos}</div>
          <div className="users-page__stat-label">INACTIVOS</div>
        </div>

        <div className="users-page__stat-card users-page__stat-card--info">
          <div className="users-page__stat-value">{stats.filtrados}</div>
          <div className="users-page__stat-label">FILTRADOS</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="users-page__table-container">
        {loading ? (
          <div className="users-page__loading">
            <div className="users-page__loading-spinner"></div>
            <p>Cargando propietarios...</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="users-page__empty">
            <p>No se encontraron propietarios</p>
          </div>
        ) : (
          <table className="users-page__table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>CORREO</th>
                <th>TELÉFONO</th>
                <th>ESTADO</th>
                <th>FECHA REGISTRO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              {filteredOwners.map(owner => (
                <tr key={owner.id} className="users-page__table-row">
                  <td className="users-page__table-cell">{owner.nombre}</td>
                  <td className="users-page__table-cell">{owner.correo}</td>
                  <td className="users-page__table-cell">{owner.telefono || 'N/A'}</td>

                  <td className="users-page__table-cell">
                    <span
                      className={`users-page__status-badge ${
                        owner.activo
                          ? 'users-page__status-badge--active'
                          : 'users-page__status-badge--inactive'
                      }`}
                    >
                      {owner.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="users-page__table-cell">
                    {new Date(owner.fecha_creacion).toLocaleDateString('es-ES')}
                  </td>

                  <td className="users-page__table-cell users-page__table-cell--actions">
                    <Button size="small" onClick={() => handleViewOwner(owner)}>
                      Ver Perfil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default PropietariosPage
