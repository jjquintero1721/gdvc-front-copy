import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// ✅ CORRECCIÓN: Usar el servicio correcto que tiene apiClient configurado
import appointmentService from '@/services/appointmentService';

import './WeeklyCalendar.css';

/**
 * Componente WeeklyCalendar - Vista de calendario semanal
 *
 * ✅ CORRECCIÓN APLICADA:
 * - Cambiado de appointmentsService.js (viejo) a appointmentService.js (correcto)
 * - El nuevo servicio usa apiClient que incluye el interceptor JWT
 * - Ahora envía correctamente Authorization: Bearer <token>
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
   * ✅ FUNCIÓN CORREGIDA: Cargar citas desde el backend usando el servicio correcto
   */
  const loadAppointments = async () => {
    setLoading(true);
    try {
      console.log('📅 Cargando citas desde el backend...');

      // ✅ CORRECCIÓN: Usar appointmentService (con apiClient y JWT)
      // Nota: El backend tiene un límite máximo de 100 por request
      const response = await appointmentService.getAllAppointments({
        skip: 0,
        limit: 100  // Máximo permitido por el backend
      });

      console.log('✅ Respuesta del backend:', response);

      // ✅ CORRECCIÓN: El backend envuelve todo en { success, message, data }
      // La estructura real es: { data: { total: X, citas: [...] } }
      const appointments = response.data?.citas || [];

      console.log(`✅ ${appointments.length} citas cargadas`);

      // Transformar citas a formato de eventos de FullCalendar
      const calendarEvents = appointments.map((appointment) => {
        // Determinar color según estado
        let backgroundColor = '#3b82f6'; // Azul por defecto
        let borderColor = '#2563eb';

        if (appointment.estado === 'CANCELADA') {
          backgroundColor = '#ef4444'; // Rojo
          borderColor = '#dc2626';
        } else if (appointment.estado === 'COMPLETADA') {
          backgroundColor = '#10b981'; // Verde
          borderColor = '#059669';
        } else if (appointment.estado === 'PENDIENTE' || appointment.estado === 'AGENDADA') {
          backgroundColor = '#f59e0b'; // Naranja
          borderColor = '#d97706';
        } else if (appointment.estado === 'CONFIRMADA') {
          backgroundColor = '#3b82f6'; // Azul
          borderColor = '#2563eb';
        }

        // Si es mi cita (del veterinario actual), usar azul más intenso
        if (appointment.veterinario_id === currentUserId) {
          backgroundColor = '#3b82f6';
          borderColor = '#1d4ed8';
        }

        return {
          id: appointment.id,
          title: `${appointment.mascota?.nombre || 'Mascota'} - ${appointment.propietario?.nombre || 'Cliente'}`,
          start: appointment.fecha_hora,
          end: appointment.fecha_fin || appointment.fecha_hora, // Si no hay fecha_fin, usar la misma
          backgroundColor,
          borderColor,
          textColor: '#ffffff',
          classNames: [
            'fc-event-custom',
            appointment.veterinario_id === currentUserId ? 'fc-event-mine' : 'fc-event-other'
          ],
          extendedProps: {
            appointment: appointment,
            estado: appointment.estado,
            veterinario: appointment.veterinario?.nombre || 'Sin asignar',
            motivo: appointment.motivo || 'Sin motivo especificado'
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);

      // ✅ Manejo mejorado de errores
      if (error.response?.status === 403) {
        console.error('🔒 Error 403: Sin permisos para ver citas. Verifica tu rol y autenticación.');
      } else if (error.response?.status === 401) {
        console.error('🔐 Error 401: Token inválido o expirado. Recarga la página o inicia sesión nuevamente.');
      } else {
        console.error('⚠️ Error inesperado:', error.message);
      }
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

        // Configuración de idioma y formato
        locale="es"
        buttonText={{
          today: 'Hoy',
          week: 'Semana',
          day: 'Día'
        }}

        // Configuración de tiempo
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        slotLabelFormat={slotLabelFormat}
        eventTimeFormat={eventTimeFormat}
        dayHeaderFormat={dayHeaderFormat}

        // Configuración de altura
        height="auto"
        contentHeight="auto"
        aspectRatio={1.8}

        // Configuración de días
        weekends={true}
        allDaySlot={false}
        nowIndicator={true}

        // Eventos
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}

        // Clases personalizadas para días
        dayCellClassNames={(arg) => {
          const classes = ['fc-day-custom'];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const cellDate = new Date(arg.date);
          cellDate.setHours(0, 0, 0, 0);

          if (cellDate.getTime() === today.getTime()) {
            classes.push('fc-day-today-custom');
          }

          if (arg.isOther) {
            classes.push('fc-day-other');
          }

          // Agregar clase para fines de semana
          const dayOfWeek = arg.date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            classes.push(dayOfWeek === 0 ? 'fc-day-sun' : 'fc-day-sat');
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