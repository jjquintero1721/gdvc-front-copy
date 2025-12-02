import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/AuthStore.jsx'
import appointmentService from '@/services/appointmentService'
import ownerService from '@/services/ownerService'
import decoratorService from '@/services/decoratorService'
import AppointmentCard from '@/components/appointments/AppointmentCard'
import AppointmentDetailModal from '@/components/calender/AppointmentDetailModal'
import CreateAppointmentModal from '@/components/appointments/CreateAppointmentModal'
import CancelAppointmentModal from '@/components/appointments/CancelAppointmentModal'
import RescheduleAppointmentModal from '@/components/appointments/RescheduleAppointmentModal'
import DecoratorModal from '@/components/appointments/DecoratorModal'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { toast } from 'react-hot-toast'
import './OwnerAppointmentsPage.css'
import TriageModal from '@/components/triage/TriageModal'

/**
 * OwnerAppointmentsPage - Página de gestión de citas para propietarios
 */

function OwnerAppointmentsPage() {
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentOwner, setCurrentOwner] = useState(null) // objeto propietario actual
  const [showTriageModal, setShowTriageModal] = useState(false)
  const [selectedCita, setSelectedCita] = useState(null)

  // Estados de filtros
  const [filterStatus, setFilterStatus] = useState('all') // all, AGENDADA, CONFIRMADA, EN_PROCESO, COMPLETADA, CANCELADA, CANCELADA_TARDIA

  // Estados de modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isDecoratorModalOpen, setIsDecoratorModalOpen] = useState(false) // ⭐ NUEVO
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // PAGINACIÓN
  const ITEMS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)

  // Permisos
  const isSuperadmin = currentUser?.rol === 'superadmin'
  const isPropietario = currentUser?.rol === 'propietario'
  // Según tu petición: "+ Agendar Cita" -> SOLO propietario
  const canCreate = isPropietario

  /**
   * Cargar citas al montar componente
   */
  useEffect(() => {
    loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Filtrar citas según el estado seleccionado (case-insensitive)
   */
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredAppointments(appointments)
    } else {
      setFilteredAppointments(
        appointments.filter(apt =>
          apt.estado?.toString().toUpperCase() === filterStatus.toString().toUpperCase()
        )
      )
    }
    // Al cambiar el filtro reiniciamos la paginación
    setCurrentPage(1)
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
        try {
          const owner = await ownerService.getMyOwnerProfile()

          if (!owner) {
            setError('No se encontró tu registro de propietario. Por favor, contacta al administrador.')
            setAppointments([])
            setLoading(false)
            return
          }

          setCurrentOwner(owner)
          await loadAppointmentsWithOwner(owner.id)
        } catch (err) {
          console.error('❌ Error al obtener propietario:', err)
          setError('No se pudo cargar tu información de propietario')
          setAppointments([])
        }
      } else if (currentUser?.rol === 'propietario' && currentOwner) {
        // Ya tenemos el propietario, solo cargar citas
        await loadAppointmentsWithOwner(currentOwner.id)
      } else if (currentUser?.rol === 'veterinario') {

          // ⭐ Cargar solo citas del veterinario actual
          const response = await appointmentService.getAppointmentsByVeterinarian(
            currentUser.id,      // este es el id del veterinario logueado
            { skip: 0, limit: 100 }
          )

          const vetAppointments = response.data?.citas || []
          setAppointments(vetAppointments)

        } else {
          // superadmin → sí puede ver todas
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
      // Obtener propietario con mascotas
      const ownerData = await ownerService.getMyOwnerProfile()

      if (!ownerData || !ownerData.mascotas || ownerData.mascotas.length === 0) {
        setAppointments([])
        return
      }

      // IDs de mascotas del propietario
      const petIds = ownerData.mascotas.map(p => p.id)

      // Obtener todas las citas
      const response = await appointmentService.getAllAppointments({
        skip: 0,
        limit: 100
      })

      const allAppointments = response.data?.citas || []

      // Filtrar por mascotas del propietario
      const ownerAppointments = allAppointments.filter(apt => petIds.includes(apt.mascota_id))

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
    try {
      const response = await appointmentService.getAllAppointments({
        skip: 0,
        limit: 100
      })
      const allAppointments = response.data?.citas || []
      setAppointments(allAppointments)
    } catch (err) {
      console.error('Error cargando todas las citas:', err)
      setAppointments([])
    }
  }

  /**
   * Acciones
   */
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

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

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async (motivo) => {
    try {
      setLoading(true)
      setError(null)

      await appointmentService.cancelAppointment(selectedAppointment.id, motivo)

      setSuccess('✅ Cita cancelada exitosamente')
      setIsCancelModalOpen(false)
      setSelectedAppointment(null)
      await loadAppointments()
    } catch (err) {
      console.error('Error al cancelar cita:', err)
      setError(err.message || 'Error al cancelar la cita')
      throw err  // Re-throw para que el modal lo maneje
    } finally {
      setLoading(false)
    }
  }

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduleModalOpen(true)
  }

  const handleConfirmReschedule = async (nuevaFechaHora) => {
    try {
      setLoading(true)
      setError(null)

      await appointmentService.rescheduleAppointment(
        selectedAppointment.id,
        nuevaFechaHora
      )

      setSuccess('✅ Cita reprogramada exitosamente')
      setIsRescheduleModalOpen(false)
      setSelectedAppointment(null)
      await loadAppointments()
    } catch (err) {
      console.error('Error al reprogramar cita:', err)
      setError(err.message || 'Error al reprogramar la cita')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = () => {
    setIsCreateModalOpen(true)
  }

  const handleAppointmentCreated = async () => {
    setSuccess('✅ Cita creada exitosamente')
    setIsCreateModalOpen(false)
    await loadAppointments()
  }

  const handleOpenTriage = (cita) => {
    setSelectedCita(cita)
    setShowTriageModal(true)
  }

  // ==================== FUNCIONES PARA DECORADORES ====================

  /**
   * Abre el modal de decoradores para una cita
   * @param {Object} appointment - Cita seleccionada
   */
  const handleOpenDecorators = (appointment) => {
    console.log('🎨 Abriendo modal de decoradores para cita:', appointment.id)
    setSelectedAppointment(appointment)
    setIsDecoratorModalOpen(true)
  }

  /**
   * Cierra el modal de decoradores
   */
  const handleCloseDecorators = () => {
    setIsDecoratorModalOpen(false)
    setSelectedAppointment(null)
  }

  /**
   * Maneja la adición de un decorador a una cita
   * @param {string} type - Tipo de decorador: 'recordatorio', 'notas', 'prioridad'
   * @param {Object} data - Datos del decorador
   */
  const handleAddDecorator = async (type, data) => {
    try {
      console.log(`📝 Añadiendo decorador tipo ${type}:`, data)

      let response

      // Llamar al endpoint correspondiente según el tipo
      switch (type) {
        case 'recordatorio':
          response = await decoratorService.addRecordatorio(
            selectedAppointment.id,
            data
          )
          toast.success('✅ Recordatorios añadidos exitosamente')
          break

        case 'notas':
          response = await decoratorService.addNotas(
            selectedAppointment.id,
            data
          )
          toast.success('✅ Notas especiales añadidas exitosamente')
          break

        case 'prioridad':
          response = await decoratorService.addPrioridad(
            selectedAppointment.id,
            data
          )
          toast.success(`✅ Prioridad ${data.nivel_prioridad} asignada exitosamente`)
          break

        default:
          throw new Error('Tipo de decorador no válido')
      }

      console.log('✅ Decorador añadido:', response)

      // Cerrar modal después de éxito
      handleCloseDecorators()

      // Opcional: Refrescar la lista de citas
      // await loadAppointments()

    } catch (error) {
      console.error('❌ Error al añadir decorador:', error)
      toast.error(error.message || 'Error al añadir decorador')
      throw error // Re-lanzar para que el modal maneje el estado de loading
    }
  }

  // ==================== FIN FUNCIONES DECORADORES ====================

  /**
   * PAGINACIÓN
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE)
  }, [filteredAppointments.length])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const currentPageAppointments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAppointments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAppointments, currentPage])

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    // opcional: scroll top del container
    window.scrollTo({ top: 200, behavior: 'smooth' })
  }

  return (
    <div className="owner-appointments-page">
      {/* Header */}
      <div className="owner-appointments-page__header">
        <div className="owner-appointments-page__title-section">
          <h1 className="owner-appointments-page__title">
            {isSuperadmin ? 'Gestión de Citas' : 'Mis Citas'}
          </h1>
          <p className="owner-appointments-page__subtitle">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita encontrada' : 'citas encontradas'}
          </p>
        </div>

        {/* + Agendar Cita → SOLO propietario */}
        {canCreate && (
          <Button onClick={handleCreateAppointment} size="medium">
            + Agendar Cita
          </Button>
        )}
      </div>

      {/* Alerts */}
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
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="CANCELADA_TARDIA">Cancelación tardía</option>
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
            {canCreate ? 'Agenda tu primera cita para comenzar' : 'Espera a que se te agende una cita'}
          </p>
          {canCreate && (
            <Button onClick={handleCreateAppointment}>
              + Agendar Cita
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="owner-appointments-page__grid">
            <AnimatePresence>
              {currentPageAppointments.map(appointment => (
                <div key={appointment.id}>
                  <AppointmentCard
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                    onConfirm={handleConfirmAppointment}
                    onCancel={handleCancelAppointment}
                    onReschedule={handleRescheduleAppointment}
                    onOpenTriage={handleOpenTriage}
                    onOpenDecorators={handleOpenDecorators}
                    userRole={currentUser?.rol}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20
            }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                &lt;
              </button>

              {/* Mostrar todos los números de página (totalPages suele ser pequeño) */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: pageNum === currentPage ? '#3b82f6' : 'white',
                      color: pageNum === currentPage ? 'white' : '#111827',
                      cursor: 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: currentPage === totalPages ? '#f3f4f6' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
        userRole={currentUser?.rol}     // ⭐ Muy importante
        onDecoratorsChanged={loadAppointments}
      />

      {isCreateModalOpen && (
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleAppointmentCreated}
        />
      )}

      {isCancelModalOpen && selectedAppointment && (
        <CancelAppointmentModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false)
            setSelectedAppointment(null)
          }}
          onConfirm={handleConfirmCancel}
          appointment={selectedAppointment}
        />
      )}

      {isRescheduleModalOpen && selectedAppointment && (
        <RescheduleAppointmentModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false)
            setSelectedAppointment(null)
          }}
          onConfirm={handleConfirmReschedule}
          appointment={selectedAppointment}
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
            loadAppointments()
          }}
        />
      )}

      {/*  Modal de Decoradores */}
      {isDecoratorModalOpen && selectedAppointment && (
        <DecoratorModal
          isOpen={isDecoratorModalOpen}
          onClose={handleCloseDecorators}
          appointment={selectedAppointment}
          onAddDecorator={handleAddDecorator}
          userRole={currentUser?.rol}
        />
      )}
    </div>
  )
}

export default OwnerAppointmentsPage