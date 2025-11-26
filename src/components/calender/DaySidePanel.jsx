import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// ✅ CORRECCIÓN: Usar el servicio correcto con apiClient
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
 *
 * ✅ CORRECCIÓN APLICADA:
 * - Actualizado para usar appointmentService correcto
 * - Manejo correcto de la estructura de respuesta del backend
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
   * ✅ FUNCIÓN CORREGIDA: Cargar citas del día seleccionado
   */
  const loadDayAppointments = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Formatear fecha a YYYY-MM-DD
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      console.log('📅 Cargando citas del día:', formattedDate);

      // ✅ CORRECCIÓN: Usar appointmentService correcto
      const response = await appointmentService.getAppointmentsByDate(formattedDate);

      console.log('✅ Respuesta del backend:', response);

      // ✅ CORRECCIÓN: El backend envuelve en { success, message, data }
      const dayAppointments = response.data?.citas || [];

      console.log(`✅ ${dayAppointments.length} citas encontradas para el día`);

      setAppointments(dayAppointments);
    } catch (error) {
      console.error('❌ Error al cargar citas del día:', error);

      // ✅ Manejo mejorado de errores
      if (error.response?.status === 403) {
        console.error('🔒 Error 403: Sin permisos. Verifica tu rol.');
      } else if (error.response?.status === 401) {
        console.error('🔐 Error 401: Token inválido. Recarga la página.');
      }

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener citas para un horario específico
   */
  const getAppointmentsForHour = (hour) => {
    return appointments.filter(apt => {
      const aptTime = format(parseISO(apt.fecha_hora), 'HH:mm');
      return aptTime === hour;
    });
  };

  /**
   * Determinar si un horario está disponible
   */
  const isTimeSlotAvailable = (hour) => {
    const aptsInSlot = getAppointmentsForHour(hour);
    return aptsInSlot.length === 0;
  };

  /**
   * Handler para abrir detalle de cita
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

  /**
   * Obtener badge de estado
   */
  const getStatusBadge = (estado) => {
    const badges = {
      AGENDADA: { text: 'Agendada', className: 'badge-warning' },
      CONFIRMADA: { text: 'Confirmada', className: 'badge-info' },
      ATENDIDA: { text: 'Atendida', className: 'badge-success' },
      COMPLETADA: { text: 'Completada', className: 'badge-success' },
      CANCELADA: { text: 'Cancelada', className: 'badge-danger' },
      PENDIENTE: { text: 'Pendiente', className: 'badge-warning' }
    };

    const badge = badges[estado] || { text: estado, className: 'badge-secondary' };

    return (
      <span className={`appointment-badge ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  // Variantes de animación para Framer Motion
  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop oscuro */}
            <motion.div
              className="day-panel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Panel lateral */}
            <motion.div
              className="day-side-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header del panel */}
              <div className="day-panel-header">
                <div className="day-panel-header-content">
                  <h2 className="day-panel-title">
                    {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                  </h2>
                  <p className="day-panel-subtitle">
                    {appointments.length} {appointments.length === 1 ? 'cita programada' : 'citas programadas'}
                  </p>
                </div>

                <button
                  className="day-panel-close-btn"
                  onClick={onClose}
                  aria-label="Cerrar panel"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Contenido del panel */}
              <div className="day-panel-content">
                {loading ? (
                  <div className="day-panel-loading">
                    <div className="day-panel-spinner"></div>
                    <p>Cargando horarios...</p>
                  </div>
                ) : (
                  <div className="day-panel-schedule">
                    {WORK_HOURS.map((hour) => {
                      const appointmentsInSlot = getAppointmentsForHour(hour);
                      const isAvailable = appointmentsInSlot.length === 0;

                      return (
                        <div
                          key={hour}
                          className={`schedule-slot ${isAvailable ? 'available' : 'occupied'}`}
                        >
                          <div className="schedule-slot-time">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{hour}</span>
                          </div>

                          <div className="schedule-slot-content">
                            {isAvailable ? (
                              <div className="schedule-slot-available">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Disponible</span>
                              </div>
                            ) : (
                              <div className="schedule-slot-appointments">
                                {appointmentsInSlot.map((apt) => (
                                  <div
                                    key={apt.id}
                                    className="appointment-card"
                                    onClick={() => handleAppointmentClick(apt)}
                                  >
                                    <div className="appointment-card-header">
                                      <span className="appointment-pet-name">
                                        {apt.mascota?.nombre || 'Mascota'}
                                      </span>
                                      {getStatusBadge(apt.estado)}
                                    </div>
                                    <div className="appointment-card-body">
                                      <p className="appointment-owner">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="14"
                                          height="14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                          <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        {apt.propietario?.nombre || 'Cliente'}
                                      </p>
                                      <p className="appointment-vet">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="14"
                                          height="14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                          <circle cx="8.5" cy="7" r="4"></circle>
                                          <polyline points="17 11 19 13 23 9"></polyline>
                                        </svg>
                                        {apt.veterinario?.nombre || 'Sin asignar'}
                                      </p>
                                      {apt.motivo && (
                                        <p className="appointment-reason">
                                          {apt.motivo}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de detalle de cita */}
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          appointment={selectedAppointment}
        />
      )}
    </>
  );
};

export default DaySidePanel;