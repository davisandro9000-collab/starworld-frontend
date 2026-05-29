import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCelebrity, getCelebNews } from '../api/celebrity.api'
import Spinner from '../components/ui/Spinner'
import TierBadge from '../components/ui/TierBadge'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import GameModal from '../components/games/GameModal'

type Tab = 'games' | 'bio' | 'news' | 'tickets'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'games',   label: 'Games',   icon: '🎮' },
  { id: 'bio',     label: 'Bio',     icon: '⭐' },
  { id: 'news',    label: 'News',    icon: '📰' },
  { id: 'tickets', label: 'Tickets', icon: '🎫' },
]

const GAMES = [
  { id: 'spin',        icon: '🎰', name: 'Spin Wheel',    reward: 'Win prizes',      color: 'from-gold/20 to-gold-dim/10',    border: 'border-gold/30' },
  { id: 'trivia',      icon: '🧠', name: 'Trivia',        reward: '+20 coins/win',   color: 'from-cyan/20 to-cyan-dim/10',    border: 'border-cyan/30' },
  { id: 'memory',      icon: '🃏', name: 'Memory',        reward: '+15 coins/pair',  color: 'from-purple-500/20 to-purple-700/10', border: 'border-purple-500/30' },
  { id: 'hangman',     icon: '🎯', name: 'Hangman',       reward: '+60 coins/win',   color: 'from-win/20 to-win/10',          border: 'border-win/30' },
  { id: 'word',        icon: '🔤', name: 'Word Scramble', reward: '+40 coins/win',   color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30' },
  { id: 'number',      icon: '🔢', name: 'Number Guess',  reward: '+100 coins/win',  color: 'from-pink-500/20 to-pink-700/10', border: 'border-pink-500/30' },
]

function GamesTab({ onSelectGame }: { onSelectGame: (gameId: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="card-gold p-5 rounded-sw-lg flex items-center justify-between gap-4">
        <div>
          <p className="text-xxs text-gold/60 uppercase tracking-widest mb-1 font-heading">Featured</p>
          <h3 className="font-heading font-bold text-lg text-gold mb-1">🎰 Daily Spin</h3>
          <p className="text-sm text-white/50">Spin the wheel for a chance to win cash, tickets &amp; prizes</p>
        </div>
        <button className="btn-gold shrink-0 text-sm px-5 py-2.5" onClick={() => onSelectGame('spin')}>
          Spin Now
        </button>
      </div>

      <div>
        <div className="section-header">
          <h2 className="section-title">All Games</h2>
          <span className="text-xxs text-white/30 font-body">Odds improve with tier</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GAMES.filter(g => g.id !== 'spin').map(game => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={cn(
                'card-hover p-4 text-center rounded-sw-lg border bg-gradient-to-br',
                game.color, game.border,
                'transition-all duration-200 hover:scale-[1.02] hover:shadow-card'
              )}
            >
              <span className="block text-3xl mb-2">{game.icon}</span>
              <p className="font-heading font-semibold text-sm text-white mb-0.5">{game.name}</p>
              <p className="text-xxs text-white/40">{game.reward}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4 rounded-sw">
        <p className="text-xs text-white/40 mb-3 font-body">Your win odds by tier</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { tier: 'bronze' as const, odds: '30%' },
            { tier: 'silver' as const, odds: '50%' },
            { tier: 'platinum' as const, odds: '75%' },
          ].map(({ tier, odds }) => (
            <div key={tier} className="text-center">
              <TierBadge tier={tier} />
              <p className="font-heading font-bold text-base text-white mt-1.5">{odds}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BioTab({ celeb }: { celeb: { name: string; genre?: string; bio?: string } }) {
  return (
    <div className="space-y-4">
      <div className="card p-5 rounded-sw-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gold font-heading font-semibold text-sm">About</span>
          {celeb.genre && <span className="badge-live text-xxs px-2 py-0.5">{celeb.genre}</span>}
        </div>
        <p className="text-white/70 text-sm font-body leading-relaxed">
          {celeb.bio ?? `${celeb.name} is one of the world's most celebrated entertainers. Follow their world on StarWorld to earn coins, win prizes, and get exclusive access to concert tickets.`}
        </p>
      </div>

      <div className="card p-5 rounded-sw-lg">
        <h3 className="font-heading font-semibold text-sm text-white mb-3">Quick Facts</h3>
        <ul className="space-y-2">
          {[
            { label: 'Genre', value: celeb.genre ?? 'Entertainment' },
            { label: 'Platform', value: 'StarWorld' },
            { label: 'Fan Tier', value: 'Open to all' },
          ].map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between text-sm">
              <span className="text-white/40 font-body">{label}</span>
              <span className="text-white font-body">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function NewsTab({ slug }: { slug: string }) {
  const { data: news, isLoading } = useQuery({
    queryKey: ['celeb-news', slug],
    queryFn: () => getCelebNews(slug),
    staleTime: 1000 * 60 * 15,
  })

  if (isLoading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>
  if (!news?.length) return <div className="card p-8 text-center rounded-sw-lg"><span className="text-3xl block mb-3">📰</span><p className="text-white/40 text-sm font-body">No news articles yet. Check back soon.</p></div>

  return (
    <div className="space-y-3">
      {news.map(article => (
        <a key={article.id} href={article.sourceUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="card-hover p-4 rounded-sw-lg flex gap-4 items-start group">
          {article.imageUrl && <img src={article.imageUrl} alt="" className="w-16 h-16 rounded-sw object-cover shrink-0 bg-sw-card-2" />}
          <div className="min-w-0">
            <p className="font-heading font-semibold text-sm text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">{article.headline}</p>
            {article.summary && <p className="text-xxs text-white/40 mt-1 font-body line-clamp-2 leading-relaxed">{article.summary}</p>}
            <p className="text-xxs text-white/25 mt-1.5 font-body">{new Date(article.publishedAt).toLocaleDateString()}</p>
          </div>
        </a>
      ))}
    </div>
  )
}

function TicketsTab({ slug, celebName }: { slug: string; celebName: string }) {
  return (
    <div className="space-y-4">
      <div className="card-gold p-5 rounded-sw-lg text-center">
        <span className="text-4xl block mb-3">🎫</span>
        <h3 className="font-heading font-bold text-base text-gold mb-1">{celebName} Concert Tickets</h3>
        <p className="text-sm text-white/50 mb-4 font-body">Browse upcoming events, buy P2P from other fans, or win tickets through games</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to={`/star/${slug}/tickets`} className="btn-gold text-sm px-4 py-2">View All Events</Link>
          <Link to="/marketplace" className="btn-outline text-sm px-4 py-2">P2P Marketplace</Link>
        </div>
      </div>
      <div className="card p-4 rounded-sw-lg border border-cyan/20 bg-gradient-to-br from-cyan/5 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-heading font-semibold text-sm text-cyan">Ticket Game</p>
            <p className="text-xxs text-white/40 font-body">Win a cash prize in any game → wager it in a PvP fastest-finger duel for real tickets</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CelebrityHubPage() {
  const { slug } = useParams<{ slug: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const user = useAuthStore(s => s.user)

  const { data: celeb, isLoading, isError } = useQuery({
    queryKey: ['celebrity', slug],
    queryFn: () => getCelebrity(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
  if (isError || !celeb) {
    return (
      <div className="page-content text-center py-20">
        <span className="text-5xl block mb-4">😕</span>
        <h2 className="font-heading font-bold text-xl text-white mb-2">Celebrity not found</h2>
        <p className="text-white/40 text-sm font-body mb-6">This star might have left the building.</p>
        <Link to="/" className="btn-gold">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sw-card to-sw-bg" aria-hidden="true">
          {celeb.bannerUrl && <img src={celeb.bannerUrl} alt="" className="w-full h-full object-cover opacity-20" />}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sw-bg to-transparent" />
        </div>
        <div className="relative page-content pt-8 pb-6">
          <div className="flex items-end gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-sw-xl border-2 border-gold/40 overflow-hidden bg-sw-card-2 shadow-gold">
                {celeb.avatarUrl ? <img src={celeb.avatarUrl} alt={celeb.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">⭐</div>}
              </div>
              <span className="absolute -bottom-1 -right-1 badge-live text-xxs px-1.5 py-0.5">LIVE</span>
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-white leading-tight">{celeb.name}</h1>
              {celeb.genre && <p className="text-sm text-white/50 font-body mt-0.5">{celeb.genre}</p>}
              {user && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xxs text-white/30 font-body">Your tier</span>
                  <TierBadge tier={user.tier} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[56px] z-40 bg-sw-bg border-b border-sw-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 rounded-sw text-sm font-body whitespace-nowrap transition-all duration-150 shrink-0',
                  activeTab === tab.id ? 'bg-gold/10 text-gold font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="page-content pt-5 pb-10">
        {activeTab === 'games' && <GamesTab onSelectGame={setSelectedGame} />}
        {activeTab === 'bio' && <BioTab celeb={celeb} />}
        {activeTab === 'news' && <NewsTab slug={celeb.slug} />}
        {activeTab === 'tickets' && <TicketsTab slug={celeb.slug} celebName={celeb.name} />}
      </div>

      {/* Game modal */}
      {selectedGame && <GameModal gameType={selectedGame as any} celebrityId={celeb.id} onClose={() => setSelectedGame(null)} />}
    </div>
  )
}