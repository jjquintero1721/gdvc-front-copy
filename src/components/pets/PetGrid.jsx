import PetCard from './PetCard'
import Button from '@/components/ui/Button'
import './PetGrid.css'

/**
 * Icono de estado vacío
 */
const EmptyPetsIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="pet-grid__empty-icon-svg">
    <circle cx="60" cy="60" r="50" fill="#F1F5F9" />
    <circle cx="45" cy="50" r="8" fill="#CBD5E1" />
    <circle cx="75" cy="50" r="8" fill="#CBD5E1" />
    <path d="M40 75C40 75 45 80 60 80C75 80 80 75 80 75" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
    <circle cx="30" cy="30" r="10" fill="#CBD5E1" opacity="0.6" />
    <circle cx="90" cy="30" r="10" fill="#CBD5E1" opacity="0.6" />
  </svg>
)

/**
 * Componente PetGrid - Grid de mascotas mejorado
 *
 * Características:
 * - Grid responsivo (1-3 columnas según viewport)
 * - Estado vacío profesional
 * - Header con acciones
 * - Animaciones de entrada
 *
 * @param {Array} pets - Lista de mascotas
 * @param {Function} onAddPet - Callback para agregar mascota
 * @param {Function} onEditPet - Callback para editar mascota
 * @param {boolean} loading - Estado de carga
 * @param {string} emptyMessage - Mensaje personalizado de estado vacío
 */
function PetGrid({
  pets = [],
  onAddPet,
  onEditPet,
  loading = false,
  emptyMessage = 'No hay mascotas registradas'
}) {

  if (loading) {
    return (
      <div className="pet-grid__loading">
        <div className="pet-grid__spinner"></div>
        <p>Cargando mascotas...</p>
      </div>
    )
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="pet-grid__empty">
        <EmptyPetsIcon />
        <h3 className="pet-grid__empty-title">{emptyMessage}</h3>
        <p className="pet-grid__empty-subtitle">
          {onAddPet ? 'Agrega tu primera mascota para comenzar' : 'Aún no hay mascotas en el sistema'}
        </p>
        {onAddPet && (
          <Button onClick={onAddPet}>
            + Agregar Mascota
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="pet-grid">
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          onEdit={onEditPet}
          showActions={!!onEditPet}
        />
      ))}
    </div>
  )
}

export default PetGrid