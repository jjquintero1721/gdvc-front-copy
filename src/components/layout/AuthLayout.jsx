import './AuthLayout.css'

/**
 * Layout para páginas de autenticación
 * Proporciona el contenedor con fondo y centrado para login/registro
 */
function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        {children}
      </div>

      {/* Footer opcional */}
      <footer className="auth-layout__footer">
        <div className="auth-layout__footer-content">
          <p className="caption">© 2025 GDCV - Gestión de Clínica Veterinaria</p>
          <div className="auth-layout__footer-links">
            <a href="#" className="caption">Términos de servicio</a>
            <span className="caption">•</span>
            <a href="#" className="caption">Política de privacidad</a>
            <span className="caption">•</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="caption">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout