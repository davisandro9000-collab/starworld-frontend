import { useEffect, useState } from 'react'
import { useSocketStore } from '../../stores/socketStore'

interface FeedItem {
  id: string
  text: string
}

const SEED_ITEMS: FeedItem[] = [
  { id: '1', text: '🎉 @james_k just won a Rihanna ticket from the spin wheel' },
  { id: '2', text: '🏆 @sarah_m won $50 cash playing Number Guess' },
  { id: '3', text: '🎫 @tony_x scored Drake concert tickets in the Ticket Game' },
  { id: '4', text: '💰 @priya_r won 200 coins on Trivia' },
  { id: '5', text: '🎸 @lee_j just upgraded to Silver tier' },
  { id: '6', text: '🥇 @fatima_s won a Platinum prize from the spin wheel' },
]

export default function LiveFeedTicker() {
  const [items, setItems] = useState<FeedItem[]>(SEED_ITEMS)
  const { socket } = useSocketStore()

  useEffect(() => {
    if (!socket) return

    const handler = (data: { winnerName: string; prizeName: string; starName: string }) => {
      const newItem: FeedItem = {
        id: Date.now().toString(),
        text: `🎉 @${data.winnerName} just won ${data.prizeName} from ${data.starName}'s world`,
      }
      setItems(prev => [newItem, ...prev].slice(0, 20))
    }

    socket.on('live_feed', handler)
    return () => { socket.off('live_feed', handler) }
  }, [socket])

  // Duplicate items so seamless loop works
  const doubled = [...items, ...items]

  return (
    <div className="sticky bottom-0 z-30 bg-sw-card border-t border-sw-border/60 h-8 overflow-hidden">
      <div className="flex items-center h-full">
        {/* "LIVE" label */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 border-r border-sw-border/60 h-full bg-sw-card z-10">
          <span className="glow-dot-cyan" aria-hidden="true" />
          <span className="badge-live py-0 px-0 border-0 bg-transparent text-cyan font-bold text-xxs tracking-widest">
            LIVE
          </span>
        </div>

        {/* Scrolling feed */}
        <div className="ticker-wrap flex-1 h-full">
          <div className="ticker-inner h-full items-center">
            {doubled.map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className="text-xxs text-white/50 shrink-0 pr-12"
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
