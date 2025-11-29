import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import petService from '@/services/petService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import PetGrid from '@/components/pets/PetGrid'
import './PetsPage.css'

/**
 * Página de Gestión de Mascotas
 * RF-04 | Registro de mascotas
 *
 * Permisos por rol:
 * - SUPERADMIN, VETERINARIO, AUXILIAR: Ver todas las mascotas + crear
 * - PROPIETARIO: Ver solo sus mascotas + crear
 *
 * Funcionalidades:
 * - Listar mascotas con paginación
 * - Buscar por nombre
 * - Filtrar por especie (todos, perro, gato)
 * - Filtrar por estado (activo/inactivo)
 * - Crear nueva mascota
 * - Ver detalles de mascota
 *
 * Integrado con:
 * - PetGrid: Grid responsivo con tarjetas profesionales
 * - Backend: /patients/pets endpoints
 */
function PetsPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [pets, setPets] = useState([])
  const [filteredPets, setFilteredPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecies, setFilterSpecies] = useState('all') // all, perro, gato
  const [filterStatus, setFilterStatus] = useState('active') // all, active, inactive

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPets, setTotalPets] = useState(0)
  const pageSize = 6 // Mascotas por página

  // Verificar permisos
  const canViewAll = ['superadmin', 'veterinario', 'auxiliar'].includes(currentUser?.rol)
  const canCreate = ['superadmin', 'veterinario', 'auxiliar'].includes(currentUser?.rol)

  /**
   * Cargar mascotas según el rol del usuario
   */
  useEffect(() => {
    loadPets()
  }, [currentPage, filterSpecies, filterStatus])

  const loadPets = async () => {
    try {
      setLoading(true)
      setError(null)

      let response

      if (canViewAll) {
        // Staff: ver todas las mascotas
        response = await petService.getAllPets({
          page: currentPage,
          pageSize,
          activo: filterStatus === 'all' ? null : filterStatus === 'active'
        })
      } else {
        // Propietario: ver solo sus mascotas
        const ownerResponse = await petService.getPetsByOwner(currentUser.propietario_id)
        response = {
          success: true,
          data: {
            pets: ownerResponse.data?.mascotas || ownerResponse.data?.pets || [],
            total: ownerResponse.data?.mascotas?.length || 0,
            page: 1,
            page_size: 6,
            total_pages: 100
          }
        }
      }

      if (response.success && response.data) {
        const petsData = response.data.pets || []
        setPets(petsData)
        setTotalPets(response.data.total || petsData.length)
        setTotalPages(response.data.total_pages || 1)
        setCurrentPage(response.data.page || 1)
      }
    } catch (err) {
      console.error('Error al cargar mascotas:', err)
      setError(err.message || 'Error al cargar las mascotas')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aplicar filtros de búsqueda y especie
   */
  useEffect(() => {
    let result = [...pets]

    // Filtro por búsqueda (nombre)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      result = result.filter(pet =>
        pet.nombre?.toLowerCase().includes(search)
      )
    }

    // Filtro por especie
    if (filterSpecies !== 'all') {
      result = result.filter(pet =>
        pet.especie?.toLowerCase() === filterSpecies.toLowerCase()
      )
    }

    setFilteredPets(result)
  }, [pets, searchTerm, filterSpecies])

  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /**
   * Navegar a crear mascota
   */
  const handleCreatePet = () => {
    navigate('/mascotas/crear')
  }

  /**
   * Navegar a editar mascota
   */
  const handleEditPet = (pet) => {
    navigate(`/mascotas/${pet.id}/editar`)
  }

  /**
   * Limpiar mensajes después de 5 segundos
   */
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="pets-page">
      {/* Header */}
      <div className="pets-page__header">
        <div className="pets-page__header-content">
          <div className="pets-page__title-section">
            <h1 className="pets-page__title">
              {canViewAll ? 'Gestión de Mascotas' : 'Mis Mascotas'}
            </h1>
            <p className="pets-page__subtitle">
              {canViewAll
                ? `${totalPets} mascota${totalPets !== 1 ? 's' : ''} registrada${totalPets !== 1 ? 's' : ''} en el sistema`
                : `Tienes ${totalPets} mascota${totalPets !== 1 ? 's' : ''} registrada${totalPets !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          {canCreate && (
            <Button onClick={handleCreatePet} variant="primary">
              + Registrar Mascota
            </Button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros y búsqueda - ESTRUCTURA MEJORADA */}
        <div className="pets-page__filters">
          <div className="pets-page__filters-row">
            {/* Campo de búsqueda */}
            <div className="pets-page__search">
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="🔍"
              />
            </div>

            <div className="pets-page__filter-group">
              {/* Filtro por especie */}
              <div className="pets-page__filter">
                <label className="pets-page__filter-label">Especie:</label>
                <select
                  className="pets-page__filter-select"
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                >
                  <option value="all">Todas</option>
                  <option value="perro">Perros</option>
                  <option value="gato">Gatos</option>
                </select>
              </div>

              {/* Filtro por estado (solo para staff) */}
              {canViewAll && (
                <div className="pets-page__filter">
                  <label className="pets-page__filter-label">Estado:</label>
                  <select
                    className="pets-page__filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Grid de mascotas */}
      <div className="pets-page__content">
        <PetGrid
          pets={filteredPets}
          loading={loading}
          onAddPet={canCreate ? handleCreatePet : null}
          onEditPet={handleEditPet}
          emptyMessage={
            searchTerm || filterSpecies !== 'all'
              ? 'No se encontraron mascotas con los filtros aplicados'
              : canViewAll
                ? 'No hay mascotas registradas en el sistema'
                : 'No tienes mascotas registradas aún'
          }
        />
      </div>

      {/* Paginación (solo para staff con múltiples páginas) */}
      {canViewAll && totalPages > 1 && !loading && (
        <div className="pets-page__pagination">
          <Button
            variant="secondary"
            size="small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Anterior
          </Button>

          <div className="pets-page__pagination-info">
            Página {currentPage} de {totalPages}
          </div>

          <Button
            variant="secondary"
            size="small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  )
}

export default PetsPage