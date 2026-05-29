import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'

export interface TicketEvent {
  id: string
  name: string
  venue: string
  city: string
  date: string          // ISO string
  imageUrl: string | null
  minPrice: number | null  // USD
  url: string
  category: string
}

interface TicketEventCardProps {
  event: TicketEvent
  onSelect?: (event: TicketEvent) => void
  index?: number        // for staggered animation
}

export default function TicketEventCard({ event, onSelect, index = 0 }: TicketEventCardProps) {
  const dateObj = new Date(event.date)
  const isPast  = dateObj < new Date()

  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
    hour:  'numeric',
    minute: '2-digit',
  }).format(dateObj)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'card-hover rounded-xl overflow-hidden cursor-pointer group',
        isPast && 'opacity-50 pointer-events-none',
      )}
      onClick={() => onSelect?.(event)}
    >
      {/* Cover image */}
      <div className="relative h-36 bg-sw-card-2 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-700">
            🎟
          </div>
        )}
        {/* Date chip */}
        <div className="absolute top-2 left-2 bg-sw-bg/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-white border border-sw-border">
          {formatted}
        </div>
        {/* Category chip */}
        <div className="absolute top-2 right-2 bg-gold/10 border border-gold/30 rounded-full px-2 py-0.5 text-[10px] text-gold">
          {event.category}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:text-gold transition-colors">
          {event.name}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-1">
          {event.venue} · {event.city}
        </p>
        <div className="flex items-center justify-between pt-1">
          {event.minPrice != null ? (
            <span className="text-xs text-gray-400">
              From <span className="text-white font-medium">${event.minPrice}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-600">Price TBA</span>
          )}
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[11px] text-gold border border-gold/30 rounded-full px-2 py-0.5 hover:bg-gold/10 transition-colors"
          >
            Ticketmaster ↗
          </a>
        </div>
      </div>
    </motion.div>
  )
}
