import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAllAppointments } from '@services/appointmentsService.js';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const WeeklyCalendar = ({ onDayClick, refreshTrigger, currentUserId, currentUserRole }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef(null);

  // Cargar citas cuando el componente monta o cuando se activa el refresh
  useEffect(() => {
    loadAppointments();
  }, [refreshTrigger]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();

      // Transformar citas a formato de eventos de FullCalendar
      const calendarEvents = data.map(appointment => ({
        id: appointment.id,
        title: `${appointment.mascota?.nombre || 'Mascota'} - Dr. ${appointment.veterinario?.apellido || 'Veterinario'}`,
        start: appointment.fecha_hora,
        backgroundColor: appointment.veterinario_id === currentUserId ? '#3b82f6' : '#10b981',
        borderColor: appointment.veterinario_id === currentUserId ? '#2563eb' : '#059669',
        extendedProps: {
          appointment: appointment,
          isCurrentUser: appointment.veterinario_id === currentUserId
        }
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      setLoading(false);
    }
  };

  // Handler cuando se hace click en un día
  const handleDateClick = (info) => {
    onDayClick(info.date);
  };

  // Handler cuando se hace click en un evento (opcional, para vista previa rápida)
  const handleEventClick = (info) => {
    // Aquí podrías abrir el modal de detalle directamente
    console.log('Evento clickeado:', info.event.extendedProps.appointment);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Cargando citas...</span>
          </div>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        locale="es"
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        expandRows={true}
        height="auto"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }}
        // Estilos personalizados
        dayCellClassNames="hover:bg-blue-50 cursor-pointer transition-colors"
        eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
      />

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-gray-600">Mis citas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600">Otras citas</span>
        </div>
      </div>

      {/* Nota sobre horarios */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Haz click en cualquier día para ver los horarios disponibles y las citas programadas.
        </p>
      </div>
    </div>
  );
};

export default WeeklyCalendar;