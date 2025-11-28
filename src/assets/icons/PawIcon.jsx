/**
 * Icono de Pata (Paw)
 * Usado en la landing page
 */
function PawIcon({ className = '', size = 24, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 18C12 18 8 15.5 8 12C8 10.5 9 10 10 10C11 10 12 11 12 12C12 11 13 10 14 10C15 10 16 10.5 16 12C16 15.5 12 18 12 18Z"
        fill={color}
      />
      <circle cx="8" cy="8" r="2" fill={color} />
      <circle cx="16" cy="8" r="2" fill={color} />
      <circle cx="6" cy="12" r="1.5" fill={color} />
      <circle cx="18" cy="12" r="1.5" fill={color} />
    </svg>
  )
}

export default PawIcon