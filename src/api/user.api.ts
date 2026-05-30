// src/api/user.api.ts – full merged version
import { api } from './axios';

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  coinBalance: number;
  tier: any;
}

export interface CoinHistoryEntry {
  id: string;
  amount: number;
  note: string;
  type: string;
  balanceAfter: number;
  createdAt: string;
}

export interface GameHistoryEntry {
  id: string;
  gameType: string;
  status: 'won' | 'lost';
  coinsEarned: number;
  prizeWon?: string;
  startedAt: string;
  completedAt?: string;
}

export interface PrizeEntry {
  id: string;
  prize: { label: string; type: string };
  code: string;
  status: 'pending' | 'fulfilled' | 'voided';
  createdAt: string;
}

export interface NotificationEntry {
  id: string;
  type: string;
  title: string;
  body: string;
  priority?: 'high' | 'normal' | 'low';
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  read: boolean;
  createdAt: string;
}

export async function getMe(): Promise<UpdateProfileResponse> {
  const { data } = await api.get('/users/me');
  return data;
}

export async function getUserBalance(): Promise<{ balance: number; tier: any }> {
  const { data } = await api.get('/users/balance');
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const { data } = await api.patch('/users/profile', payload);
  return data;
}

export async function sendPasswordResetEmail(): Promise<void> {
  // Backend endpoint not yet implemented; this is a placeholder
  console.warn('Password reset endpoint not implemented');
  // When backend is ready, uncomment:
  // await api.post('/auth/password-reset-request');
}

export async function getCoinHistory(): Promise<CoinHistoryEntry[]> {
  const { data } = await api.get('/users/me/coin-history');
  return data;
}

export async function getGameHistory(): Promise<GameHistoryEntry[]> {
  const { data } = await api.get('/users/me/game-history');
  return data;
}

export async function getPrizes(): Promise<PrizeEntry[]> {
  const { data } = await api.get('/users/me/prizes');
  return data;
}

export async function getNotifications(): Promise<NotificationEntry[]> {
  const { data } = await api.get('/users/notifications');
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/users/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/users/notifications/read-all');
}