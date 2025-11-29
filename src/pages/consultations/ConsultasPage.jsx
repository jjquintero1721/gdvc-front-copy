import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/AuthStore.jsx'
import { Search, Filter, Calendar, AlertCircle } from 'lucide-react'
import appointmentService from '@/services/appointmentService'
import ConsultationCard from '@/components/consultations/ConsultationCard'
import AppointmentDetailModal from '@/components/calender/AppointmentDetailModal'
import AppointmentManagementPanel from '@/components/appointments/AppointmentManagementPanel'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './ConsultasPage.css'

/**
 * ConsultasPage - Página de gestión de consultas
 *
 * RF-07: Gestión de historias clínicas
 * RF-11: Seguimiento de pacientes
 *
 * Permisos:
 * - VETERINARIO: Ver todas las citas confirmadas + crear consultas
 * - SUPERADMIN: Ver todas las citas confirmadas + crear consultas
 */
function ConsultasPage() {
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterVeterinarian, setFilterVeterinarian] = useState('all')

  // Estados de modales
  const [isManagementPanelOpen, setIsManagementPanelOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Verificar permisos
  const canManageConsultations = ['superadmin', 'veterinario'].includes(currentUser?.rol)

  // Cargar citas confirmadas
  useEffect(() => {
    if (canManageConsultations) {
      loadConfirmedAppointments()
    }
  }, [canManageConsultations])

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    applyFilters()
  }, [appointments, searchTerm, filterDate, filterVeterinarian])

  /**
   * Carga todas las citas en estado CONFIRMADA o EN_PROCESO
   */
  const loadConfirmedAppointments = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('📞 Cargando citas confirmadas...')

      // Obtener todas las citas
      const response = await appointmentService.getAllAppointments()

      // Extracción correcta del array de citas
      const allAppointments = response.data?.citas || []

      if (!Array.isArray(allAppointments)) {
        throw new Error('La respuesta del servidor no contiene un array de citas válido')
      }

      // Filtrar citas confirmadas o en proceso
      const confirmedAppointments = allAppointments.filter(
        apt => apt.estado === 'confirmada' || apt.estado === 'en_proceso'
      )

      console.log('✅ Citas confirmadas/en proceso:', confirmedAppointments.length)

      setAppointments(confirmedAppointments)
    } catch (err) {
      console.error('❌ Error al cargar citas:', err)
      setError(err.message || 'Error al cargar las citas confirmadas')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aplica filtros de búsqueda y fecha
   */
  const applyFilters = () => {
    let filtered = [...appointments]

    // Filtro por búsqueda (nombre del paciente o propietario)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.mascota?.nombre?.toLowerCase().includes(search) ||
        apt.mascota?.propietario?.nombre?.toLowerCase().includes(search) ||
        apt.propietario?.nombre?.toLowerCase().includes(search)
      )
    }

    // Filtro por fecha
    if (filterDate) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.fecha_hora).toISOString().split('T')[0]
        return aptDate === filterDate
      })
    }

    // Filtro por veterinario
    if (filterVeterinarian !== 'all') {
      filtered = filtered.filter(apt =>
        apt.veterinario_id === filterVeterinarian
      )
    }

    setFilteredAppointments(filtered)
  }

  /**
   *  Inicia la cita y abre el panel de gestión
   */
  const handleStartConsultation = async (appointment) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const estadoNormalizado = appointment.estado?.toLowerCase()

      console.log(`📋 Procesando cita ${appointment.id} con estado: ${estadoNormalizado}`)

      if (estadoNormalizado === 'en_proceso') {
        // Cita EN_PROCESO → Abrir panel directamente
        console.log('📝 Cita en proceso detectada. Abriendo panel...')
        setSelectedAppointment(appointment)
        setIsManagementPanelOpen(true)
        setSuccess('Continuando con la consulta en proceso')

      } else if (estadoNormalizado === 'confirmada') {
        // Cita CONFIRMADA → Iniciar consulta primero
        console.log('▶️ Iniciando cita confirmada...')

        await appointmentService.startAppointment(appointment.id)

        setSuccess('Cita iniciada correctamente')
        setSelectedAppointment(appointment)
        setIsManagementPanelOpen(true)

        // Recargar citas para reflejar el nuevo estado
        await loadConfirmedAppointments()
      } else {
        throw new Error(`Estado de cita no válido: ${appointment.estado}`)
      }

    } catch (err) {
      console.error('❌ Error al procesar consulta:', err)
      setError(err.message || 'Error al procesar la consulta')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Abre modal de detalles de cita
   */
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

  /**
   *  Callback cuando se cierra el panel sin completar
   */
  const handleClosePanel = () => {
    setIsManagementPanelOpen(false)
    setSelectedAppointment(null)
    // Recargar citas por si hubo cambios
    loadConfirmedAppointments()
  }

  /**
   * Callback cuando se completa la cita
   */
  const handleCompleteAppointment = () => {
    setIsManagementPanelOpen(false)
    setSelectedAppointment(null)
    setSuccess('Cita completada exitosamente')
    // Recargar citas para actualizar estados
    loadConfirmedAppointments()
  }

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterDate('')
    setFilterVeterinarian('all')
  }

  // Si no tiene permisos
  if (!canManageConsultations) {
    return (
      <div className="consultas-page">
        <Alert variant="error">
          No tienes permisos para acceder a esta página.
        </Alert>
      </div>
    )
  }

  return (
    <div className="consultas-page">
      {/* Header */}
      <div className="consultas-page__header">
        <h1 className="consultas-page__title">Gestión de Consultas</h1>
        <p className="consultas-page__subtitle">
          Citas confirmadas y en proceso listas para consulta veterinaria
        </p>
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
      <motion.div
        className="consultas-page__filters"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="consultas-page__filter-group">
          <Search size={20} className="consultas-page__filter-icon" />
          <Input
            type="text"
            placeholder="Buscar por paciente o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="consultas-page__filter-input"
          />
        </div>

        <div className="consultas-page__filter-group">
          <Calendar size={20} className="consultas-page__filter-icon" />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="consultas-page__date-filter"
          />
        </div>

        {(searchTerm || filterDate) && (
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="small"
          >
            Limpiar filtros
          </Button>
        )}
      </motion.div>

      {/* Contenido */}
      <motion.div
        className="consultas-page__content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {loading ? (
          <div className="consultas-page__loading">
            <div className="spinner"></div>
            <p>Cargando citas confirmadas...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="consultas-page__empty">
            <AlertCircle size={48} />
            <h3>No hay citas confirmadas</h3>
            <p>
              {searchTerm || filterDate
                ? 'No se encontraron citas con los filtros aplicados'
                : 'No hay citas en estado confirmada o en proceso'}
            </p>
          </div>
        ) : (
          <div className="consultas-page__grid">
            {filteredAppointments.map((appointment) => (
              <ConsultationCard
                key={appointment.id}
                appointment={appointment}
                onStartConsultation={handleStartConsultation}
                onViewDetails={handleViewDetails}
                isLoading={loading}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/*  Panel de Gestión de Citas */}
      <AppointmentManagementPanel
        appointment={selectedAppointment}
        isOpen={isManagementPanelOpen}
        onClose={handleClosePanel}
        onComplete={handleCompleteAppointment}
      />

      {/* Modal de Detalles (mantener para vista rápida) */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
      />
    </div>
  )
}

export default ConsultasPage