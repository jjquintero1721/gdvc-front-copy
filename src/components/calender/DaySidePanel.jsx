import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAppointmentsByDate } from '@services/appointmentsService.js';
import AppointmentItem from './AppointmentItem';
import AppointmentDetailModal from './AppointmentDetailModal';

// Horarios fijos: 8:00 AM - 5:30 PM con intervalos de 30 minutos
const WORK_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

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

  const loadDayAppointments = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const data = await getAppointmentsByDate(selectedDate);
      setAppointments(data);
    } catch (error) {
      console.error('Error al cargar citas del día:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar citas por hora
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

  // Handler para abrir modal de detalle
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Handler para cerrar modal
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
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onClose}
            />

            {/* Panel deslizante */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header del panel */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Horarios laborales: 8:00 AM - 5:30 PM
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
                  aria-label="Cerrar panel"
                >
                  <svg
                    className="w-6 h-6"
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
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Cargando horarios...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {WORK_HOURS.map((hour) => {
                      const appointmentsInSlot = groupedAppointments[hour] || [];
                      const hasAppointments = appointmentsInSlot.length > 0;

                      return (
                        <div
                          key={hour}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                          {/* Hora del slot */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-gray-400"
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
                              <span className="font-semibold text-gray-900 text-lg">
                                {format(new Date(`2000-01-01T${hour}`), 'h:mm a')}
                              </span>
                            </div>

                            {!hasAppointments && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Disponible
                              </span>
                            )}
                          </div>

                          {/* Lista de citas en este horario */}
                          {hasAppointments ? (
                            <div className="space-y-2">
                              {appointmentsInSlot.map((appointment) => (
                                <AppointmentItem
                                  key={appointment.id}
                                  appointment={appointment}
                                  isCurrentUser={appointment.veterinario_id === currentUserId}
                                  onClick={() => handleAppointmentClick(appointment)}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No hay citas programadas en este horario
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer con estadísticas */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Total de citas: <span className="font-semibold text-gray-900">{appointments.length}</span>
                  </span>
                  <span className="text-gray-600">
                    Slots disponibles: <span className="font-semibold text-green-600">
                      {WORK_HOURS.length - Object.keys(groupedAppointments).length}
                    </span>
                  </span>
                </div>
              </div>
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

export default DaySidePanel;