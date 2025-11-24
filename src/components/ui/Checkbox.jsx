import { forwardRef } from 'react'
import './Checkbox.css'

/**
 * Componente Checkbox reutilizable
 * Basado en el diseño de Figma
 *
 * @param {string} label - Etiqueta del checkbox
 * @param {boolean} checked - Estado del checkbox
 * @param {function} onChange - Función al cambiar el estado
 * @param {boolean} disabled - Si el checkbox está deshabilitado
 */
const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const checkboxClassNames = [
    'checkbox-wrapper',
    disabled && 'checkbox-wrapper--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <label className={checkboxClassNames}>
      <input
        ref={ref}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span className="checkbox-custom"></span>
      {label && <span className="checkbox-label body-m">{label}</span>}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox