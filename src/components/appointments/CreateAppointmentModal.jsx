import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/store/AuthStore.jsx'
import appointmentService from '@/services/appointmentService'
import petService from '@/services/petService'
import serviceService from '@/services/serviceService'
import userService from '@/services/userService'
import ownerService from '@/services/ownerService' // uso para obtener owner
import OwnerAvailabilityPanel from './OwnerAvailabilityPanel'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './CreateAppointmentModal.css'

function emojiForSpecies(especie) {
  if (!especie) return '🐾'
  const s = especie.toLowerCase()
  if (s.includes('gato') || s.includes('cat')) return '🐱'
  if (s.includes('perro') || s.includes('dog') || s.includes('canino')) return '🐶'
  if (s.includes('ave') || s.includes('bird')) return '🐦'
  return '🐾'
}

function emojiForVet(vet) {
  // Si hay género o especialidad se pueden adaptar pero por ahora emoji médico
  return '👩‍⚕️'
}

function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user: currentUser } = useAuthStore()

  const [formData, setFormData] = useState({
    mascota_id: '',
    servicio_id: '',
    veterinario_id: '',
    fecha_hora: '',
    motivo: ''
  })

  const [pets, setPets] = useState([])
  const [services, setServices] = useState([])
  const [veterinarians, setVeterinarians] = useState([])
  const [currentOwner, setCurrentOwner] = useState(null)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    } else {
      // limpiar al cerrar fuera
      setFormData({
        mascota_id: '',
        servicio_id: '',
        veterinario_id: '',
        fecha_hora: '',
        motivo: ''
      })
      setSelectedTimeSlot(null)
      setStep(1)
      setError(null)
      setCurrentOwner(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      setError(null)

      // 1) obtener owner -> luego usar owner.id para obtener mascotas
      const owner = await ownerService.getMyOwnerProfile()
      if (!owner) {
        setError('No se encontró tu registro de propietario. Por favor, contacta al administrador.')
        setLoadingData(false)
        return
      }
      setCurrentOwner(owner)

      // 2) mascotas del owner
      const petsResponse = await petService.getPetsByOwner(owner.id)
      const petsData = petsResponse?.data?.pets || []
      setPets(petsData)

      // 3) servicios (filtrar por activos si existe esa propiedad)
      const servicesResponse = await serviceService.getAllServices()
      const servicesData = servicesResponse?.data?.servicios || []
      // Filtrar solo activos si existe la propiedad 'activo'
      const haveActivo = servicesData.some(s => Object.prototype.hasOwnProperty.call(s, 'activo'))
      const filteredServices = haveActivo ? servicesData.filter(s => s.activo === true) : servicesData
      setServices(filteredServices)

      // 4) veterinarios por rol
      const veterinariansResponse = await userService.getUsersByRole('veterinario')
      const veterinariansData = veterinariansResponse?.data?.usuarios || []
      setVeterinarians(veterinariansData)
    } catch (err) {
      console.error('Error cargando datos del modal', err)
      setError(err?.message || 'Error al cargar datos del formulario')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectPet = (petId) => {
    setFormData(prev => ({ ...prev, mascota_id: petId }))
    setError(null)
  }
  const handleSelectVet = (vetId) => {
    setFormData(prev => ({ ...prev, veterinario_id: vetId }))
    setError(null)
  }

  const handleTimeSlotSelected = (dateTime) => {
    setSelectedTimeSlot(dateTime)
    setFormData(prev => ({ ...prev, fecha_hora: dateTime }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.mascota_id) {
      setError('Debes seleccionar una mascota')
      return false
    }
    if (!formData.servicio_id) {
      setError('Debes seleccionar un servicio')
      return false
    }
    if (!formData.veterinario_id) {
      setError('Debes seleccionar un veterinario')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError(null)
    if (validateStep1()) setStep(2)
  }
  const handlePreviousStep = () => {
    setStep(1)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fecha_hora) {
      setError('Debes seleccionar un horario disponible')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const appointmentData = {
        mascota_id: formData.mascota_id,
        servicio_id: formData.servicio_id,
        veterinario_id: formData.veterinario_id,
        fecha_hora: formData.fecha_hora,
        motivo: formData.motivo || 'Consulta general'
      }

      await appointmentService.createAppointment(appointmentData)

      // limpiar
      setFormData({
        mascota_id: '',
        servicio_id: '',
        veterinario_id: '',
        fecha_hora: '',
        motivo: ''
      })
      setStep(1)
      setSelectedTimeSlot(null)
      setCurrentOwner(null)
      onSuccess()
    } catch (err) {
      console.error('Error al crear cita:', err)
      setError(err?.message || 'Error al agendar la cita')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        mascota_id: '',
        servicio_id: '',
        veterinario_id: '',
        fecha_hora: '',
        motivo: ''
      })
      setStep(1)
      setSelectedTimeSlot(null)
      setCurrentOwner(null)
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="create-appointment-modal__overlay" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="create-appointment-modal__container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="create-appointment-modal__header">
            <div>
              <h2 className="create-appointment-modal__title">Agendar Nueva Cita</h2>
              <p className="create-appointment-modal__subtitle">
                Paso {step} de 2: {step === 1 ? 'Información básica' : 'Seleccionar horario'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="create-appointment-modal__close-btn"
              disabled={loading}
              aria-label="Cerrar"
            >
              <svg className="create-appointment-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div style={{ padding: '0 24px 12px' }}>
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <div className="create-appointment-modal__content">
            {loadingData ? (
              <div className="create-appointment-modal__loading">
                <div className="create-appointment-modal__spinner" />
                <p>Cargando datos...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="create-appointment-modal__form">
                {step === 1 && (
                  <div className="create-appointment-modal__step">
                    {/* MASCOTAS: cards */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">Mascota *</label>
                      {pets.length === 0 ? (
                        <div className="create-appointment-modal__info">No tienes mascotas registradas.</div>
                      ) : (
                        <div className="card-grid">
                          {pets.map(pet => {
                            const selected = formData.mascota_id === pet.id
                            return (
                              <motion.button
                                key={pet.id}
                                type="button"
                                className={`pet-card ${selected ? 'selected' : ''}`}
                                onClick={() => handleSelectPet(pet.id)}
                                whileHover={{ translateY: -4 }}
                                whileTap={{ scale: 0.98 }}
                                layout
                                aria-pressed={selected}
                              >
                                <div className="pet-card__emoji">{emojiForSpecies(pet.especie)}</div>
                                <div className="pet-card__body">
                                  <div className="pet-card__name">{pet.nombre}</div>
                                  <div className="pet-card__meta">{pet.especie} • {pet.raza || 'Sin raza'}</div>
                                </div>
                              </motion.button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* SERVICIOS: select filtrado (solo activos) */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">Servicio *</label>
                      {services.length === 0 ? (
                        <div className="create-appointment-modal__info error">No hay servicios disponibles.</div>
                      ) : (
                        <select
                          name="servicio_id"
                          value={formData.servicio_id}
                          onChange={handleInputChange}
                          className="create-appointment-modal__select"
                          required
                        >
                          <option value="">Selecciona un servicio</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.nombre}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* VETERINARIOS: cards */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">Veterinario *</label>
                      {veterinarians.length === 0 ? (
                        <div className="create-appointment-modal__info">No hay veterinarios disponibles.</div>
                      ) : (
                        <div className="card-grid card-grid--vets">
                          {veterinarians.map(vet => {
                            const selected = formData.veterinario_id === vet.id
                            return (
                              <motion.button
                                key={vet.id}
                                type="button"
                                className={`vet-card ${selected ? 'selected' : ''}`}
                                onClick={() => handleSelectVet(vet.id)}
                                whileHover={{ translateY: -4 }}
                                whileTap={{ scale: 0.98 }}
                                layout
                                aria-pressed={selected}
                              >
                                <div className="vet-card__emoji">👨‍⚕️</div>
                                <div className="vet-card__body">
                                  <div className="vet-card__name">Dr. {vet.nombre}</div>
                                  <div className="vet-card__meta">{vet.especialidad || 'Veterinario'}</div>
                                </div>
                              </motion.button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Motivo */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">Motivo de la consulta (opcional)</label>
                      <textarea
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleInputChange}
                        className="create-appointment-modal__textarea"
                        placeholder="Describe brevemente el motivo de la consulta..."
                        rows="3"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="create-appointment-modal__step">
                    <div className="create-appointment-modal__availability-section">
                      <h3 className="create-appointment-modal__section-title">Selecciona un horario disponible</h3>
                      <p className="create-appointment-modal__section-subtitle">
                        {selectedTimeSlot
                          ? `Horario seleccionado: ${format(new Date(selectedTimeSlot), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}`
                          : 'Selecciona una fecha y luego un horario disponible'}
                      </p>

                      <OwnerAvailabilityPanel
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        veterinarianId={formData.veterinario_id}
                        onTimeSlotSelected={handleTimeSlotSelected}
                        selectedTimeSlot={selectedTimeSlot}
                      />
                    </div>
                  </div>
                )}

                <div className="create-appointment-modal__footer">
                  {step === 1 ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="app-btn app-btn--ghost"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleNextStep}
                        disabled={loading}
                        className="app-btn app-btn--primary"
                      >
                        Siguiente
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreviousStep}
                        disabled={loading}
                        className="app-btn app-btn--ghost"
                      >
                        Anterior
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || !selectedTimeSlot}
                        className="app-btn app-btn--primary"
                      >
                        {loading ? 'Agendando...' : 'Agendar Cita'}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateAppointmentModal
