// src/stores/authStore.ts
import { create } from 'zustand'

export interface TierInfo {
  slug: 'bronze' | 'silver' | 'platinum'
  name: string
  colorHex: string
}

export interface AppUser {
  id: string
  username: string
  email: string
  displayName?: string
  avatarUrl?: string
  tier: TierInfo      // ✅ now an object with slug, name, colorHex
  coinBalance: number
  payoutUnlocked: boolean
  totalReferrals: number
  referralCode: string
  emailVerified: boolean
  createdAt?: string
}

interface AuthState {
  user: AppUser | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: AppUser) => void
  setAccessToken: (token: string) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  setUser:         (user)  => set({ user }),
  setAccessToken:  (token) => set({ accessToken: token }),
  logout:          ()      => set({ user: null, accessToken: null }),
  setLoading:      (v)     => set({ isLoading: v }),
}))