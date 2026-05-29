import { api } from './axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  displayName?: string
  avatarUrl?: string
}

export interface UpdateProfileResponse {
  id: string
  username: string
  email: string
  avatarUrl?: string
}

export interface CoinHistoryEntry {
  id: string
  amount: number          // positive = credit, negative = debit
  reason: string
  createdAt: string
}

export interface GameHistoryEntry {
  id: string
  gameType: string
  won: boolean
  coinsEarned: number
  prize?: string
  playedAt: string
}

export interface PrizeEntry {
  id: string
  prizeType: string
  prizeLabel: string
  claimedAt: string
  status: 'pending' | 'delivered' | 'failed'
}

export interface ReferralEntry {
  id: string
  username: string
  activated: boolean       // true = email verified + deposit credited
  joinedAt: string
}

export interface ReferralStats {
  referralCode: string
  referralUrl: string
  totalReferred: number
  activatedCount: number   // activated = email verified + deposit credited
  payoutUnlocked: boolean  // true once activatedCount >= 7
  pendingCount: number
  referrals: ReferralEntry[]
}

export interface NotificationEntry {
  id: string
  type: string
  title: string
  body: string
  priority: 'high' | 'normal' | 'low'
  ctaLabel?: string
  ctaUrl?: string
  accentColor?: string
  read: boolean
  createdAt: string
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getMe(): Promise<UpdateProfileResponse> {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  const { data } = await api.patch('/users/me', payload)
  return data
}

// ─── Password reset ───────────────────────────────────────────────────────────

/**
 * Triggers a password-reset email to the currently authenticated user's address.
 * Backend sends the link; no sensitive data returned.
 */
export async function sendPasswordResetEmail(): Promise<void> {
  await api.post('/auth/password-reset-request')
}

// ─── History & prizes ─────────────────────────────────────────────────────────

export async function getCoinHistory(): Promise<CoinHistoryEntry[]> {
  const { data } = await api.get('/users/me/coin-history')
  return data
}

export async function getGameHistory(): Promise<GameHistoryEntry[]> {
  const { data } = await api.get('/users/me/game-history')
  return data
}

export async function getPrizes(): Promise<PrizeEntry[]> {
  const { data } = await api.get('/users/me/prizes')
  return data
}

// ─── Referrals ────────────────────────────────────────────────────────────────

export async function getReferrals(): Promise<ReferralStats> {
  const { data } = await api.get('/referrals/my-stats')
  return data
}

// ─── Notifications (server-persisted list) ────────────────────────────────────

export async function getNotifications(): Promise<NotificationEntry[]> {
  const { data } = await api.get('/users/me/notifications')
  return data
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/users/me/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/users/me/notifications/read-all')
}