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
 * Muestra horarios disponibles sin mostrar detalles de otras citas
 * Similar a DaySidePanel pero sin información sensible
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
  const [availability, setAvailability] = useState({})
  const [loading, setLoading] = useState(false)

  /**
   * Cargar disponibilidad cuando cambia la fecha o el veterinario
   */
  useEffect(() => {
    if (selectedDate && veterinarianId) {
      loadAvailability()
    }
  }, [selectedDate, veterinarianId])

  /**
   * Cargar disponibilidad del veterinario para la fecha seleccionada
   */
  const loadAvailability = async () => {
    try {
      setLoading(true)

      const formattedDate = format(selectedDate, 'yyyy-MM-dd')

      // Obtener citas del veterinario para ese día
      const response = await appointmentService.getAppointmentsByDate(formattedDate)
      const appointments = response.data?.citas || []

      // Filtrar solo las citas del veterinario seleccionado que no estén canceladas
      const vetAppointments = appointments.filter(
        apt => apt.veterinario_id === veterinarianId && apt.estado !== 'CANCELADA'
      )

      // Crear mapa de disponibilidad
      const availabilityMap = {}

      vetAppointments.forEach(apt => {
        try {
          // Extraer hora UTC
          const timeMatch = apt.fecha_hora.match(/T(\d{2}:\d{2})/)
          if (timeMatch && timeMatch[1]) {
            availabilityMap[timeMatch[1]] = false // Ocupado
          }
        } catch (error) {
          console.error('Error al procesar fecha:', error)
        }
      })

      // Marcar todos los horarios como disponibles si no están en el mapa
      WORK_HOURS.forEach(hour => {
        if (!(hour in availabilityMap)) {
          availabilityMap[hour] = true // Disponible
        }
      })

      setAvailability(availabilityMap)
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error)
      // En caso de error, marcar todos como disponibles
      const fallbackAvailability = {}
      WORK_HOURS.forEach(hour => {
        fallbackAvailability[hour] = true
      })
      setAvailability(fallbackAvailability)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Seleccionar horario
   */
  const handleTimeSlotClick = (hour) => {
    if (!availability[hour]) {
      // Horario ocupado
      return
    }

    // Construir fecha y hora completa en formato ISO
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dateTime = `${dateStr}T${hour}:00.000Z`

    onTimeSlotSelected(dateTime)
  }

  /**
   * Cambiar fecha
   */
  const handleDateChange = (days) => {
    const newDate = addDays(selectedDate, days)
    const today = startOfDay(new Date())

    // No permitir fechas pasadas
    if (newDate >= today) {
      onDateChange(newDate)
    }
  }

  /**
   * Verificar si el horario está seleccionado
   */
  const isTimeSlotSelected = (hour) => {
    if (!selectedTimeSlot) return false

    try {
      const timeMatch = selectedTimeSlot.match(/T(\d{2}:\d{2})/)
      return timeMatch && timeMatch[1] === hour
    } catch (error) {
      return false
    }
  }

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
            const isAvailable = availability[hour]
            const isSelected = isTimeSlotSelected(hour)

            return (
              <button
                key={hour}
                type="button"
                onClick={() => handleTimeSlotClick(hour)}
                disabled={!isAvailable}
                className={`
                  owner-availability-panel__slot
                  ${isAvailable ? 'owner-availability-panel__slot--available' : 'owner-availability-panel__slot--occupied'}
                  ${isSelected ? 'owner-availability-panel__slot--selected' : ''}
                `}
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