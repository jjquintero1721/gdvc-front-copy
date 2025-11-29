import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// ✅ Servicio correcto
import appointmentService from '@/services/appointmentService';

import AppointmentDetailModal from './AppointmentDetailModal';
import './DaySidePanel.css';

// Horarios fijos: 8:00 AM - 5:30 PM con intervalos de 30 minutos
const WORK_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

/**
 * DaySidePanel - Panel lateral con horarios del día
 */
const DaySidePanel = ({
  isOpen,
  onClose,
  selectedDate,
  currentUserId,
  currentUserRole,
  refreshTrigger //  Recibir refreshTrigger
}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agregar refreshTrigger a las dependencias
  // Ahora se recargará cuando:
  // 1. Se abre el panel
  // 2. Cambia la fecha
  // 3. Se presiona el botón "Refrescar" (cambia refreshTrigger)
  useEffect(() => {
    if (selectedDate && isOpen) {
      loadDayAppointments();
    }
  }, [selectedDate, isOpen, refreshTrigger]); //  refreshTrigger agregado

  /**
   * Cargar citas del día seleccionado
   */
  const loadDayAppointments = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Formatear fecha a YYYY-MM-DD
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      console.log('📅 [DaySidePanel] Cargando citas del día:', formattedDate);

      // Usar el servicio correcto
      const response = await appointmentService.getAppointmentsByDate(formattedDate);

      // El backend devuelve: { success: true, data: { total: X, citas: [...] } }
      const dayAppointments = response.data?.citas || [];

      console.log(`✅ [DaySidePanel] ${dayAppointments.length} citas encontradas`);
      console.log('📋 [DaySidePanel] Citas:', dayAppointments);

      setAppointments(dayAppointments);
    } catch (error) {
      console.error('❌ [DaySidePanel] Error al cargar citas del día:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Extraer hora UTC sin conversión a hora local
   *
   * Evita problemas de timezone extrayendo directamente del string ISO
   */
  const extractUTCTime = (isoString) => {
    try {
      // Regex para extraer HH:mm de un string ISO
      // Ejemplo: "2025-11-26T08:00:00Z" → "08:00"
      const timeMatch = isoString.match(/T(\d{2}:\d{2})/);

      if (timeMatch && timeMatch[1]) {
        return timeMatch[1];
      }

      // Fallback usando Date.getUTCHours()
      const date = new Date(isoString);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error al extraer hora UTC:', error);
      return null;
    }
  };

  /**
   *  Agrupar citas por hora usando extracción directa
   */
  const groupAppointmentsByHour = () => {
    const grouped = {};

    appointments.forEach(appointment => {
      try {
        // Extraer hora directamente del string ISO (evita conversión a hora local)
        const appointmentTime = extractUTCTime(appointment.fecha_hora);

        if (!appointmentTime) {
          console.warn('⚠️ No se pudo extraer hora de:', appointment.fecha_hora);
          return;
        }

        console.log(`⏰ Cita en horario UTC: ${appointmentTime}`, {
          original: appointment.fecha_hora,
          extracted: appointmentTime
        });

        if (!grouped[appointmentTime]) {
          grouped[appointmentTime] = [];
        }
        grouped[appointmentTime].push(appointment);
      } catch (error) {
        console.error('❌ Error al procesar cita:', appointment.fecha_hora, error);
      }
    });

    console.log('📊 Citas agrupadas por hora (UTC):', grouped);
    return grouped;
  };

  /**
   * Handler para abrir modal de detalle
   */
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  /**
   * Handler para cerrar modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  };

  const groupedAppointments = groupAppointmentsByHour();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="day-side-panel-overlay"
              onClick={onClose}
            />

            {/* Panel deslizante */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="day-side-panel"
            >
              {/* Header del panel */}
              <div className="day-side-panel__header">
                <div className="day-side-panel__header-content">
                  <h2 className="day-side-panel__title">
                    {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                  </h2>
                  <p className="day-side-panel__subtitle">
                    Horarios laborales: 8:00 AM - 5:30 PM (UTC)
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="day-side-panel__close-btn"
                  aria-label="Cerrar panel"
                >
                  <svg
                    className="day-side-panel__close-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Contenido del panel */}
              <div className="day-side-panel__content">
                {loading ? (
                  <div className="day-side-panel__loading">
                    <div className="day-side-panel__spinner"></div>
                    <span className="day-side-panel__loading-text">Cargando horarios...</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="day-side-panel__empty">
                    <div className="day-side-panel__empty-icon">📅</div>
                    <h3 className="day-side-panel__empty-title">No hay citas programadas</h3>
                    <p className="day-side-panel__empty-text">
                      Este día no tiene citas agendadas aún.
                    </p>
                  </div>
                ) : (
                  <div className="day-side-panel__slots">
                    {WORK_HOURS.map((hour) => {
                      //  Buscar citas en este horario
                      const appointmentsInSlot = groupedAppointments[hour] || [];
                      const hasAppointments = appointmentsInSlot.length > 0;

                      return (
                        <div key={hour} className="day-side-panel__slot">
                          {/* Header del slot */}
                          <div className="day-side-panel__slot-header">
                            <div className="day-side-panel__slot-time-wrapper">
                              <svg
                                className="day-side-panel__slot-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="day-side-panel__slot-time">
                                {/* Formatear hora a formato legible (ej: 8:00 AM) */}
                                {format(new Date(`2000-01-01T${hour}`), 'h:mm a')}
                              </span>
                            </div>

                            {!hasAppointments && (
                              <span className="day-side-panel__slot-badge day-side-panel__slot-badge--available">
                                Disponible
                              </span>
                            )}
                          </div>

                          {/* Contenido del slot */}
                          <div className="day-side-panel__slot-content">
                            {hasAppointments ? (
                              appointmentsInSlot.map((appointment) => (
                                <AppointmentItem
                                  key={appointment.id}
                                  appointment={appointment}
                                  isCurrentUser={appointment.veterinario_id === currentUserId}
                                  onClick={() => handleAppointmentClick(appointment)}
                                />
                              ))
                            ) : (
                              <p className="day-side-panel__slot-empty">
                                No hay citas programadas en este horario
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer con estadísticas */}
              {!loading && appointments.length > 0 && (
                <div className="day-side-panel__footer">
                  <span className="day-side-panel__footer-stat">
                    Total de citas:{' '}
                    <span className="day-side-panel__footer-value">{appointments.length}</span>
                  </span>
                  <span className="day-side-panel__footer-stat">
                    Slots disponibles:{' '}
                    <span className="day-side-panel__footer-value day-side-panel__footer-value--success">
                      {WORK_HOURS.length - Object.keys(groupedAppointments).length}
                    </span>
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de detalle de cita */}
      <AppointmentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
      />
    </>
  );
};

/**
 * AppointmentItem - Componente de item de cita
 */
const AppointmentItem = ({ appointment, isCurrentUser, onClick }) => {
  // Determinar clase según tipo de usuario
  const itemClass = `appointment-item ${
    isCurrentUser ? 'appointment-item--mine' : ''
  }`;

  return (
    <div className={itemClass} onClick={onClick}>
      <div className="appointment-item__header">
        <span className="appointment-item__pet-name">
          {appointment.mascota?.nombre || 'Mascota'}
        </span>
        <span className={`appointment-item__status appointment-item__status--${appointment.estado}`}>
          {appointment.estado}
        </span>
      </div>
      {appointment.motivo && (
        <p className="appointment-item__reason">{appointment.motivo}</p>
      )}
      <div className="appointment-item__footer">
        <span className="appointment-item__vet">
           {appointment.veterinario?.nombre || 'Sin asignar'}
        </span>
      </div>
    </div>
  );
};

export default DaySidePanel;