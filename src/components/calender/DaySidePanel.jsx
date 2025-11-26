import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAppointmentsByDate } from '@services/appointmentsService.js';
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
 *
 * Features:
 * ✅ Diseño profesional con CSS personalizado
 * ✅ Animaciones suaves de entrada/salida
 * ✅ Lista de horarios con citas
 * ✅ Badges de estado
 * ✅ Iconos SVG profesionales
 * ✅ Responsive design
 */
const DaySidePanel = ({ isOpen, onClose, selectedDate, currentUserId, currentUserRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar citas cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate && isOpen) {
      loadDayAppointments();
    }
  }, [selectedDate, isOpen]);

  /**
   * Cargar citas del día seleccionado
   */
  const loadDayAppointments = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const data = await getAppointmentsByDate(selectedDate);
      setAppointments(data || []);
    } catch (error) {
      console.error('❌ Error al cargar citas del día:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrupar citas por hora
   */
  const groupAppointmentsByHour = () => {
    const grouped = {};

    appointments.forEach(appointment => {
      const appointmentTime = format(parseISO(appointment.fecha_hora), 'HH:mm');
      if (!grouped[appointmentTime]) {
        grouped[appointmentTime] = [];
      }
      grouped[appointmentTime].push(appointment);
    });

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
                    Horarios laborales: 8:00 AM - 5:30 PM
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
    isCurrentUser ? 'appointment-item--current-user' : 'appointment-item--other-user'
  }`;

  // Determinar estado
  const getStatusClass = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'appointment-item__status--confirmed';
      case 'pendiente':
        return 'appointment-item__status--pending';
      case 'cancelada':
        return 'appointment-item__status--cancelled';
      default:
        return 'appointment-item__status--pending';
    }
  };

  return (
    <div className={itemClass} onClick={onClick}>
      <div className="appointment-item__icon">
        🐾
      </div>
      <div className="appointment-item__content">
        <p className="appointment-item__name">
          {appointment.mascota?.nombre || 'Mascota'} - Dr. {appointment.veterinario?.apellido || 'Veterinario'}
        </p>
        <div className="appointment-item__details">
          <span>{appointment.propietario?.nombre || 'Propietario'}</span>
          <span className={`appointment-item__status ${getStatusClass(appointment.estado)}`}>
            {appointment.estado || 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DaySidePanel;