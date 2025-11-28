import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Store de Autenticación - VERSIÓN DEFINITIVA QUE SÍ FUNCIONA
 *
 * ✅ SOLUCIÓN REAL AL PROBLEMA:
 * - Usa SOLO sessionStorage (que se mantiene al recargar)
 * - Cuando rememberMe = true, TAMBIÉN copia a localStorage
 * - Al cargar, primero intenta desde localStorage, luego sessionStorage
 */

/**
 * Storage híbrido personalizado
 * Prioriza localStorage si existe, sino usa sessionStorage
 */
const customStorage = {
  getItem: (name) => {
    // Primero intenta localStorage (para usuarios con rememberMe)
    const localValue = localStorage.getItem(name)
    if (localValue) return localValue

    // Si no hay en localStorage, usa sessionStorage
    const sessionValue = sessionStorage.getItem(name)
    return sessionValue
  },

  setItem: (name, value) => {
    const state = JSON.parse(value)

    // SIEMPRE guardar en sessionStorage (para recargas de página)
    sessionStorage.setItem(name, value)

    // Si rememberMe está activo, TAMBIÉN guardar en localStorage
    if (state.state.rememberMe) {
      localStorage.setItem(name, value)
    } else {
      // Si rememberMe está desactivado, limpiar localStorage
      localStorage.removeItem(name)
    }
  },

  removeItem: (name) => {
    // Limpiar ambos al hacer logout
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // Estado
      // ==========================================
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      rememberMe: false,

      // ==========================================
      // Acciones
      // ==========================================

      login: (userData, tokens, remember = false) => {
        console.log('🔐 Login ejecutado, rememberMe:', remember)
        set({
          user: userData,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          isAuthenticated: true,
          rememberMe: remember
        })
      },

      logout: () => {
        console.log('🚪 Logout ejecutado')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          rememberMe: false
        })
      },

      updateUser: (userData) => {
        set({ user: userData })
      },

      updateTokens: (tokens) => {
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        })
      },

      // ==========================================
      // Getters
      // ==========================================

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      getUser: () => get().user,
      isUserAuthenticated: () => get().isAuthenticated,

      isTokenExpired: () => {
        const token = get().accessToken
        if (!token) return true

        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Math.floor(Date.now() / 1000)
          return payload.exp < now
        } catch (error) {
          console.error('Error al verificar expiración del token:', error)
          return true
        }
      }
    }),
    {
      name: 'gdcv-auth-storage',
      storage: createJSONStorage(() => customStorage),

      // Solo persistir cuando está autenticado
      partialize: (state) => {
        if (state.isAuthenticated) {
          return {
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            isAuthenticated: state.isAuthenticated,
            rememberMe: state.rememberMe
          }
        }

        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          rememberMe: false
        }
      }
    }
  )
)