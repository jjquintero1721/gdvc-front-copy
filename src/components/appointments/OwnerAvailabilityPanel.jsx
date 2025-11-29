import { useState, useEffect } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import appointmentService from '@/services/appointmentService'
import './OwnerAvailabilityPanel.css'

// Horarios laborales: 8:00 AM - 5:30 PM con intervalos de 30 minutos
const WORK_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

/**
 * OwnerAvailabilityPanel - Panel de disponibilidad para propietarios
 *
 * 1. Inicialización correcta del estado availability
 * 2. Logs de depuración mejorados
 * 3. Manejo explícito de estados undefined
 * 4. Re-renderizado forzado después de cargar datos
 *
 * @param {Date} selectedDate - Fecha seleccionada
 * @param {Function} onDateChange - Callback para cambiar fecha
 * @param {String} veterinarianId - ID del veterinario
 * @param {Function} onTimeSlotSelected - Callback cuando se selecciona un horario
 * @param {String} selectedTimeSlot - Horario actualmente seleccionado
 */
function OwnerAvailabilityPanel({
  selectedDate,
  onDateChange,
  veterinarianId,
  onTimeSlotSelected,
  selectedTimeSlot
}) {
  //  Inicializar con todos los horarios disponibles por defecto
  const [availability, setAvailability] = useState(() => {
    const initialAvailability = {}
    WORK_HOURS.forEach(hour => {
      initialAvailability[hour] = true // Todos disponibles por defecto
    })
    console.log('🔵 [OwnerAvailabilityPanel] Estado inicial creado:', initialAvailability)
    return initialAvailability
  })

  const [loading, setLoading] = useState(false)

  /**
   * Agregar logs y recargar cuando cambian las dependencias
   */
  useEffect(() => {
    console.log('🔵 [OwnerAvailabilityPanel] useEffect disparado')
    console.log('  - Fecha seleccionada:', selectedDate)
    console.log('  - Veterinario ID:', veterinarianId)

    if (selectedDate && veterinarianId) {
      loadAvailability()
    } else {
      console.warn('⚠️ [OwnerAvailabilityPanel] Falta fecha o veterinario, no se cargará disponibilidad')
    }
  }, [selectedDate, veterinarianId])

  /**
   * Función mejorada con logs de depuración
   */
  const loadAvailability = async () => {
    try {
      setLoading(true)
      console.log('📅 [OwnerAvailabilityPanel] Cargando disponibilidad...')

      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      console.log('  - Fecha formateada:', formattedDate)
      console.log('  - Veterinario ID:', veterinarianId)

      // Obtener citas del día
      const response = await appointmentService.getAppointmentsByDate(formattedDate)
      const appointments = response.data?.citas || []

      console.log(`✅ [OwnerAvailabilityPanel] ${appointments.length} citas obtenidas del backend`)
      console.log('  - Todas las citas:', appointments)

      // Filtrar solo las citas del veterinario seleccionado que no estén canceladas
      const vetAppointments = appointments.filter(
        apt => apt.veterinario_id === veterinarianId && apt.estado !== 'CANCELADA'
      )

      console.log(`🔍 [OwnerAvailabilityPanel] ${vetAppointments.length} citas del veterinario ${veterinarianId}`)
      console.log('  - Citas filtradas:', vetAppointments)

      //  Crear un nuevo objeto para el mapa de disponibilidad
      // Empezar con todos los horarios disponibles
      const newAvailabilityMap = {}
      WORK_HOURS.forEach(hour => {
        newAvailabilityMap[hour] = true // Disponible por defecto
      })

      console.log('🟢 [OwnerAvailabilityPanel] Mapa inicial (todos disponibles):', newAvailabilityMap)

      // Marcar horarios ocupados
      vetAppointments.forEach((apt, index) => {
        try {
          console.log(`  - Procesando cita ${index + 1}:`, apt)

          // Extraer hora UTC
          const timeMatch = apt.fecha_hora.match(/T(\d{2}:\d{2})/)

          if (timeMatch && timeMatch[1]) {
            const hour = timeMatch[1]
            console.log(`    ✅ Hora extraída: ${hour}`)

            //  Marcar como OCUPADO
            newAvailabilityMap[hour] = false
            console.log(`    🔴 Horario ${hour} marcado como OCUPADO`)
          } else {
            console.warn(`    ⚠️ No se pudo extraer hora de:`, apt.fecha_hora)
          }
        } catch (error) {
          console.error('    ❌ Error al procesar fecha:', error, apt)
        }
      })

      console.log('📊 [OwnerAvailabilityPanel] Mapa final de disponibilidad:', newAvailabilityMap)

      //  Contar disponibles y ocupados
      const availableCount = Object.values(newAvailabilityMap).filter(v => v === true).length
      const occupiedCount = Object.values(newAvailabilityMap).filter(v => v === false).length

      console.log('📈 [OwnerAvailabilityPanel] Resumen:')
      console.log(`  - Horarios disponibles: ${availableCount}`)
      console.log(`  - Horarios ocupados: ${occupiedCount}`)

      //  Actualizar el estado con el nuevo mapa
      setAvailability(newAvailabilityMap)
      console.log('✅ [OwnerAvailabilityPanel] Estado actualizado correctamente')

    } catch (error) {
      console.error('❌ [OwnerAvailabilityPanel] Error al cargar disponibilidad:', error)

      // En caso de error, marcar todos como disponibles
      const fallbackAvailability = {}
      WORK_HOURS.forEach(hour => {
        fallbackAvailability[hour] = true
      })
      setAvailability(fallbackAvailability)
      console.log('⚠️ [OwnerAvailabilityPanel] Usando disponibilidad por defecto (todos disponibles)')
    } finally {
      setLoading(false)
      console.log('🔵 [OwnerAvailabilityPanel] Carga finalizada')
    }
  }

  /**
   * Seleccionar horario
   */
  const handleTimeSlotClick = (hour) => {
    const isAvailable = availability[hour]

    console.log(`🖱️ [OwnerAvailabilityPanel] Click en horario ${hour}`)
    console.log(`  - Disponible: ${isAvailable}`)

    if (!isAvailable) {
      console.warn('⚠️ [OwnerAvailabilityPanel] Horario ocupado, no se puede seleccionar')
      return
    }

    // Construir fecha y hora completa en formato ISO
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dateTime = `${dateStr}T${hour}:00.000Z`

    console.log(`✅ [OwnerAvailabilityPanel] Horario seleccionado: ${dateTime}`)
    onTimeSlotSelected(dateTime)
  }

  /**
   * Cambiar fecha
   */
  const handleDateChange = (days) => {
    const newDate = addDays(selectedDate, days)
    const today = startOfDay(new Date())

    console.log(`📆 [OwnerAvailabilityPanel] Cambio de fecha solicitado: ${days} días`)
    console.log(`  - Nueva fecha: ${format(newDate, 'yyyy-MM-dd')}`)

    // No permitir fechas pasadas
    if (newDate >= today) {
      onDateChange(newDate)
      console.log('✅ [OwnerAvailabilityPanel] Fecha cambiada correctamente')
    } else {
      console.warn('⚠️ [OwnerAvailabilityPanel] No se puede seleccionar una fecha pasada')
    }
  }

  /**
   * Verificar si el horario está seleccionado
   */
  const isTimeSlotSelected = (hour) => {
    if (!selectedTimeSlot) return false

    try {
      const timeMatch = selectedTimeSlot.match(/T(\d{2}:\d{2})/)
      const isSelected = timeMatch && timeMatch[1] === hour

      if (isSelected) {
        console.log(`🎯 [OwnerAvailabilityPanel] Horario ${hour} está seleccionado`)
      }

      return isSelected
    } catch (error) {
      console.error('❌ [OwnerAvailabilityPanel] Error al verificar selección:', error)
      return false
    }
  }

  //  Log del estado actual antes de renderizar
  console.log('🎨 [OwnerAvailabilityPanel] Renderizando con estado:', {
    loading,
    availabilityKeys: Object.keys(availability).length,
    availability: availability
  })

  return (
    <div className="owner-availability-panel">
      {/* Selector de fecha */}
      <div className="owner-availability-panel__date-selector">
        <button
          type="button"
          onClick={() => handleDateChange(-1)}
          className="owner-availability-panel__date-btn"
          disabled={loading}
        >
          <svg className="owner-availability-panel__date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="owner-availability-panel__date-display">
          <span className="owner-availability-panel__date-text">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleDateChange(1)}
          className="owner-availability-panel__date-btn"
          disabled={loading}
        >
          <svg className="owner-availability-panel__date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid de horarios */}
      <div className="owner-availability-panel__grid">
        {loading ? (
          <div className="owner-availability-panel__loading">
            <div className="owner-availability-panel__spinner"></div>
            <p>Cargando disponibilidad...</p>
          </div>
        ) : (
          WORK_HOURS.map(hour => {
            //  Verificar explícitamente el valor
            const isAvailable = availability[hour] === true
            const isOccupied = availability[hour] === false
            const isUndefined = availability[hour] === undefined
            const isSelected = isTimeSlotSelected(hour)

            // Log para debugging de cada slot
            if (isUndefined) {
              console.warn(`⚠️ [OwnerAvailabilityPanel] Horario ${hour} tiene valor undefined`)
            }

            return (
              <button
                key={hour}
                type="button"
                onClick={() => handleTimeSlotClick(hour)}
                disabled={!isAvailable}
                className={`
                  owner-availability-panel__slot
                  ${isAvailable ? 'owner-availability-panel__slot--available' : ''}
                  ${isOccupied ? 'owner-availability-panel__slot--occupied' : ''}
                  ${isUndefined ? 'owner-availability-panel__slot--undefined' : ''}
                  ${isSelected ? 'owner-availability-panel__slot--selected' : ''}
                `}
                title={`${hour} - ${isAvailable ? 'Disponible' : 'Ocupado'}`}
              >
                <svg className="owner-availability-panel__slot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="owner-availability-panel__slot-time">
                  {format(new Date(`2000-01-01T${hour}`), 'h:mm a')}
                </span>
                {isSelected && (
                  <svg className="owner-availability-panel__slot-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Leyenda */}
      <div className="owner-availability-panel__legend">
        <div className="owner-availability-panel__legend-item">
          <div className="owner-availability-panel__legend-dot owner-availability-panel__legend-dot--available"></div>
          <span>Disponible</span>
        </div>
        <div className="owner-availability-panel__legend-item">
          <div className="owner-availability-panel__legend-dot owner-availability-panel__legend-dot--occupied"></div>
          <span>Ocupado</span>
        </div>
        <div className="owner-availability-panel__legend-item">
          <div className="owner-availability-panel__legend-dot owner-availability-panel__legend-dot--selected"></div>
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  )
}

export default OwnerAvailabilityPanel