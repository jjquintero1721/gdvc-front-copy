import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Search, Filter, Calendar, AlertCircle } from 'lucide-react'
import appointmentService from '@/services/appointmentService'
import consultationService from '@/services/consultationService'
import ConsultationCard from '@/components/consultations/ConsultationCard'
import ConsultationFormModal from '@/components/consultations/ConsultationFormModal'
import AppointmentDetailModal from '@/components/calender/AppointmentDetailModal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './ConsultasPage.css'

/**
 * ConsultasPage - Página de gestión de consultas
 *
 * ✅ CORRECCIONES APLICADAS:
 * 1. Detecta si una cita está EN_PROCESO
 * 2. Para citas EN_PROCESO, busca la consulta existente
 * 3. Permite "continuar" consultas en proceso
 * 4. Mantiene el flujo correcto para citas CONFIRMADA
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
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [existingConsultation, setExistingConsultation] = useState(null)

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
   *
   * FIXES:
   * - Estados en minúsculas: 'confirmada', 'en_proceso'
   * - Extracción correcta: response.data.citas
   */
  const loadConfirmedAppointments = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('📞 Llamando a appointmentService.getAllAppointments()')

      // Obtener todas las citas
      const response = await appointmentService.getAllAppointments()

      console.log('📦 Respuesta completa:', response)

      // Extracción correcta del array de citas
      const allAppointments = response.data?.citas || []

      console.log('📋 Total de citas recibidas:', allAppointments.length)

      if (!Array.isArray(allAppointments)) {
        console.error('❌ allAppointments NO es un array:', allAppointments)
        throw new Error('La respuesta del servidor no contiene un array de citas válido')
      }

      // Filtrar usando estados en MINÚSCULAS
      const confirmedAppointments = allAppointments.filter(
        apt => apt.estado === 'confirmada' || apt.estado === 'en_proceso'
      )

      console.log('✅ Citas confirmadas/en proceso:', confirmedAppointments.length)
      console.log('🔍 Estados encontrados:', [...new Set(allAppointments.map(a => a.estado))])

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
        apt.mascota?.propietario?.nombre?.toLowerCase().includes(search)
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
   * ✅ NUEVO: Busca una consulta existente para una cita
   * Útil para citas EN_PROCESO que ya tienen una consulta iniciada
   */
  const findExistingConsultation = async (appointmentId) => {
    try {
      console.log(`🔍 Buscando consulta existente para cita ${appointmentId}`)

      // OPCIÓN 1: Si existe un endpoint para obtener consulta por cita_id
      // const response = await consultationService.getConsultationByAppointmentId(appointmentId)

      // OPCIÓN 2: Si solo tienes el ID de la historia clínica
      // Por ahora retornamos null, lo implementarás según tu backend

      // TODO: Implementar según endpoint disponible
      return null

    } catch (err) {
      console.warn('⚠️ No se encontró consulta existente:', err.message)
      return null
    }
  }

  /**
   * ✅ CORREGIDO: Inicia o continúa una consulta según el estado de la cita
   */
  const handleStartConsultation = async (appointment) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const estadoNormalizado = appointment.estado?.toString().toUpperCase()

      console.log(`📋 Procesando cita ${appointment.id} con estado: ${estadoNormalizado}`)

      if (estadoNormalizado === 'EN_PROCESO') {
        // ✅ CASO 1: Cita EN_PROCESO → Buscar consulta existente y abrir modal
        console.log('📝 Cita en proceso detectada. Buscando consulta existente...')

        const existingConsult = await findExistingConsultation(appointment.id)

        if (existingConsult) {
          console.log('✅ Consulta existente encontrada')
          setExistingConsultation(existingConsult)
          setSuccess('Continuando con la consulta en proceso')
        } else {
          console.log('⚠️ No se encontró consulta. Permitiendo crear una nueva.')
          setExistingConsultation(null)
        }

        // Abrir modal directamente
        setSelectedAppointment(appointment)
        setIsConsultationModalOpen(true)

      } else {
        // ✅ CASO 2: Cita CONFIRMADA → Iniciar consulta (cambiar estado a EN_PROCESO)
        console.log('▶️ Iniciando cita confirmada...')

        await appointmentService.startAppointment(appointment.id)

        setSuccess('Consulta iniciada correctamente')
        setSelectedAppointment(appointment)
        setExistingConsultation(null)
        setIsConsultationModalOpen(true)

        // Recargar citas para reflejar el nuevo estado
        await loadConfirmedAppointments()
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
   * Callback después de guardar consulta
   */
  const handleConsultationSaved = async () => {
    await loadConfirmedAppointments()
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
            className="consultas-page__search"
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

      {/* Modales */}
      <ConsultationFormModal
        isOpen={isConsultationModalOpen}
        onClose={() => {
          setIsConsultationModalOpen(false)
          setSelectedAppointment(null)
          setExistingConsultation(null)
        }}
        appointment={selectedAppointment}
        existingConsultation={existingConsultation}
        onSave={handleConsultationSaved}
      />

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