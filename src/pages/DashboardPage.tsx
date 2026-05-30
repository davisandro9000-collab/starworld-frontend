import { useAuthStore } from '../stores/authStore';
import TierBadge from '../components/ui/TierBadge';
import { Link } from 'react-router-dom';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="font-heading font-black text-2xl text-white">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function TierProgress({ tierSlug, referrals }: { tierSlug: string; referrals: number }) {
  if (tierSlug === 'bronze') {
    const pct = Math.min((referrals / 7) * 100, 100);
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-heading font-semibold text-white text-sm">Payout unlock progress</p>
          <span className="text-bronze text-xs font-medium">{referrals}/7 referrals</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-white/40 text-xs mt-2">
          {7 - referrals > 0
            ? `${7 - referrals} more activated referral${7 - referrals === 1 ? '' : 's'} to unlock withdrawals`
            : '✅ Payouts unlocked!'}
        </p>
      </div>
    );
  }
  return (
    <div className="card p-5 border-gold/20">
      <p className="text-white/60 text-sm">
        <span className="text-win font-semibold">✅ Payouts unlocked</span> —{' '}
        {tierSlug === 'silver' ? 'Silver' : 'Platinum'} members get instant withdrawals.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const balance = user?.coinBalance ?? 0;
  const tierSlug = user?.tier?.slug ?? 'bronze';
  const referrals = 0; // Replace with real API data later

  return (
    <div className="page-content space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">
            Hey, <span className="text-gold-gradient">{user?.username ?? 'Star'}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Here's your world</p>
        </div>
        <TierBadge tier={user?.tier?.slug ?? 'bronze'} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Coin Balance"
          value={balance.toLocaleString()}
          sub={`≈ $${(balance / 3).toFixed(2)} USD`}
        />
        <StatCard label="Prizes Won" value="0" sub="This month" />
        <StatCard label="Referrals" value={String(referrals)} sub="Activated" />
        <StatCard
          label="Win Rate"
          value={tierSlug === 'platinum' ? '75%' : tierSlug === 'silver' ? '50%' : '30%'}
          sub="Current tier"
        />
      </div>

      {/* Tier progress */}
      <TierProgress tierSlug={tierSlug} referrals={referrals} />

      {/* Quick actions – links now point to existing routes */}
      <div>
        <div className="section-header mb-3">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/games" className="card-hover p-4 text-center flex flex-col items-center gap-2 cursor-pointer">
            <span className="text-2xl">🎮</span>
            <span className="text-white text-xs font-medium">Play Games</span>
          </Link>
          <Link to="/deposit" className="card-hover p-4 text-center flex flex-col items-center gap-2 cursor-pointer">
            <span className="text-2xl">💰</span>
            <span className="text-white text-xs font-medium">Deposit</span>
          </Link>
          <Link to="/marketplace" className="card-hover p-4 text-center flex flex-col items-center gap-2 cursor-pointer">
            <span className="text-2xl">🎫</span>
            <span className="text-white text-xs font-medium">Marketplace</span>
          </Link>
          <Link to="/referrals" className="card-hover p-4 text-center flex flex-col items-center gap-2 cursor-pointer">
            <span className="text-2xl">👥</span>
            <span className="text-white text-xs font-medium">Refer Friends</span>
          </Link>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <div className="section-header mb-3">
          <h2 className="section-title">Recent Activity</h2>
        </div>
        <div className="card p-6 text-center text-white/30 text-sm">
          No activity yet —{' '}
          <Link to="/" className="text-gold hover:underline">
            pick a celebrity and start playing
          </Link>
        </div>
      </div>
    </div>
  );
}