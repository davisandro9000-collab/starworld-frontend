import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifStore } from '../../stores/notifStore'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead } = useNotifStore()

  const recent = notifications.slice(0, 5)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative btn-ghost p-1.5 rounded-sw"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <span className="text-lg leading-none">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5
                       bg-gold text-sw-bg text-xxs font-bold font-heading
                       rounded-full flex items-center justify-center leading-none"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-72 glass rounded-sw-lg overflow-hidden shadow-card z-50 animate-slide-in-up">
            <div className="flex items-center justify-between px-3 py-2 border-b border-sw-border">
              <span className="font-heading font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => { markRead('all'); setOpen(false) }}
                  className="text-xxs text-gold/70 hover:text-gold transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {recent.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/40 text-sm">
                No notifications yet
              </div>
            ) : (
              <ul>
                {recent.map(n => (
                  <li
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`px-3 py-2.5 border-b border-sw-border/50 cursor-pointer transition-colors
                      ${n.read ? 'hover:bg-white/3' : 'bg-gold/5 hover:bg-gold/8'}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      )}
                      <div className={!n.read ? '' : 'pl-3.5'}>
                        <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                        {n.body && (
                          <p className="text-xxs text-white/50 mt-0.5 leading-snug">{n.body}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="px-3 py-2">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-gold/70 hover:text-gold transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}