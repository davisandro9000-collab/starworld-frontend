import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Trophy, Zap, Star, ChevronRight } from 'lucide-react'
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../stores/authStore'
import { getAllCelebrities, type Celebrity } from '../api/celebrity.api'
import Spinner from '../components/ui/Spinner'
import { placeholders } from '../lib/placeholders'

/* ─── Prize tiers data (static) ─────────────────────────────── */
const PRIZE_TIERS = [
  { icon: '📹', label: 'VIDEO CALL',   desc: 'Play games. Win access.',       accent: '#FFD700' },
  { icon: '🍽️', label: 'DINNER DATE', desc: 'Top tier fans only.',            accent: '#E8C96A' },
  { icon: '✈️', label: 'TRAVEL PASS', desc: '€500 travel coupon.',            accent: '#00D4FF' },
  { icon: '₿',  label: 'CRYPTO',      desc: 'BTC, ETH, USDT payouts.',       accent: '#F7931A' },
]

const GIVEAWAY_CARDS = [
  {
    label: 'WEEKLY GIVEAWAY',
    desc: 'Win a video call with your favourite celebrity every Thursday. Available on mobile and web.',
    img: 'https://placehold.co/800x400?text=Weekly+Giveaway',
    accent: '#FFD700',
  },
  {
    label: 'CRYPTO JACKPOT',
    desc: 'Platinum tier players compete weekly for 0.01 BTC. Top 3 spin wheel winners qualify.',
    img: 'https://placehold.co/800x400?text=Crypto+Jackpot',
    accent: '#F7931A',
  },
]

/* ─── Helper: redirect based on auth ───────────────────────── */
const useAuthRedirect = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  // Return a function that takes no parameters (suitable for onClick)
  const handleRedirect = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/auth/register')
    }
  }
  return handleRedirect
}

/* ─── Celebrity grid card ───────────────────────────────────── */
function CelebCard({ celeb, onPick }: { celeb: Celebrity; onPick: () => void }) {
  const [hov, setHov] = useState(false)
  const accent = '#FFD700' // default gold, could be per‑tier in future
  const imageUrl = celeb.avatarUrl || placeholders.celebrityAvatar(celeb.name)

  return (
    <div
      onClick={onPick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative overflow-hidden cursor-pointer group"
      style={{
        borderRadius: '4px',
        border: `1px solid ${hov ? accent + '60' : 'rgba(255,255,255,0.07)'}`,
        background: '#0D1021',
        transition: 'all 280ms ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 12px 32px rgba(0,0,0,0.7), 0 0 20px ${accent}20` : '0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <img
          src={imageUrl}
          alt={celeb.name}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          style={{ transform: hov ? 'scale(1.07)' : 'scale(1)', transition: 'transform 600ms ease' }}
          onError={(e) => { e.currentTarget.src = placeholders.celebrityAvatar(celeb.name) }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080C18 30%, rgba(8,12,24,0.2) 70%, transparent)' }} />

        {/* "FREE" badge – all celebrities are free to play */}
        <span
          className="absolute top-2.5 left-2.5 text-[9px] font-heading font-black tracking-[2px] px-2 py-0.5"
          style={{ background: accent, color: '#080C18', borderRadius: '2px' }}
        >
          FREE
        </span>

        {/* Fans placeholder – we can show something like "Play now" */}
        <span className="absolute top-2.5 right-2.5 text-[10px] text-white/60 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
          <Users size={8} /> PLAY
        </span>

        {/* Hover CTA */}
        <div
          className="absolute inset-x-0 bottom-0 p-3 transition-all duration-250"
          style={{ opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(6px)' }}
        >
          <button
            className="w-full py-2 text-[11px] font-heading font-black tracking-[1.5px] uppercase"
            style={{ background: accent, color: '#080C18', borderRadius: '2px' }}
          >
            PLAY NOW →
          </button>
        </div>
      </div>

      <div className="px-3 pt-2.5 pb-3">
        <p className="font-heading font-bold text-white text-sm leading-tight truncate">{celeb.name}</p>
        <p className="text-[11px] mt-0.5 mb-2 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {celeb.genre || 'Celebrity'}
        </p>
        <p className="text-[10px] font-heading font-bold tracking-wider uppercase" style={{ color: accent }}>
          FREE ENTRY
        </p>
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const handleCta = useAuthRedirect() // now returns a function with no parameters

  // Fetch real celebrities from backend
  const { data: celebrities, isLoading, error } = useQuery({
    queryKey: ['celebrities-landing'],
    queryFn: getAllCelebrities,
    staleTime: 5 * 60 * 1000,
  })

  // Handle celebrity click – go to celebrity hub if logged in, otherwise register
  const handleCelebrityClick = (slug: string) => {
    if (user) {
      navigate(`/star/${slug}`)
    } else {
      navigate('/auth/register')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#080C18', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero section (unchanged) */}
      <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
        <div className="absolute inset-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zendaya_2019_by_Glenn_Francis.jpg/800px-Zendaya_2019_by_Glenn_Francis.jpg"
            alt="hero"
            className="w-full h-full object-cover object-top"
            style={{ filter: 'brightness(0.35) saturate(0.7)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #080C18 35%, rgba(8,12,24,0.6) 65%, transparent)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080C18 0%, transparent 60%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 70% at 20% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 px-6 md:px-12 flex flex-col justify-center" style={{ minHeight: '520px', paddingTop: '60px', paddingBottom: '60px' }}>
          <div className="flex items-center gap-2 mb-6" style={{ animation: 'fadeUp 400ms ease both' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00E396', boxShadow: '0 0 6px #00E396', animation: 'livePulse 1.5s ease-in-out infinite' }} />
            <span className="text-xs font-heading font-semibold tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
              8,420 PLAYERS ACTIVE NOW
            </span>
          </div>

          <h1
            className="font-heading font-black uppercase leading-none mb-5"
            style={{
              fontSize: 'clamp(44px, 9vw, 96px)',
              letterSpacing: '-1px',
              animation: 'fadeUp 500ms ease 100ms both',
              maxWidth: '700px',
            }}
          >
            PLAY.{' '}
            <span style={{ color: '#FFD700' }}>WIN.</span>
            <br />
            MEET YOUR
            <br />
            <span style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.4)',
              color: 'transparent',
              textShadow: 'none',
            }}>
              CELEBRITY
            </span>
          </h1>

          <p
            className="mb-8 font-body"
            style={{
              fontSize: 'clamp(12px, 1.6vw, 15px)',
              color: 'rgba(255,255,255,0.55)',
              maxWidth: '420px',
              lineHeight: '1.7',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              animation: 'fadeUp 500ms ease 200ms both',
            }}
          >
            TRIVIA · GAMES · SPIN TO WIN — REAL PRIZES FROM CASH AND
            CRYPTO TO VIDEO CALLS AND DINNER DATES WITH HOLLYWOOD STARS.
          </p>

          <div className="flex items-center gap-3" style={{ animation: 'fadeUp 500ms ease 300ms both' }}>
            <button
              onClick={handleCta}
              className="flex items-center gap-2 text-xs font-heading font-black tracking-[2px] uppercase px-6 py-3"
              style={{ background: '#FFD700', color: '#080C18', borderRadius: '3px', boxShadow: '0 4px 20px rgba(255,215,0,0.4)' }}
            >
              START FOR FREE <ChevronRight size={14} />
            </button>
            <a
              href="#stars"
              className="flex items-center gap-2 text-xs font-heading font-semibold tracking-[1.5px] uppercase px-5 py-3 border transition-colors hover:border-white/30"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: '3px' }}
              onClick={(e) => { e.preventDefault(); handleCta(); }}
            >
              VIEW STARS
            </a>
          </div>
        </div>
      </section>

      {/* Prize categories */}
      <section className="px-6 md:px-8 py-5 border-y" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0D1021' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {PRIZE_TIERS.map(p => (
            <button
              key={p.label}
              onClick={handleCta}
              className="flex items-center gap-3 px-4 py-3.5 border transition-all hover:border-opacity-60 group"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#111527', borderRadius: '3px', width: '100%', textAlign: 'left' }}
            >
              <span className="text-2xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-xs font-heading font-black tracking-wider uppercase group-hover:opacity-100 transition-opacity" style={{ color: p.accent }}>{p.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Stats bar (unchanged) */}
      <section className="px-6 md:px-8 py-6" style={{ background: '#080C18' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: '8,420',  label: 'ACTIVE PLAYERS',   icon: <Users size={16} /> },
            { val: '347',    label: 'PRIZES WON TODAY', icon: <Trophy size={16} /> },
            { val: '2.1M',   label: 'COINS IN PLAY',    icon: <Star size={16} /> },
            { val: '75%',    label: 'WIN RATE (GOLD)',   icon: <Zap size={16} /> },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
                {s.icon}
              </div>
              <div>
                <p className="font-heading font-black text-white" style={{ fontSize: '20px', lineHeight: 1 }}>{s.val}</p>
                <p className="text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Celebrity grid – dynamic from backend */}
      <section id="stars" className="px-6 md:px-8 pb-16" style={{ background: '#080C18' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-heading font-black text-white uppercase tracking-tight" style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}>
              CHOOSE YOUR STAR
            </h2>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(255,215,0,0.4), transparent)' }} />
            <button onClick={handleCta} className="text-[10px] font-heading font-bold tracking-[2px] uppercase px-4 py-2 border" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: '2px' }}>
              ALL STARS
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : error || !celebrities?.length ? (
            <div className="text-center py-16 text-white/50">Failed to load celebrities. Please refresh.</div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {celebrities.map(celeb => (
                <CelebCard
                  key={celeb.id}
                  celeb={celeb}
                  onPick={() => handleCelebrityClick(celeb.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Giveaway cards */}
      <section className="px-6 md:px-8 pb-16" style={{ background: '#080C18' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {GIVEAWAY_CARDS.map((g, i) => (
            <button
              key={i}
              onClick={handleCta}
              className="relative overflow-hidden group w-full text-left"
              style={{ borderRadius: '4px', minHeight: '200px', border: `1px solid rgba(255,255,255,0.07)` }}
            >
              <img
                src={g.img} alt={g.label} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'brightness(0.3) saturate(0.6)' }}
              />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(8,12,24,0.8) 0%, rgba(8,12,24,0.4) 100%)` }} />
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${g.accent}18, transparent)` }} />
              <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                <span className="text-xs font-heading font-black tracking-[2px] uppercase mb-2 inline-block px-2 py-0.5" style={{ background: g.accent, color: '#080C18', borderRadius: '2px', width: 'fit-content' }}>
                  {g.label}
                </span>
                <p className="text-xs font-body uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '280px', lineHeight: '1.6' }}>
                  {g.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Tiers section (unchanged) */}
      <section className="px-6 md:px-8 py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0D1021' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-heading font-black text-white uppercase tracking-tight" style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}>
              MEMBERSHIP TIERS
            </h2>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(255,215,0,0.4), transparent)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'BRONZE',   color: '#CD7F32', win: '30%', multi: '1×',   entry: 'FREE',      note: '7 referrals → payout unlock' },
              { name: 'SILVER',   color: '#C0C0C0', win: '50%', multi: '1.5×', entry: '$5 + 3 refs',note: 'Payout unlocked on entry' },
              { name: 'PLATINUM', color: '#E5E4E2', win: '75%', multi: '2×',   entry: '$10',        note: 'Grand prizes eligible' },
            ].map((tier) => (
              <div
                key={tier.name}
                className="relative overflow-hidden p-5"
                style={{
                  background: '#111527',
                  border: `1px solid ${tier.color}30`,
                  borderRadius: '4px',
                  borderTop: `3px solid ${tier.color}`,
                }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${tier.color}10, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
                    <span className="font-heading font-black tracking-[2px] text-sm" style={{ color: tier.color }}>{tier.name}</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { k: 'ENTRY',      v: tier.entry },
                      { k: 'WIN RATE',   v: tier.win   },
                      { k: 'MULTIPLIER', v: tier.multi },
                    ].map(row => (
                      <div key={row.k} className="flex items-center justify-between">
                        <span className="text-[10px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.k}</span>
                        <span className="text-xs font-heading font-bold" style={{ color: row.k === 'WIN RATE' ? tier.color : '#fff' }}>{row.v}</span>
                      </div>
                    ))}
                    <p className="text-[10px] pt-2 border-t uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                      {tier.note}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={handleCta} className="inline-flex items-center gap-2 text-xs font-heading font-black tracking-[2px] uppercase px-8 py-3" style={{ background: '#FFD700', color: '#080C18', borderRadius: '3px', boxShadow: '0 4px 20px rgba(255,215,0,0.3)' }}>
              START FREE — BRONZE TIER <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-8 py-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#060910' }}>
        <span className="font-heading font-black text-sm tracking-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>
          STAR<span style={{ color: 'rgba(255,215,0,0.4)' }}>WORLD</span>
        </span>
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2025 StarWorld. All rights reserved.</p>
      </footer>
    </div>
  )
}