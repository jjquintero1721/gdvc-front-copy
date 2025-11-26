import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAllAppointments } from '@services/appointmentsService.js';
import './WeeklyCalendar.css';

/**
 * Componente WeeklyCalendar - Vista de calendario semanal con estilos mejorados
 *
 * Features:
 * - Estilos profesionales y animaciones sutiles
 * - Vista semanal y diaria de citas
 * - Indicador de tiempo actual
 * - Colores diferenciados por tipo de cita
 * - Interacciones suaves y responsivas
 *
 * @param {Function} onDayClick - Callback cuando se hace click en un día
 * @param {Number} refreshTrigger - Trigger para recargar datos
 * @param {String} currentUserId - ID del usuario actual
 * @param {String} currentUserRole - Rol del usuario actual
 */
const WeeklyCalendar = ({ onDayClick, refreshTrigger, currentUserId, currentUserRole }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef(null);

  // Cargar citas cuando el componente monta o cuando se activa el refresh
  useEffect(() => {
    loadAppointments();
  }, [refreshTrigger]);

  /**
   * Cargar citas desde el backend y transformarlas a eventos del calendario
   */
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();

      // Transformar citas a formato de eventos de FullCalendar
      const calendarEvents = data.map(appointment => {
        // Determinar el color basado en el estado y usuario
        const isCurrentUser = appointment.veterinario_id === currentUserId;
        let backgroundColor, borderColor, className;

        if (appointment.estado === 'cancelada') {
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          className = 'event-cancelled';
        } else if (appointment.estado === 'pendiente') {
          backgroundColor = '#f59e0b';
          borderColor = '#d97706';
          className = 'event-pending';
        } else if (isCurrentUser) {
          backgroundColor = '#3b82f6';
          borderColor = '#2563eb';
          className = 'event-current-user';
        } else {
          backgroundColor = '#10b981';
          borderColor = '#059669';
          className = 'event-other-user';
        }

        return {
          id: appointment.id,
          title: `${appointment.mascota?.nombre || 'Mascota'} - Dr. ${appointment.veterinario?.apellido || 'Veterinario'}`,
          start: appointment.fecha_hora,
          backgroundColor,
          borderColor,
          className,
          extendedProps: {
            appointment: appointment,
            isCurrentUser: isCurrentUser,
            estado: appointment.estado
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler cuando se hace click en un día del calendario
   */
  const handleDateClick = (info) => {
    if (onDayClick) {
      onDayClick(info.date);
    }
  };

  /**
   * Handler cuando se hace click en un evento (cita)
   */
  const handleEventClick = (info) => {
    const appointment = info.event.extendedProps.appointment;
    console.log('📅 Evento clickeado:', appointment);
    // Aquí podrías abrir un modal de detalle directamente
    // Por ejemplo: openAppointmentDetailModal(appointment);
  };

  /**
   * Formateo personalizado para los slots de tiempo
   */
  const slotLabelFormat = {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
    hour12: true
  };

  /**
   * Formateo personalizado para los eventos
   */
  const eventTimeFormat = {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
    hour12: true
  };

  /**
   * Formateo personalizado para los encabezados de día
   */
  const dayHeaderFormat = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  };

  return (
    <div className="weekly-calendar">
      {/* Overlay de carga */}
      {loading && (
        <div className="weekly-calendar-loading">
          <div className="weekly-calendar-loading-content">
            <div className="weekly-calendar-spinner"></div>
            <span className="weekly-calendar-loading-text">Cargando citas...</span>
          </div>
        </div>
      )}

      {/* Calendario FullCalendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"

        // Configuración del toolbar
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}

        // Configuración de botones en español
        buttonText={{
          today: 'Hoy',
          week: 'Semana',
          day: 'Día',
          prev: '◀',
          next: '▶'
        }}

        // Idioma español
        locale="es"

        // Horario de trabajo: 8:00 AM - 6:00 PM
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"

        // Configuración de slots
        allDaySlot={false}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"

        // Altura automática
        expandRows={true}
        height="auto"

        // Datos de eventos
        events={events}

        // Handlers
        dateClick={handleDateClick}
        eventClick={handleEventClick}

        // Formatos personalizados
        slotLabelFormat={slotLabelFormat}
        eventTimeFormat={eventTimeFormat}
        dayHeaderFormat={dayHeaderFormat}

        // Indicador de tiempo actual
        nowIndicator={true}

        // Navegación por scroll
        scrollTime="08:00:00"
        scrollTimeReset={false}

        // Opciones de selección
        selectable={true}
        selectMirror={true}

        // Mejoras de UX
        eventDisplay="block"
        dayMaxEvents={true}

        // Clases CSS personalizadas
        dayCellClassNames={(arg) => {
          const classes = [];
          if (arg.isToday) classes.push('fc-day-today');
          if (arg.date.getDay() === 0 || arg.date.getDay() === 6) {
            classes.push(arg.date.getDay() === 0 ? 'fc-day-sun' : 'fc-day-sat');
          }
          return classes;
        }}

        // Clases para eventos
        eventClassNames={(arg) => {
          return arg.event.classNames || [];
        }}
      />

      {/* Leyenda de colores */}
      <div className="calendar-legend">
        <div className="calendar-legend-item">
          <div
            className="calendar-legend-color"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          />
          <span>Mis citas</span>
        </div>

        <div className="calendar-legend-item">
          <div
            className="calendar-legend-color"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          />
          <span>Otras citas</span>
        </div>

        <div className="calendar-legend-item">
          <div
            className="calendar-legend-color"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          />
          <span>Pendientes</span>
        </div>

        <div className="calendar-legend-item">
          <div
            className="calendar-legend-color"
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          />
          <span>Canceladas</span>
        </div>
      </div>

      {/* Tip útil */}
      <div className="calendar-tip">
        <p className="calendar-tip-text">
          <span className="calendar-tip-icon">💡</span>
          <span>
            <strong>Tip:</strong> Haz click en cualquier día para ver los horarios disponibles y las citas programadas.
          </span>
        </p>
      </div>
    </div>
  );
};

export default WeeklyCalendar;