import { api } from './axios'
import { AppUser } from '../stores/authStore'

interface AuthResponse {
  user: AppUser
  accessToken: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function register(payload: {
  username: string
  email: string
  password: string
  referralCode?: string
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/auth/refresh')
  return data
}

export async function getMe(): Promise<AppUser> {
  const { data } = await api.get<AppUser>('/auth/me')
  return data
}