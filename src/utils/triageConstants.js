/**
 * Constantes de Triage
 * RF-08 | Gestión de Triage (clasificación de prioridad)
 */

// Prioridades de Triage (calculadas automáticamente por el backend)
export const TRIAGE_PRIORITY = {
  URGENTE: 'urgente',  // Rojo - Atención inmediata
  ALTA: 'alta',        // Naranja - Atención prioritaria
  MEDIA: 'media',      // Amarillo - Atención normal
  BAJA: 'baja'         // Verde - Puede esperar
}

// Etiquetas de prioridad para mostrar en la UI
export const TRIAGE_PRIORITY_LABELS = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
}

// Colores para cada prioridad
export const TRIAGE_PRIORITY_COLORS = {
  urgente: '#DC2626',  // Rojo
  alta: '#EA580C',     // Naranja
  media: '#F59E0B',    // Amarillo
  baja: '#16A34A'      // Verde
}

// Estados generales del paciente
export const TRIAGE_GENERAL_STATE = {
  CRITICO: 'critico',      // Estado crítico
  DECAIDO: 'decaido',      // Decaído/débil
  ALERTA: 'alerta',        // Alerta y consciente
  ESTABLE: 'estable'       // Estado estable
}

// Etiquetas de estados generales
export const TRIAGE_GENERAL_STATE_LABELS = {
  critico: 'Crítico',
  decaido: 'Decaído',
  alerta: 'Alerta',
  estable: 'Estable'
}

// Niveles de dolor
export const TRIAGE_DOLOR = {
  AUSENTE: 'ausente',
  LEVE: 'leve',
  MODERADO: 'moderado',
  SEVERO: 'severo'
}

// Etiquetas de niveles de dolor
export const TRIAGE_DOLOR_LABELS = {
  ausente: 'Ausente',
  leve: 'Leve',
  moderado: 'Moderado',
  severo: 'Severo'
}

// Opciones Sí/No para sangrado y shock
export const TRIAGE_SI_NO_OPTIONS = [
  { value: 'Si', label: 'Sí' },
  { value: 'No', label: 'No' }
]

// Rangos normales de signos vitales (para referencia visual)
export const SIGNOS_VITALES_RANGOS = {
  fc: {
    perro: { min: 60, max: 140, label: 'Perros: 60-140 lpm' },
    gato: { min: 140, max: 220, label: 'Gatos: 140-220 lpm' }
  },
  fr: {
    normal: { min: 15, max: 30, label: 'Normal: 15-30 rpm' }
  },
  temperatura: {
    normal: { min: 37.5, max: 39.2, label: 'Normal: 37.5-39.2 °C' }
  }
}

// Mensajes de ayuda para el formulario
export const TRIAGE_HELP_MESSAGES = {
  fc: 'Frecuencia Cardíaca: latidos por minuto',
  fr: 'Frecuencia Respiratoria: respiraciones por minuto',
  temperatura: 'Temperatura corporal en grados Celsius',
  dolor: 'Nivel de dolor percibido en el paciente',
  sangrado: 'Presencia de sangrado visible',
  shock: 'Signos de shock (palidez, pulso débil, frío)',
  observaciones: 'Información adicional relevante (mínimo 10 caracteres para casos urgentes)'
}

// Validaciones del formulario
export const TRIAGE_VALIDATION = {
  fc: {
    min: 1,
    max: 300,
    message: 'La frecuencia cardíaca debe estar entre 1 y 300 lpm'
  },
  fr: {
    min: 1,
    max: 200,
    message: 'La frecuencia respiratoria debe estar entre 1 y 200 rpm'
  },
  temperatura: {
    min: 35.0,
    max: 42.0,
    message: 'La temperatura debe estar entre 35.0 y 42.0 °C'
  },
  observaciones: {
    minLength: 10,
    maxLength: 1000,
    message: 'Las observaciones deben tener entre 10 y 1000 caracteres (obligatorio para casos urgentes)'
  }
}

// Iconos para cada prioridad (usando emojis como fallback)
export const TRIAGE_PRIORITY_ICONS = {
  urgente: '🚨',
  alta: '⚠️',
  media: '⚡',
  baja: '✅'
}