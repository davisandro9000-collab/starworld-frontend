import { api } from './axios';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    coinBalance: number;
    tier: {
      id: string;
      slug: string;
      name: string;
      colorHex: string;
    };
    referralCode?: string;
    payoutUnlocked: boolean;
    totalReferrals: number;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (data: { username: string; email: string; password: string; referralCode?: string }) => {
  const { data: response } = await api.post('/auth/register', data);
  return response;
};

export const refreshToken = async () => {
  const { data } = await api.post('/auth/refresh');
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};