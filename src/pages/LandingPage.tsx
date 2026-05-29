import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

// ─── Placeholder celebrity data (replace with API call later) ───────────────
const CELEBRITIES = [
  { slug: 'beyonce',      name: 'Beyoncé',       genre: 'R&B / Pop',     fans: '24.1K', color: '#FFD700', initials: 'BY' },
  { slug: 'drake',        name: 'Drake',          genre: 'Hip-Hop',       fans: '31.4K', color: '#7C3AED', initials: 'DR' },
  { slug: 'taylor-swift', name: 'Taylor Swift',   genre: 'Pop / Country', fans: '42.8K', color: '#EC4899', initials: 'TS' },
  { slug: 'bad-bunny',    name: 'Bad Bunny',      genre: 'Reggaeton',     fans: '18.9K', color: '#10B981', initials: 'BB' },
  { slug: 'rihanna',      name: 'Rihanna',        genre: 'Pop / R&B',     fans: '22.3K', color: '#EF4444', initials: 'RH' },
  { slug: 'weeknd',       name: 'The Weeknd',     genre: 'R&B / Pop',     fans: '19.7K', color: '#00E5FF', initials: 'TW' },
  { slug: 'ariana-grande',name: 'Ariana Grande',  genre: 'Pop',           fans: '28.5K', color: '#F59E0B', initials: 'AG' },
  { slug: 'kendrick',     name: 'Kendrick Lamar', genre: 'Hip-Hop',       fans: '15.2K', color: '#8B5CF6', initials: 'KL' },
]

const STATS = [
  { label: 'Active Fans',    value: '124K+' },
  { label: 'Prizes Awarded', value: '8,340' },
  { label: 'Coins in Play',  value: '2.1M'  },
  { label: 'Concerts Won',   value: '214'   },
]

// ─── Celebrity card ───────────────────────────────────────────────────────────
function CelebCard({ celeb }: { celeb: typeof CELEBRITIES[0] }) {
  const { user } = useAuthStore()
  const href = user ? `/star/${celeb.slug}` : '/auth/register'

  return (
    <Link
      to={href}
      className="card-hover group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 cursor-pointer"
      style={{ borderColor: celeb.color + '33' }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
        style={{ background: celeb.color }}
      />

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center font-heading font-bold text-xl text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${celeb.color}99, ${celeb.color}44)`, border: `1px solid ${celeb.color}55` }}
      >
        {celeb.initials}
      </div>

      {/* Info */}
      <div>
        <p className="font-heading font-semibold text-white text-base leading-tight">{celeb.name}</p>
        <p className="text-white/40 text-xs mt-0.5">{celeb.genre}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-sw-border">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-win animate-pulse" />
          <span className="text-win text-xs font-medium">{celeb.fans} fans</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: celeb.color + '22', color: celeb.color }}
        >
          Play →
        </span>
      </div>
    </Link>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-dark-grid px-4 pt-16 pb-20 text-center">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[200px] bg-cyan/5 blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="badge-live inline-flex mb-5">
            ● LIVE — 8,340 prizes awarded
          </div>

          <h1 className="font-heading font-black text-4xl md:text-6xl leading-tight mb-5">
            <span className="text-white">Play Your Favourite </span>
            <span className="text-gold-gradient">Celebrity's World.</span>
            <br />
            <span className="text-white">Win </span>
            <span className="text-gold-gradient">Real Prizes.</span>
          </h1>

          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Pick a star, play games, earn coins, and win concert tickets, merch, cash, and more. The higher your tier, the better your odds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link to="/dashboard" className="btn-gold text-base px-8 py-3">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/auth/register" className="btn-gold text-base px-8 py-3">
                  Start for Free →
                </Link>
                <Link to="/auth/login" className="btn-outline text-base px-8 py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-sw-border bg-sw-card/50">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-heading font-black text-2xl text-gold-gradient">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Celebrity picker ── */}
      <section className="page-content">
        <div className="section-header mb-6">
          <div>
            <h2 className="section-title">Choose Your Star</h2>
            <p className="text-white/40 text-sm mt-1">Each celebrity has unique games, prizes, and concert tickets.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CELEBRITIES.map(c => <CelebCard key={c.slug} celeb={c} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="page-content mt-2 mb-10">
        <h2 className="section-title mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Pick a Celebrity', desc: 'Choose from your favourite artists and unlock their exclusive game world.' },
            { step: '02', title: 'Play & Earn Coins', desc: 'Trivia, memory, spin wheel and more. Every game earns coins toward real prizes.' },
            { step: '03', title: 'Win Real Prizes', desc: 'Concert tickets, merch codes, cash — upgrade to Platinum for a 75% win rate.' },
          ].map(h => (
            <div key={h.step} className="card p-6 flex gap-4">
              <span className="font-heading font-black text-3xl text-gold/20 leading-none">{h.step}</span>
              <div>
                <p className="font-heading font-semibold text-white mb-1">{h.title}</p>
                <p className="text-white/50 text-sm leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tier teaser ── */}
      <section className="page-content mb-16">
        <h2 className="section-title mb-6">Membership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: 'Bronze',   color: '#CD7F32', rate: '30%', entry: 'Free',          perk: 'Unlock payouts with 7 referrals' },
            { tier: 'Silver',   color: '#C0C0C0', rate: '50%', entry: '$5 + 3 refs',   perk: 'Instant payouts, 1.5× coin multiplier' },
            { tier: 'Platinum', color: '#E5E4E2', rate: '75%', entry: '$10 deposit',   perk: 'Grand prize eligible, 2× multiplier' },
          ].map(t => (
            <div
              key={t.tier}
              className="card p-5"
              style={{ borderColor: t.color + '44' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                <span className="font-heading font-bold text-white">{t.tier}</span>
              </div>
              <p className="text-4xl font-heading font-black mb-1" style={{ color: t.color }}>{t.rate}</p>
              <p className="text-white/40 text-xs mb-3">win rate</p>
              <div className="border-t border-sw-border pt-3 flex flex-col gap-1.5">
                <p className="text-white/60 text-xs">Entry: <span className="text-white font-medium">{t.entry}</span></p>
                <p className="text-white/60 text-xs">{t.perk}</p>
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-8 text-center">
            <Link to="/auth/register" className="btn-gold px-10 py-3 text-base">
              Join Free — Start on Bronze →
            </Link>
          </div>
        )}
      </section>

    </div>
  )
}
