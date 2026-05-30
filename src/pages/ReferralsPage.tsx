import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReferralStats, claimPayout, ReferralStats } from '../api/referral.api';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import Spinner from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function ReferralsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [copySuccess, setCopySuccess] = useState(false);

  const { data, isLoading, error } = useQuery<ReferralStats>({
    queryKey: ['referralStats'],
    queryFn: getReferralStats,
    enabled: !!user,
  });

  const claimMutation = useMutation({
    mutationFn: claimPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralStats'] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-content">
        <div className="card p-8 text-center">
          <p className="text-white/60">Failed to load referral data.</p>
          <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['referralStats'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const {
    referralCode,
    referralUrl,
    activatedCount,
    pendingCount,
    totalReferrals,
    payoutUnlocked,
    list,
  } = data;

  const canClaimPayout = !payoutUnlocked && activatedCount >= 7;

  return (
    <div className="page-content space-y-8">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Referrals</h1>
        <p className="text-white/40 text-sm mt-0.5">Invite friends and earn rewards</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <p className="text-white/40 text-xs">Your Code</p>
          <p className="font-heading font-black text-xl text-white">{referralCode}</p>
        </div>
        <div className="stat-card">
          <p className="text-white/40 text-xs">Activated</p>
          <p className="font-heading font-black text-2xl text-white">{activatedCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-white/40 text-xs">Pending</p>
          <p className="font-heading font-black text-2xl text-white">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-white/40 text-xs">Total Referrals</p>
          <p className="font-heading font-black text-2xl text-white">{totalReferrals}</p>
        </div>
      </div>

      {/* Share section */}
      <div className="card p-5 space-y-4">
        <div>
          <h2 className="font-heading font-semibold text-white">Share your link</h2>
          <p className="text-white/40 text-xs">Anyone who signs up with your code earns you coins when they deposit.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="input-sw flex-1 min-w-[200px] text-sm"
          />
          <Button onClick={() => copyToClipboard(referralUrl)} variant="gold">
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
        <div className="flex gap-2">
          {[
            { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=Join%20me%20on%20StarWorld%20using%20my%20link%3A%20${encodeURIComponent(referralUrl)}` },
            { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`Join StarWorld using my referral link: ${referralUrl}`)}` },
            { name: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=Join%20StarWorld%20with%20my%20link` },
          ].map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-4 py-2 text-sm"
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>

      {/* Payout section (Bronze only) */}
      {user?.tier?.slug === 'bronze' && (
        <div className="card p-5 border-gold/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-semibold text-white">Payout Unlock</h3>
              <p className="text-white/40 text-xs">
                {payoutUnlocked
                  ? '✅ You have unlocked withdrawals!'
                  : `${7 - activatedCount} more activated referrals needed to unlock payouts.`}
              </p>
            </div>
            {!payoutUnlocked && canClaimPayout && (
              <Button
                variant="gold"
                onClick={() => claimMutation.mutate()}
                loading={claimMutation.isPending}
              >
                Claim Payout
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Referral list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-white">Your Referrals</h2>
          <span className="text-white/40 text-xs">{list.length} total</span>
        </div>
        {list.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-white/40">No referrals yet.</p>
            <p className="text-white/30 text-sm mt-1">Share your link to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-sw-border">
                <tr className="text-white/40 text-xs font-medium">
                  <th className="text-left py-3 px-2">Username</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Bonus</th>
                  <th className="text-left py-3 px-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {list.map((ref) => (
                  <tr key={ref.id} className="border-b border-sw-border/30 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-white text-sm">{ref.username}</td>
                    <td className="py-3 px-2">
                      {ref.activated ? (
                        <span className="text-win text-xs">Activated</span>
                      ) : (
                        <span className="text-white/40 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-white/70 text-sm">
                      {ref.bonusCoins ? `${ref.bonusCoins} coins` : '—'}
                    </td>
                    <td className="py-3 px-2 text-white/40 text-xs">
                      {new Date(ref.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}