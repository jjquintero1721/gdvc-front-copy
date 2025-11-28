import { useEffect, useState } from 'react'
import './AuthLayout.css'

import { PawPrint, Heart, Stethoscope, Activity } from 'lucide-react'

function AuthLayout({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`auth-layout-modern ${mounted ? 'auth-layout-modern--mounted' : ''}`}>

      {/* PANEL IZQUIERDO */}
      <div className="auth-layout-modern__brand-panel">

        {/* Capa de Difuminado */}
        <div className="auth-layout-modern__bg-overlay"></div>

        {/* Contenido */}
        <div className="auth-layout-modern__brand-content">

          <div className="auth-layout-modern__logo">
            <div className="auth-layout-modern__logo-icon">
              <PawPrint size={48} strokeWidth={2} />
            </div>
            <h1 className="auth-layout-modern__logo-text">PawFlow</h1>
          </div>

          <div className="auth-layout-modern__welcome">
            <h2 className="auth-layout-modern__welcome-title">
              Gestión Veterinaria <br /> Profesional
            </h2>
            <p className="auth-layout-modern__welcome-subtitle">
              Gestión que inspira confianza, cuidado que deja huella.
            </p>
          </div>

          <div className="auth-layout-modern__features">
            <div className="auth-layout-modern__feature">
              <div className="auth-layout-modern__feature-icon">
                <Heart size={24} />
              </div>
              <div>
                <h4>Historias Clínicas</h4>
                <p>Registros completos y seguros</p>
              </div>
            </div>

            <div className="auth-layout-modern__feature">
              <div className="auth-layout-modern__feature-icon">
                <Stethoscope size={24} />
              </div>
              <div>
                <h4>Gestión de Citas</h4>
                <p>Agenda inteligente y recordatorios</p>
              </div>
            </div>

            <div className="auth-layout-modern__feature">
              <div className="auth-layout-modern__feature-icon">
                <Activity size={24} />
              </div>
              <div>
                <h4>Control de Inventario</h4>
                <p>Administra tus insumos clínicos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="auth-layout-modern__form-panel">
        <div className="auth-layout-modern__form-container">
          {children}
        </div>

        <footer className="auth-layout-modern__footer">
          <p className="caption">© 2025 GDCV - Gestión de Clínica Veterinaria</p>
          <div className="auth-layout-modern__footer-links">
            <a href="#" className="caption">Términos de servicio</a>
            <span className="caption">•</span>
            <a href="#" className="caption">Política de privacidad</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AuthLayout
