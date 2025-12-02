import { useNavigate } from 'react-router-dom'
import { calculateAge } from '@/utils/dateUtils'
import Button from '@/components/ui/Button'
import PropTypes from 'prop-types'
import { useAuthStore } from '@/store/AuthStore'
import './PetCard.css'

/**
 * Iconos SVG para mascotas
 */
const DogIcon = () => (
   <span className="pet-card__emoji-icon">🐶</span>
)

const CatIcon = () => (
    <span className="pet-card__emoji-icon">🐱</span>
)

const GenericPetIcon = () => (
  <span className="pet-card__emoji-icon">🐾</span>
);


/**
 * Componente PetCard - Tarjeta de mascota mejorada
 *
 * @param {Object} pet - Datos de la mascota
 * @param {Function} onEdit - Callback para editar mascota
 * @param {Function} onViewHistory - Callback opcional para ver historia clínica (si se pasa, mostrará botón)
 * @param {boolean} showActions - Mostrar botones de acción
 */
function PetCard({ pet, onEdit, onViewHistory, showActions = true }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
 const isPropietario = user?.rol === 'propietario'


  // Determinar el icono según la especie
  const renderPetIcon = () => {
    const especie = (pet.especie || '').toLowerCase()
    if (especie.includes('perro') || especie === 'canino') {
      return <DogIcon />
    } else if (especie.includes('gato') || especie === 'felino') {
      return <CatIcon />
    } else {
      return <GenericPetIcon />
    }
  }

  // Calcular edad si hay fecha de nacimiento
  const edad = pet.fecha_nacimiento ? calculateAge(pet.fecha_nacimiento) : null

  // Manejar click en ver detalles
  const handleViewDetails = () => {
    navigate(`/mascotas/${pet.id}`)
  }

  return (
    <div className="pet-card" role="article" aria-label={`Mascota ${pet.nombre}`}>
      {/* Icono de la mascota */}
      <div className="pet-card__icon-container" aria-hidden="true">
        {renderPetIcon()}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="pet-card__content">
        {/* Nombre de la mascota */}
        <h3 className="pet-card__name">{pet.nombre}</h3>

        {/* Información principal */}
        <div className="pet-card__info">
          <div className="pet-card__info-item">
            <span className="pet-card__info-label">Especie:</span>
            <span className="pet-card__info-value">{pet.especie}</span>
          </div>

          {pet.raza && (
            <div className="pet-card__info-item">
              <span className="pet-card__info-label">Raza:</span>
              <span className="pet-card__info-value">{pet.raza}</span>
            </div>
          )}

          {/* NUESTROS NUEVOS CAMPOS - mantenemos clases existentes para no romper CSS */}
          {pet.color && (
            <div className="pet-card__info-item">
              <span className="pet-card__info-label">Color:</span>
              <span className="pet-card__info-value">{pet.color}</span>
            </div>
          )}

          {pet.sexo && (
            <div className="pet-card__info-item">
              <span className="pet-card__info-label">Sexo:</span>
              <span className="pet-card__info-value">
                {pet.sexo === 'macho' ? 'Macho' : pet.sexo === 'hembra' ? 'Hembra' : pet.sexo}
              </span>
            </div>
          )}

          {typeof pet.peso !== 'undefined' && pet.peso !== null && pet.peso !== '' && (
            <div className="pet-card__info-item">
              <span className="pet-card__info-label">Peso:</span>
              <span className="pet-card__info-value">{Number(pet.peso)} kg</span>
            </div>
          )}

          {edad && (
            <div className="pet-card__info-item">
              <span className="pet-card__info-label">Edad:</span>
              <span className="pet-card__info-value">{edad}</span>
            </div>
          )}

          {pet.microchip && (
            <div className="pet-card__info-item pet-card__info-item--chip">
              <span className="pet-card__info-label">Microchip:</span>
              <span className="pet-card__info-value pet-card__microchip">{pet.microchip}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="pet-card__actions">

            {/* Botón de ver historia clínica - solo si pasaron onViewHistory */}
              {isPropietario && onViewHistory && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => onViewHistory(pet)}
                    className="pet-card__history-button"
                  >
                    📘 Historia Clínica
                  </Button>
                )}

          </div>
        )}
      </div>

      {/* Badge de estado (si la mascota está inactiva) */}
      {pet.activo === false && (
        <div className="pet-card__status-badge pet-card__status-badge--inactive">
          Inactiva
        </div>
      )}
    </div>
  )
}

PetCard.propTypes = {
  pet: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onViewHistory: PropTypes.func, // opcional
  showActions: PropTypes.bool
}

export default PetCard
