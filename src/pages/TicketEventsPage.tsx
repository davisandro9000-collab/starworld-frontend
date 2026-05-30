import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getCelebrity } from '../api/celebrity.api'
import { getTicketEvents, TicketEvent as ApiTicketEvent } from '../api/ticket.api'
import TicketEventCard, { TicketEvent } from '../features/tickets/TicketEventCard'
import Spinner from '../components/ui/Spinner'

const SORT_OPTIONS = [
  { id: 'date-asc',   label: 'Soonest first' },
  { id: 'date-desc',  label: 'Latest first'  },
  { id: 'price-asc',  label: 'Price ↑'       },
  { id: 'price-desc', label: 'Price ↓'       },
] as const
type SortId = typeof SORT_OPTIONS[number]['id']

// Convert API event to card expected shape
function convertEvent(apiEvent: ApiTicketEvent): TicketEvent {
  return {
    id: apiEvent.id,
    name: apiEvent.eventName,
    venue: apiEvent.venue || '',
    city: apiEvent.city || '',
    date: apiEvent.eventDate || new Date().toISOString(),
    imageUrl: apiEvent.imageUrl,
    minPrice: apiEvent.priceMin,
    url: apiEvent.ticketUrl || '#',
    category: 'Concerts',
  }
}

export default function TicketEventsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [sort, setSort]         = useState<SortId>('date-asc')
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<TicketEvent | null>(null)

  const { data: celeb, isLoading: celebLoading } = useQuery({
    queryKey: ['celebrity', slug],
    queryFn: () => getCelebrity(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
  })

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['ticket-events', slug],
    queryFn: () => getTicketEvents(1, 20, slug),
    enabled: !!slug,
    staleTime: 2 * 60_000,
  })

  const events: TicketEvent[] = useMemo(() => {
    if (!eventsData) return []
    let apiEvents: ApiTicketEvent[] = []
    if (Array.isArray(eventsData)) {
      apiEvents = eventsData
    } else if ('events' in eventsData) {
      apiEvents = (eventsData as any).events
    }
    return apiEvents.map(convertEvent)
  }, [eventsData])

  const isLoading = celebLoading || eventsLoading

  const filtered = useMemo(() => {
    let list = [...events]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':   return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'date-desc':  return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'price-asc':  return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity)
        case 'price-desc': return (b.minPrice ?? 0) - (a.minPrice ?? 0)
        default: return 0
      }
    })
    return list
  }, [events, search, sort])

  const celebAvatar = celeb?.avatarUrl

  return (
    <div className="page-content">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <Link to={`/star/${slug}`} className="hover:text-gold transition-colors">
          {celeb?.name ?? slug}
        </Link>
        <span>/</span>
        <span className="text-gray-300">Upcoming Events</span>
      </nav>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gold-gradient">
            {celeb?.name ?? '…'} — Events
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-400 mt-1">
              {filtered.length} upcoming {filtered.length === 1 ? 'event' : 'events'}
            </p>
          )}
        </div>
        {celebAvatar && (
          <img
            src={celebAvatar}
            alt={celeb?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gold/30 shrink-0"
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city or venue…"
            className="input-sw w-full pl-8 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortId)}
          className="input-sw text-sm w-full sm:w-44"
        >
          {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 text-center space-y-2">
          <p className="text-3xl">🎟</p>
          <p className="text-white font-medium">No events found</p>
          <p className="text-sm text-gray-500">
            {search ? 'Try a different search term.' : 'Check back soon — events are updated daily.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="btn-outline text-sm mt-2">Clear search</button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event, i) => (
            <TicketEventCard key={event.id} event={event} index={i} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="card w-full max-w-md rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.name} className="w-full h-44 object-cover" />
            )}
            <div className="p-5 space-y-3">
              <h2 className="font-heading font-bold text-lg text-white">{selected.name}</h2>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📍 {selected.venue}, {selected.city}</p>
                <p>📅 {new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(selected.date))}</p>
                {selected.minPrice != null && <p>💰 From <span className="text-white">${selected.minPrice}</span></p>}
              </div>
              <div className="flex gap-3 pt-2">
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn-gold flex-1 text-center text-sm">
                  Buy on Ticketmaster
                </a>
                <button onClick={() => setSelected(null)} className="btn-outline text-sm px-4">Close</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <p className="text-[11px] text-gray-700 text-center mt-8">
        Event data powered by Ticketmaster Discovery API · Updates every 2 minutes
      </p>
    </div>
  )
}