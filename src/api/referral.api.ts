import { api } from './axios';

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activatedCount: number;
  pendingCount: number;
  payoutUnlocked: boolean;
  referralUrl: string;
  list: Array<{
    id: string;
    username: string;
    email: string;
    joinedAt: string;
    activated: boolean;
    activatedAt: string | null;
    bonusCoins: number | null;
  }>;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const { data } = await api.get('/referrals/my-stats');
  return data;
}

export async function createReferral(referralCode: string) {
  const { data } = await api.post('/referrals/create', { referralCode });
  return data.referral;
}

export async function claimPayout() {
  const { data } = await api.post('/referrals/claim-payout');
  return data;
}