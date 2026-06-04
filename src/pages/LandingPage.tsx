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
  const handleRedirect = () => {
    if (user) navigate('/dashboard')
    else navigate('/auth/register')
  }
  return handleRedirect
}

/* ─── Celebrity grid card ───────────────────────────────────── */
function CelebCard({ celeb, onPick }: { celeb: Celebrity; onPick: () => void }) {
  const [hov, setHov] = useState(false)
  const accent = '#FFD700'
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
        <span
          className="absolute top-2.5 left-2.5 text-[9px] font-heading font-black tracking-[2px] px-2 py-0.5"
          style={{ background: accent, color: '#080C18', borderRadius: '2px' }}
        >
          FREE
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-white/60 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
          <Users size={8} /> PLAY
        </span>
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
  const handleCta = useAuthRedirect()

  const { data: celebrities, isLoading, error } = useQuery({
    queryKey: ['celebrities-landing'],
    queryFn: getAllCelebrities,
    staleTime: 5 * 60 * 1000,
  })

  const handleCelebrityClick = (slug: string) => {
    if (user) navigate(`/star/${slug}`)
    else navigate('/auth/register')
  }

  return (
    <div className="min-h-screen" style={{ background: '#080C18', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero section – added z-0 to keep it behind the navbar */}
      <section className="relative z-0 overflow-hidden" style={{ minHeight: '520px' }}>
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

      {/* Prize categories, stats, celebrity grid, giveaways, tiers, footer – unchanged */}
      {/* ... (copy exactly from your existing file, no changes needed) ... */}
    </div>
  );
}