// src/pages/NotificationsPage.tsx
import { useState } from 'react'
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../lib/utils'
import { useNotifStore, type AppNotification } from '../stores/notifStore'

type Filter = 'all' | 'unread' | 'high'

const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'high',   label: 'Important' },
]

/** Map notification type strings to emoji icons */
function notifIcon(type: string): string {
  const map: Record<string, string> = {
    tier_upgrade:     '🚀',
    game_win:         '🏆',
    payout_unlocked:  '💸',
    deposit_credited: '✅',
    deposit_rejected: '❌',
    referral_bonus:   '👥',
    ticket_game:      '🎫',
    auction_won:      '🔨',
    prize_won:        '🎁',
    announcement:     '📢',
  }
  return map[type] ?? '🔔'
}

function NotifRow({
  notif,
  onMarkRead,
}: {
  notif: AppNotification
  onMarkRead: (id: string) => void
}) {
  const accent = notif.accentColor ?? '#FFD700'

  return (
    <div
      className={cn(
        'group relative flex gap-4 px-4 py-4 rounded-xl transition-colors',
        'border',
        notif.read
          ? 'bg-[#13172B]/60 border-[#1E2440]'
          : 'bg-[#13172B] border-[#1E2440]',
      )}
      style={
        !notif.read
          ? { boxShadow: `inset 3px 0 0 ${accent}` }
          : undefined
      }
    >
      {/* Unread dot */}
      {!notif.read && (
        <span
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl',
          'bg-white/5 border border-white/10',
        )}
      >
        {notifIcon(notif.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn('font-heading font-semibold text-sm leading-snug', notif.read ? 'text-white/60' : 'text-white')}>
          {notif.title}
        </p>
        {notif.body && (
          <p className="font-body text-xs text-white/50 leading-relaxed line-clamp-2">
            {notif.body}
          </p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <span className="font-body text-[11px] text-white/30">
            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
          </span>
          {notif.ctaLabel && notif.ctaUrl && (
            <a
              href={notif.ctaUrl}
              className="font-heading text-[11px] font-semibold"
              style={{ color: accent }}
            >
              {notif.ctaLabel} →
            </a>
          )}
        </div>
      </div>

      {/* Mark read button — visible on hover for unread items */}
      {!notif.read && (
        <button
          onClick={() => onMarkRead(notif.id)}
          className={cn(
            'flex-shrink-0 self-start mt-1',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'text-white/30 hover:text-white/70',
          )}
          aria-label="Mark as read"
          title="Mark as read"
        >
          <CheckCheck className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, clear } = useNotifStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmClear, setConfirmClear] = useState(false)

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'high')   return n.priority === 'high'
    return true
  })

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      // Auto-reset after 3s if user doesn't confirm
      setTimeout(() => setConfirmClear(false), 3_000)
      return
    }
    clear()
    setConfirmClear(false)
  }

  return (
    <div className="page-content">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="section-header mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-[#FFD700]" />
          <h1 className="section-title">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/40 font-heading font-bold text-xs text-[#FFD700]">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClear}
              className={cn(
                'btn-ghost text-xs flex items-center gap-1.5',
                confirmClear && 'border-[#EF4444]/50 text-[#EF4444] hover:bg-[#EF4444]/10',
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear ? 'Confirm clear' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-[#13172B] border border-[#1E2440] w-fit">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all',
              filter === key
                ? 'bg-[#1A1F35] text-white border border-[#1E2440]'
                : 'text-white/40 hover:text-white/70',
            )}
          >
            {label}
            {key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── List ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <BellOff className="w-10 h-10 text-white/20" />
          <div>
            <p className="font-heading font-semibold text-white/40">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </p>
            <p className="font-body text-xs text-white/25 mt-1">
              {filter === 'all'
                ? 'Notifications from games, deposits, and referrals will appear here.'
                : 'Switch to "All" to see everything.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((notif) => (
            <NotifRow key={notif.id} notif={notif} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  )
}
