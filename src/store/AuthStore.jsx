import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de autenticación
 * Gestiona el estado de autenticación del usuario, tokens y datos del perfil
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      rememberMe: false,

      // Acciones
      login: (userData, tokens, remember = false) => {
        set({
          user: userData,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          rememberMe: remember
        })
      },

      logout: () => {
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

      // Getters
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      getUser: () => get().user,
      isUserAuthenticated: () => get().isAuthenticated
    }),
    {
      name: 'gdcv-auth-storage',
      partialize: (state) => {
        // Solo persistir si rememberMe está activo
        if (state.rememberMe) {
          return {
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            isAuthenticated: state.isAuthenticated,
            rememberMe: state.rememberMe
          }
        }
        // Si no hay remember me, solo persistir que no está autenticado
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