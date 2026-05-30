// src/api/user.api.ts
import { api } from './axios';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  coinBalance: number;
  tier: {
    id: string;
    slug: string;
    name: string;
    colorHex: string;
  };
  payoutUnlocked: boolean;
  totalReferrals: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  isRead: boolean;
  createdAt: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const { data } = await api.get('/users/me');
  return data;
}

export async function getUserBalance(): Promise<{ balance: number; tier: any }> {
  const { data } = await api.get('/users/balance');
  return data;
}

export async function updateProfile(displayName?: string, avatarUrl?: string) {
  const { data } = await api.patch('/users/profile', { displayName, avatarUrl });
  return data.user;
}

export async function getNotifications(page = 1, limit = 20) {
  const { data } = await api.get(`/users/notifications?page=${page}&limit=${limit}`);
  return data; // { notifications, total, page, totalPages }
}

export async function markNotificationRead(notificationId: string) {
  const { data } = await api.patch(`/users/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/users/notifications/read-all');
  return data;
}