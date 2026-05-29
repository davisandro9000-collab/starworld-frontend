// src/api/referral.api.ts
import { api } from './axios';

export interface ReferralStats {
  referralCode: string;
  payoutUnlocked: boolean;
  totalReferrals: number;
  activatedCount: number;
  pendingCount: number;
  totalDepositsFromReferrals: number;
  referralUrl: string;
  list: {
    id: string;
    username: string;
    email: string;
    joinedAt: string;
    activated: boolean;
    activatedAt: string | null;
    bonusCoins: number | null;
    totalDeposited: number;
  }[];
}

export const getReferralStats = async (): Promise<ReferralStats> => {
  const response = await api.get('/referrals/my-stats');
  return response.data;
};

export const claimPayout = async (): Promise<{ success: boolean; coinsGranted: number }> => {
  const response = await api.post('/referrals/claim-payout');
  return response.data;
};