import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyCalendar from '../../components/calender/WeeklyCalendar.jsx';
import DaySidePanel from '../../components/calender/DaySidePanel';
import { useAuthStore } from '@store/AuthStore.jsx';
import './CalendarPage.css';

/**
 * CalendarPage - Página de Calendario de Horarios
 *
 * Restricciones:
 * - Solo accesible para: superadmin, veterinario, auxiliar
 * - Propietarios son redirigidos al dashboard
 */
const CalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  /**
   * Handler cuando se selecciona un día en el calendario
   */
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  };

  /**
   * Handler para cerrar el panel lateral
   */
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // Pequeño delay para que termine la animación antes de limpiar selectedDate
    setTimeout(() => setSelectedDate(null), 300);
  };

  /**
   * Handler para refrescar datos del calendario
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Incrementar el trigger para forzar recarga
    setRefreshTrigger(prev => prev + 1);

    // Simular delay mínimo para feedback visual
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Si no hay usuario o no tiene permisos, no renderizar nada
  if (!user || user.role === 'propietario') {
    return null;
  }

  return (
    <div className="calendar-page">
      <div className="calendar-page__container">
        {/* Header mejorado */}
        <header className="calendar-page__header">
          <div className="calendar-page__header-content">
            {/* Sección de título */}
            <div className="calendar-page__title-section">
              <h1 className="calendar-page__title">
                <span className="calendar-page__title-icon">📅</span>
                Horarios y Calendario
              </h1>
              <p className="calendar-page__subtitle">
                Visualiza las citas y disponibilidad de los veterinarios en tiempo real
              </p>
            </div>

            {/* Sección de acciones */}
            <div className="calendar-page__actions">


              {/* Botón de refrescar mejorado */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="calendar-page__refresh-btn"
                title="Refrescar calendario"
                aria-label="Refrescar datos del calendario"
              >
                <svg
                  className="calendar-page__refresh-btn-icon"
                  style={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }}
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
                <span className="calendar-page__refresh-btn-text">
                  {isRefreshing ? 'Actualizando...' : 'Refrescar'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Cards informativos opcionales */}
        {user.role === 'superadmin' && (
          <div className="calendar-page__info-cards">
            <div className="calendar-page__info-card calendar-page__info-card--blue">
              <div className="calendar-page__info-card-icon">📊</div>
              <p className="calendar-page__info-card-title">Citas Hoy</p>
              <p className="calendar-page__info-card-value">--</p>
            </div>

            <div className="calendar-page__info-card calendar-page__info-card--green">
              <div className="calendar-page__info-card-icon">✅</div>
              <p className="calendar-page__info-card-title">Completadas</p>
              <p className="calendar-page__info-card-value">--</p>
            </div>

            <div className="calendar-page__info-card calendar-page__info-card--purple">
              <div className="calendar-page__info-card-icon">⏰</div>
              <p className="calendar-page__info-card-title">Pendientes</p>
              <p className="calendar-page__info-card-value">--</p>
            </div>
          </div>
        )}

        {/* Calendario Semanal */}
        <div className="calendar-page__calendar-wrapper">
          <WeeklyCalendar
            onDayClick={handleDayClick}
            refreshTrigger={refreshTrigger}
            currentUserId={user?.id}
            currentUserRole={user?.role}
          />
        </div>
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