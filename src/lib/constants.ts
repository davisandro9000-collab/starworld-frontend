// Coin constants
export const COIN_RATE = 3
export const usdToCoins = (usd: number) => Math.floor(usd * COIN_RATE)
export const coinsToUsd = (coins: number) => (coins / COIN_RATE).toFixed(2)

// Tier constants
export const TIERS = {
  BRONZE: { slug: 'bronze', name: 'Bronze', color: '#CD7F32', winRate: 30 },
  SILVER: { slug: 'silver', name: 'Silver', color: '#C0C0C0', winRate: 50 },
  PLATINUM: { slug: 'platinum', name: 'Platinum', color: '#E5E4E2', winRate: 75 },
} as const

// Game constants
export const MIN_GAME_SECONDS = 2
export const REFERRAL_BONUS_COINS = 50
export const TICKET_PLATFORM_FEE_PERCENT = 5

// API endpoints
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const