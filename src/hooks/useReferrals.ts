import { useQuery } from '@tanstack/react-query'
import { getReferrals } from '../api/user.api'

export function useReferrals() {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: getReferrals,
    staleTime: 60_000,
  })
}
