import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyCalendar from '../../components/calender/WeeklyCalendar.jsx';
import DaySidePanel from '../../components/calender/DaySidePanel';
import {useAuthStore} from '@store/AuthStore.jsx'; // Ajusta la ruta según tu proyecto

const CalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Ajusta según tu implementación de auth store
  const [selectedDate, setSelectedDate] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Verificar permisos de acceso
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Restricción: propietarios no pueden acceder
    if (user.role === 'propietario') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  // Handler cuando se selecciona un día en el calendario
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  };

  // Handler para cerrar el panel
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // Pequeño delay para que termine la animación antes de limpiar selectedDate
    setTimeout(() => setSelectedDate(null), 300);
  };

  // Handler para refrescar datos (forzar recarga desde backend)
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Si no hay usuario o no tiene permisos, no renderizar nada
  if (!user || user.role === 'propietario') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Horarios y Calendario
            </h1>
            <p className="text-gray-600 mt-1">
              Visualiza las citas y disponibilidad de los veterinarios
            </p>
          </div>

          {/* Botón de refrescar */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refrescar datos"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-medium">Refrescar</span>
          </button>
        </div>
      </div>

      {/* Calendario Semanal */}
      <div className="max-w-7xl mx-auto">
        <WeeklyCalendar
          onDayClick={handleDayClick}
          refreshTrigger={refreshTrigger}
          currentUserId={user?.id}
          currentUserRole={user?.role}
        />
      </div>

      {/* Side Panel con horarios del día */}
      <DaySidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        selectedDate={selectedDate}
        currentUserId={user?.id}
        currentUserRole={user?.role}
      />
    </div>
  );
};

export default CalendarPage;