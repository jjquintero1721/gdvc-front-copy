import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import appointmentService from '@/services/appointmentService'
import petService from '@/services/petService'
import serviceService from '@/services/serviceService'
import userService from '@/services/userService'
import OwnerAvailabilityPanel from './OwnerAvailabilityPanel'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './CreateAppointmentModal.css'

/**
 * CreateAppointmentModal - Modal para agendar nueva cita
 *
 * Permite al propietario:
 * - Seleccionar mascota (solo sus mascotas)
 * - Seleccionar servicio
 * - Seleccionar veterinario
 * - Ver disponibilidad y seleccionar horario
 * - Ingresar motivo de la cita
 *
 * @param {Boolean} isOpen - Estado del modal
 * @param {Function} onClose - Callback para cerrar modal
 * @param {Function} onSuccess - Callback cuando se crea la cita
 */
function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user: currentUser } = useAuthStore()

  // Estados del formulario
  const [formData, setFormData] = useState({
    mascota_id: '',
    servicio_id: '',
    veterinario_id: '',
    fecha_hora: '',
    motivo: ''
  })

  // Estados de datos
  const [pets, setPets] = useState([])
  const [services, setServices] = useState([])
  const [veterinarians, setVeterinarians] = useState([])

  // Estados de disponibilidad
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1) // 1: Datos básicos, 2: Disponibilidad

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      setError(null)

      // Cargar mascotas del propietario
      const petsResponse = await petService.getPetsByOwner(currentUser.id)
      setPets(petsResponse.data?.mascotas || [])

      // Cargar servicios disponibles
      const servicesResponse = await serviceService.getAllServices()
      setServices(servicesResponse.data?.servicios || [])

      // Cargar veterinarios
      const veterinariansResponse = await userService.getUsersByRole('veterinario')
      setVeterinarians(veterinariansResponse.data?.usuarios || [])

    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(err.message || 'Error al cargar los datos necesarios')
    } finally {
      setLoadingData(false)
    }
  }

  /**
   * Manejar cambio en inputs del formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Seleccionar horario desde el panel de disponibilidad
   */
  const handleTimeSlotSelected = (dateTime) => {
    setSelectedTimeSlot(dateTime)
    setFormData(prev => ({
      ...prev,
      fecha_hora: dateTime
    }))
  }

  /**
   * Validar paso 1 (datos básicos)
   */
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

  /**
   * Avanzar al siguiente paso
   */
  const handleNextStep = () => {
    setError(null)
    if (validateStep1()) {
      setStep(2)
    }
  }

  /**
   * Volver al paso anterior
   */
  const handlePreviousStep = () => {
    setStep(1)
    setError(null)
  }

  /**
   * Enviar formulario
   */
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

      // Limpiar formulario y cerrar modal
      setFormData({
        mascota_id: '',
        servicio_id: '',
        veterinario_id: '',
        fecha_hora: '',
        motivo: ''
      })
      setStep(1)
      setSelectedTimeSlot(null)

      onSuccess()
    } catch (err) {
      console.error('Error al crear cita:', err)
      setError(err.message || 'Error al agendar la cita')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cerrar modal
   */
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
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="create-appointment-modal__overlay" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="create-appointment-modal__container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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
            >
              <svg className="create-appointment-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Alertas */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Contenido del modal */}
          <div className="create-appointment-modal__content">
            {loadingData ? (
              <div className="create-appointment-modal__loading">
                <div className="create-appointment-modal__spinner"></div>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* PASO 1: Datos básicos */}
                {step === 1 && (
                  <div className="create-appointment-modal__step">
                    {/* Seleccionar mascota */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">
                        Mascota *
                      </label>
                      <select
                        name="mascota_id"
                        value={formData.mascota_id}
                        onChange={handleInputChange}
                        className="create-appointment-modal__select"
                        required
                      >
                        <option value="">Selecciona una mascota</option>
                        {pets.map(pet => (
                          <option key={pet.id} value={pet.id}>
                            {pet.nombre} ({pet.especie})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seleccionar servicio */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">
                        Servicio *
                      </label>
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
                            {service.nombre} - ${service.precio} ({service.duracion_minutos} min)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seleccionar veterinario */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">
                        Veterinario *
                      </label>
                      <select
                        name="veterinario_id"
                        value={formData.veterinario_id}
                        onChange={handleInputChange}
                        className="create-appointment-modal__select"
                        required
                      >
                        <option value="">Selecciona un veterinario</option>
                        {veterinarians.map(vet => (
                          <option key={vet.id} value={vet.id}>
                            Dr. {vet.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Motivo (opcional) */}
                    <div className="create-appointment-modal__field">
                      <label className="create-appointment-modal__label">
                        Motivo de la consulta (opcional)
                      </label>
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

                {/* PASO 2: Seleccionar horario */}
                {step === 2 && (
                  <div className="create-appointment-modal__step">
                    <div className="create-appointment-modal__availability-section">
                      <h3 className="create-appointment-modal__section-title">
                        Selecciona un horario disponible
                      </h3>
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

                {/* Footer con botones */}
                <div className="create-appointment-modal__footer">
                  {step === 1 ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        disabled={loading}
                      >
                        Siguiente
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handlePreviousStep}
                        disabled={loading}
                      >
                        Atrás
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !selectedTimeSlot}
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