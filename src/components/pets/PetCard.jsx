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
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="pet-card__pet-icon-svg">
    <circle cx="32" cy="32" r="28" fill="#FFE4CC" />
    <ellipse cx="20" cy="20" rx="8" ry="12" fill="#D4A574" />
    <ellipse cx="44" cy="20" rx="8" ry="12" fill="#D4A574" />
    <circle cx="32" cy="35" r="15" fill="#F5C98B" />
    <ellipse cx="26" cy="32" rx="3" ry="4" fill="#2C3E50" />
    <ellipse cx="38" cy="32" rx="3" ry="4" fill="#2C3E50" />
    <path d="M32 36C32 36 28 38 26 40C24 42 26 44 28 44H36C38 44 40 42 38 40C36 38 32 36 32 36Z" fill="#E67E22" />
    <ellipse cx="32" cy="36" rx="4" ry="5" fill="#2C3E50" />
  </svg>
)

const CatIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="pet-card__pet-icon-svg">
    <circle cx="32" cy="36" r="24" fill="#FFD4A3" />
    <path d="M16 20L8 8L18 16Z" fill="#F5C98B" />
    <path d="M48 20L56 8L46 16Z" fill="#F5C98B" />
    <ellipse cx="25" cy="34" rx="3" ry="4" fill="#2C3E50" />
    <ellipse cx="39" cy="34" rx="3" ry="4" fill="#2C3E50" />
    <circle cx="32" cy="40" r="2" fill="#E67E22" />
    <path d="M32 42L29 47M32 42L35 47" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 40C22 42 24 43 26 43M38 43C40 43 42 42 44 40" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const GenericPetIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="pet-card__pet-icon-svg">
    <circle cx="32" cy="32" r="28" fill="#E8F4F8" />
    <circle cx="24" cy="28" r="4" fill="#4A90E2" />
    <circle cx="40" cy="28" r="4" fill="#4A90E2" />
    <path d="M20 40C20 40 24 44 32 44C40 44 44 40 44 40" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" />
    <circle cx="16" cy="16" r="6" fill="#4A90E2" opacity="0.6" />
    <circle cx="48" cy="16" r="6" fill="#4A90E2" opacity="0.6" />
  </svg>
)

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
