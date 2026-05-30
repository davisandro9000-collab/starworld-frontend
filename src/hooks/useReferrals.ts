// src/hooks/useReferrals.ts
import { useQuery } from '@tanstack/react-query';
import { getReferralStats, type ReferralStats } from '../api/referral.api';

export function useReferrals() {
  return useQuery<ReferralStats>({
    queryKey: ['referrals'],
    queryFn: getReferralStats,
    staleTime: 5 * 60 * 1000,
  });
}