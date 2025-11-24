import { useState, forwardRef } from 'react'
import './Input.css'

/**
 * Componente Input reutilizable
 * Basado en el diseño de Figma con iconos y validación
 *
 * @param {string} label - Etiqueta del input
 * @param {string} type - Tipo de input (text, email, password, etc.)
 * @param {string} placeholder - Placeholder del input
 * @param {ReactNode} icon - Icono a mostrar (componente React)
 * @param {string} error - Mensaje de error
 * @param {string} helperText - Texto de ayuda
 * @param {boolean} disabled - Si el input está deshabilitado
 * @param {boolean} required - Si el campo es obligatorio
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  icon,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const inputClassNames = [
    'input-wrapper',
    error && 'input-wrapper--error',
    disabled && 'input-wrapper--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={inputClassNames}>
      {label && (
        <label className="input-label body-l">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className="input-container">
        {icon && (
          <div className="input-icon">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          className="input-field"
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="input-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>

      {helperText && !error && (
        <p className="input-helper-text caption">{helperText}</p>
      )}

      {error && (
        <p className="input-error caption" id={`${props.id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input