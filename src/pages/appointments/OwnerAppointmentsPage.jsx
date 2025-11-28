import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import appointmentService from '@/services/appointmentService'
import ownerService from '@/services/ownerService'
import AppointmentCard from '@/components/appointments/AppointmentCard'
import AppointmentDetailModal from '@/components/calender/AppointmentDetailModal'
import CreateAppointmentModal from '@/components/appointments/CreateAppointmentModal'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import './OwnerAppointmentsPage.css'
import TriageModal from '@/components/triage/TriageModal'
/**
 * OwnerAppointmentsPage - Página de gestión de citas para propietarios
 *
 * RF-05: Gestión de citas
 *
 * Permisos:
 * - PROPIETARIO: Ver solo sus citas + crear
 * - SUPERADMIN: Ver todas las citas + crear
 *
 * Funcionalidades:
 * - Listar citas del propietario en cards
 * - Ver detalles de cita
 * - Confirmar cita (solo AGENDADA/PENDIENTE)
 * - Cancelar cita (solo no CANCELADA/ATENDIDA)
 * - Reprogramar cita (solo no CANCELADA/ATENDIDA)
 * - Agendar nueva cita
 *
 * @returns {JSX.Element}
 */
function OwnerAppointmentsPage() {
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentOwner, setCurrentOwner] = useState(null) // ID del propietario actual
  const [showTriageModal, setShowTriageModal] = useState(false)
  const [selectedCita, setSelectedCita] = useState(null)

  // Estados de filtros
  const [filterStatus, setFilterStatus] = useState('all') // all, AGENDADA, CONFIRMADA, ATENDIDA, CANCELADA

  // Estados de modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Verificar permisos
  const canViewAll = currentUser?.rol === 'superadmin'
  const canCreate = ['superadmin', 'propietario'].includes(currentUser?.rol)

  /**
   * Cargar citas al montar componente
   */
  useEffect(() => {
    loadAppointments()
  }, [])

  /**
   * Filtrar citas según el estado seleccionado
   */
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredAppointments(appointments)
    } else {
      setFilteredAppointments(
        appointments.filter(apt => apt.estado === filterStatus)
      )
    }
  }, [appointments, filterStatus])

  /**
   * Cargar citas desde el backend
   */
  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Si es propietario, primero obtener su registro de propietario
      if (currentUser?.rol === 'propietario' && !currentOwner) {
        console.log('🔍 Obteniendo registro de propietario para usuario:', currentUser.id)

        try {
          const owner = await ownerService.getMyOwnerProfile()

          if (!owner) {
            setError('No se encontró tu registro de propietario. Por favor, contacta al administrador.')
            setAppointments([])
            setLoading(false)
            return
          }

          console.log('✅ Propietario encontrado:', owner.id)
          setCurrentOwner(owner)

          // Continuar con la carga de citas usando el propietario_id correcto
          await loadAppointmentsWithOwner(owner.id)
        } catch (err) {
          console.error('❌ Error al obtener propietario:', err)
          setError('No se pudo cargar tu información de propietario')
          setAppointments([])
        }
      } else if (currentUser?.rol === 'propietario' && currentOwner) {
        // Ya tenemos el propietario, solo cargar citas
        await loadAppointmentsWithOwner(currentOwner.id)
      } else {
        // No es propietario (superadmin), cargar todas las citas
        await loadAllAppointments()
      }
    } catch (err) {
      console.error('Error al cargar citas:', err)
      setError(err.message || 'Error al cargar las citas')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cargar citas filtradas por propietario
   */
  const loadAppointmentsWithOwner = async (ownerId) => {
      try {
        console.log('📅 Cargando citas para propietario:', ownerId)

        // 1️⃣ Obtener el propietario CON sus mascotas
        const ownerData = await ownerService.getMyOwnerProfile()

        if (!ownerData || !ownerData.mascotas || ownerData.mascotas.length === 0) {
          console.warn('⚠️ El propietario no tiene mascotas registradas')
          setAppointments([])
          return
        }

        // 2️⃣ Extraer los IDs de todas las mascotas del propietario
        const petIds = ownerData.mascotas.map(pet => pet.id)
        console.log('🐾 IDs de mascotas del propietario:', petIds)

        // 3️⃣ Obtener todas las citas
        const response = await appointmentService.getAllAppointments({
          skip: 0,
          limit: 100
        })

        const allAppointments = response.data?.citas || []
        console.log('📊 Total de citas en el sistema:', allAppointments.length)

        // 4️⃣ Filtrar citas que pertenecen a las mascotas del propietario
        const ownerAppointments = allAppointments.filter(apt => {
          if (!apt.mascota_id) {
            console.warn('⚠️ Cita sin mascota_id:', apt.id)
            return false
          }

          // Verificar si el mascota_id de la cita está en la lista de IDs del propietario
          const belongsToOwner = petIds.includes(apt.mascota_id)

          if (belongsToOwner) {
            const mascota = ownerData.mascotas.find(p => p.id === apt.mascota_id)
            console.log('✓ Cita del propietario:', apt.id, '- Mascota:', mascota?.nombre || apt.mascota_id)
          }

          return belongsToOwner
        })

        console.log('✅ Citas del propietario encontradas:', ownerAppointments.length)
        setAppointments(ownerAppointments)
      } catch (error) {
        console.error('❌ Error al cargar citas del propietario:', error)
        throw error
      }
    }

  /**
   * Cargar todas las citas (para superadmin)
   */
  const loadAllAppointments = async () => {
    console.log('📅 Cargando todas las citas (superadmin)')

    const response = await appointmentService.getAllAppointments({
      skip: 0,
      limit: 100
    })

    const allAppointments = response.data?.citas || []
    console.log('✅ Total de citas cargadas:', allAppointments.length)

    setAppointments(allAppointments)
  }

  /**
   * Ver detalles de una cita
   */
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

  /**
   * Confirmar cita
   */
  const handleConfirmAppointment = async (appointment) => {
    try {
      setLoading(true)
      setError(null)

      await appointmentService.confirmAppointment(appointment.id)

      setSuccess('Cita confirmada exitosamente')
      await loadAppointments()
    } catch (err) {
      console.error('Error al confirmar cita:', err)
      setError(err.message || 'Error al confirmar la cita')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancelar cita
   */
  const handleCancelAppointment = async (appointment) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const motivo = prompt('Por favor, indica el motivo de la cancelación:')
      if (!motivo) {
        setError('Debes proporcionar un motivo de cancelación')
        return
      }

      await appointmentService.cancelAppointment(appointment.id, motivo)

      setSuccess('Cita cancelada exitosamente')
      await loadAppointments()
    } catch (err) {
      console.error('Error al cancelar cita:', err)
      setError(err.message || 'Error al cancelar la cita')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reprogramar cita
   */
  const handleRescheduleAppointment = (appointment) => {
    // TODO: Implementar modal de reprogramación
    alert('Funcionalidad de reprogramación en desarrollo')
  }

  /**
   * Abrir modal de creación de cita
   */
  const handleCreateAppointment = () => {
    setIsCreateModalOpen(true)
  }

  /**
   * Callback cuando se crea una cita exitosamente
   */
  const handleAppointmentCreated = () => {
    setSuccess('Cita agendada exitosamente')
    setIsCreateModalOpen(false)
    loadAppointments()
  }

  const handleOpenTriage = (cita) => {
      setSelectedCita(cita)
      setShowTriageModal(true)
    }

  return (
    <div className="owner-appointments-page">
      {/* Header */}
      <div className="owner-appointments-page__header">
        <div className="owner-appointments-page__title-section">
          <h1 className="owner-appointments-page__title">
            {canViewAll ? 'Gestión de Citas' : 'Mis Citas'}
          </h1>
          <p className="owner-appointments-page__subtitle">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita encontrada' : 'citas encontradas'}
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleCreateAppointment} size="medium">
            + Agendar Cita
          </Button>
        )}
      </div>

      {/* Alertas */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Filtros */}
      <div className="owner-appointments-page__filters">
        <div className="owner-appointments-page__filter-group">
          <label className="owner-appointments-page__filter-label">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="owner-appointments-page__filter-select"
          >
            <option value="all">Todos</option>
            <option value="AGENDADA">Agendada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="owner-appointments-page__loading">
          <div className="owner-appointments-page__spinner"></div>
          <p>Cargando citas...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="owner-appointments-page__empty">
          <div className="owner-appointments-page__empty-icon">📅</div>
          <h3 className="owner-appointments-page__empty-title">
            {filterStatus === 'all'
              ? 'No tienes citas agendadas'
              : `No hay citas ${filterStatus.toLowerCase()}`}
          </h3>
          <p className="owner-appointments-page__empty-subtitle">
            {canCreate ? 'Agenda tu primera cita para comenzar' : 'Espera a que el veterinario te agende una cita'}
          </p>
          {canCreate && (
            <Button onClick={handleCreateAppointment}>
              + Agendar Cita
            </Button>
          )}
        </div>
      ) : (
        <div className="owner-appointments-page__grid">
          <AnimatePresence>
            {filteredAppointments.map(appointment => (
            <div key={appointment.id}>
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onViewDetails={handleViewDetails}
                onConfirm={handleConfirmAppointment}
                onCancel={handleCancelAppointment}
                onReschedule={handleRescheduleAppointment}
                userRole={currentUser?.rol}
              />
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleOpenTriage(appointment)}
                >
                  🩺 Registrar Triage
                </Button>
            </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modales */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
      />

      {isCreateModalOpen && (
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleAppointmentCreated}
        />
      )}

      {showTriageModal && selectedCita && (
          <TriageModal
            isOpen={showTriageModal}
            onClose={() => {
              setShowTriageModal(false)
              setSelectedCita(null)
            }}
            cita={selectedCita}
            onSuccess={(triage) => {
              console.log('Triage registrado:', triage)
              // Opcional: recargar citas
              loadAppointments()
            }}
          />
        )}

    </div>
  )
}

export default OwnerAppointmentsPage