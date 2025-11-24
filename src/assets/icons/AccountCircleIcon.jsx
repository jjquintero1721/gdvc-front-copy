/**
 * Icono de Cuenta Circular
 * Basado en el diseño de Figma - usado en el header de las cards
 */
function AccountCircleIcon({ className = '', size = 64, color = '#4285F4' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="32" cy="32" r="32" fill="white" />
      <path
        d="M32 32C36.4183 32 40 28.4183 40 24C40 19.5817 36.4183 16 32 16C27.5817 16 24 19.5817 24 24C24 28.4183 27.5817 32 32 32Z"
        fill={color}
      />
      <path
        d="M32 36C23.1634 36 16 39.5817 16 44V48H48V44C48 39.5817 40.8366 36 32 36Z"
        fill={color}
      />
    </svg>
  )
}

export default AccountCircleIcon