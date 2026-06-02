import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import TierBadge from '../ui/TierBadge';
import NotificationBell from '../ui/NotificationBell';
import { api } from '../../api/axios';
import { placeholders } from '../../lib/placeholders';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', end: true },
    { to: '/games', label: 'Games' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/referrals', label: 'Referrals' },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
      navigate('/auth/login');
    }
  };

  const balance = user?.coinBalance ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-navbar h-navbar bg-sw-card border-b border-sw-border shadow-inner-top">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">
        {/* Logo – new attractive design */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded flex items-center justify-center font-heading font-black text-xs" style={{ background: 'linear-gradient(135deg, #FFD700, #E8A020)', color: '#080C18' }}>
            SW
          </div>
          <span className="font-heading font-black text-white text-lg tracking-tight">
            STAR<span style={{ color: '#FFD700' }}>WORLD</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-sw text-sm font-body transition-all duration-150 ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {user ? (
            <>
              <div className="flex items-center gap-1.5 bg-sw-bg/50 rounded-full px-3 py-1.5 border border-sw-border">
                <span className="text-xs text-gold">🪙</span>
                <span className="font-heading font-semibold text-sm text-white">
                  {balance.toLocaleString()}
                </span>
              </div>

              <TierBadge tier={user?.tier?.slug ?? 'bronze'} />

              <NotificationBell />

              <div className="relative group">
                <button
                  className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-sw-bg font-heading font-bold text-xs shrink-0 hover:shadow-gold-sm transition-shadow overflow-hidden"
                  aria-label="Account menu"
                >
                  <img
                    src={user.avatarUrl || placeholders.userAvatar(user.username)}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = placeholders.userAvatar(user.username);
                    }}
                  />
                </button>

                <div className="absolute right-0 top-full mt-2 w-44 glass rounded-sw-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-card">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base">📊</span> Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base">⚙️</span> Settings
                  </Link>
                  <div className="divider my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-loss/80 hover:text-loss hover:bg-loss/5 transition-colors"
                  >
                    <span className="text-base">🚪</span> Log out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="btn-ghost text-xs px-3 py-1.5">
                Log in
              </Link>
              <Link to="/auth/register" className="btn-gold text-xs px-3 py-1.5">
                Sign up
              </Link>
            </>
          )}

          <button
            className="md:hidden btn-ghost p-1.5"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-sw-card border-t border-sw-border px-4 py-3 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-sw text-sm font-body transition-colors ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}