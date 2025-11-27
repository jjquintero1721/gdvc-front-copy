import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import petService from '@/services/petService'
import medicalHistoryService from '@/services/medicalHistoryService'
import MedicalHistoryModal from '@/components/medical-history/MedicalHistoryModal'
import PetCard from '@/components/pets/PetCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import './MedicalHistoryPage.css'

/**
 * Página de Historias Clínicas - RF-07
 *
 * Vista diferenciada por rol:
 * - Staff (superadmin, veterinario, auxiliar): Tabla con todas las mascotas
 * - Propietario: Cards de sus mascotas
 *
 * Ambos tienen botón para ver el historial médico completo en un panel lateral
 */
function MedicalHistoryPage() {
  const { user } = useAuthStore()
  const isStaff = ['superadmin', 'veterinario', 'auxiliar'].includes(user?.rol)

  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Estado del panel lateral
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [medicalHistory, setMedicalHistory] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Paginación para staff
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadPets()
  }, [currentPage, isStaff])

  const loadPets = async () => {
    try {
      setLoading(true)
      setError(null)

      let response

      if (isStaff) {
        // Staff: obtener todas las mascotas con paginación
        response = await petService.getAllPets({
          page: currentPage,
          page_size: 15,
          activo: true
        })
      } else {
        // Propietario: obtener solo sus mascotas
        // Primero obtenemos el propietario_id del usuario
        const userResponse = await petService.getPetsByOwner(user.propietario_id || user.id, {
          activo: true
        })
        response = userResponse
      }

      if (response.success && response.data) {
        setPets(response.data.pets || response.data || [])

        if (isStaff) {
          setTotalPages(response.data.total_pages || 1)
        }
      }
    } catch (err) {
      console.error('Error al cargar mascotas:', err)
      setError('Error al cargar las mascotas. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistory = async (pet) => {
    try {
      setSelectedPet(pet)
      setIsPanelOpen(true)
      setLoadingHistory(true)

      // Obtener la historia clínica de la mascota
      const response = await medicalHistoryService.getMedicalHistoryByPet(pet.id, true)

      if (response.success && response.data) {
        setMedicalHistory(response.data)
      }
    } catch (err) {
      console.error('Error al cargar historia clínica:', err)
      setError('Error al cargar la historia clínica. Por favor, intenta nuevamente.')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedPet(null)
    setMedicalHistory(null)
  }

  const filteredPets = pets.filter(pet =>
    pet.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.microchip?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="medical-history-page">
      {/* Header */}
      <div className="medical-history-page__header">
        <div className="medical-history-page__header-content">
          <div>
            <h1 className="medical-history-page__title">Historias Clínicas</h1>
            <p className="medical-history-page__subtitle">
              {isStaff
                ? 'Gestión de historias clínicas de todas las mascotas'
                : 'Consulta el historial médico de tus mascotas'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert
          variant="error"
          onClose={() => setError(null)}
          className="medical-history-page__alert"
        >
          {error}
        </Alert>
      )}

      {/* Buscador */}
      <div className="medical-history-page__search">
        <input
          type="text"
          className="medical-history-page__search-input"
          placeholder="Buscar por nombre, especie o microchip..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Contenido principal */}
      <div className="medical-history-page__content">
        {loading ? (
          <div className="medical-history-page__loading">
            <div className="medical-history-page__spinner" />
            <p>Cargando mascotas...</p>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="medical-history-page__empty">
            <div className="medical-history-page__empty-icon">🐾</div>
            <h3>No hay mascotas registradas</h3>
            <p>
              {searchTerm
                ? 'No se encontraron mascotas con ese criterio de búsqueda.'
                : isStaff
                  ? 'Aún no hay mascotas registradas en el sistema.'
                  : 'Aún no tienes mascotas registradas.'
              }
            </p>
          </div>
        ) : isStaff ? (
          /* Vista de tabla para staff */
          <div className="medical-history-page__table-container">
            <table className="medical-history-page__table">
              <thead>
                <tr>
                  <th>Mascota</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Microchip</th>
                  <th>Propietario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPets.map((pet) => (
                  <tr key={pet.id}>
                    <td className="medical-history-page__pet-name">
                      🐾 {pet.nombre}
                    </td>
                    <td>{pet.especie}</td>
                    <td>{pet.raza || 'N/A'}</td>
                    <td>
                      {pet.microchip ? (
                        <code className="medical-history-page__microchip">
                          {pet.microchip}
                        </code>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{pet.owner?.nombre || pet.propietario?.nombre || 'N/A'}</td>
                    <td>
                      <Button
                        size="small"
                        onClick={() => handleViewHistory(pet)}
                      >
                        Ver Historial
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="medical-history-page__pagination">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </Button>
                <span className="medical-history-page__page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Vista de cards para propietarios */
          <div className="medical-history-page__grid">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="medical-history-page__pet-item">
                <PetCard
                  pet={pet}
                  showActions={false}
                />
                <Button
                  fullWidth
                  onClick={() => handleViewHistory(pet)}
                  className="medical-history-page__history-btn modern-history-btn"
                >
                  🩺 Historia Clínica
                </Button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal centrado de historia clínica */}
      <MedicalHistoryModal
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        pet={selectedPet}
        medicalHistory={medicalHistory}
        loading={loadingHistory}
      />
    </div>
  )
}

export default MedicalHistoryPage