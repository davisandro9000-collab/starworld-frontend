import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReferrals } from '../../hooks/useReferrals'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Spinner from '../../components/ui/Spinner'

const BRONZE_TARGET = 7

export default function ReferralDash() {
  const { user } = useAuthStore()
  const { data, isLoading, isError } = useReferrals()
  const [copied, setCopied] = useState(false)

  const referralCode = user?.referralCode ?? data?.referralCode ?? ''
  const shareUrl = `${window.location.origin}/auth/register?ref=${referralCode}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>
  if (isError || !data) return <p className="text-sm text-loss text-center py-6">Failed to load referrals.</p>

  const stats = data as any
  const activated = stats.activatedCount
  const progress = Math.min((activated / BRONZE_TARGET) * 100, 100)
  const remaining = Math.max(BRONZE_TARGET - activated, 0)

  return (
    <div className="space-y-5">
      {/* Share box */}
      <div className="card p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest">Your referral link</p>
        <div className="flex items-center gap-2 bg-sw-bg rounded-lg px-3 py-2 border border-sw-border cursor-pointer group" onClick={copyLink}>
          <span className="text-xs text-gray-300 flex-1 truncate">{shareUrl}</span>
          <span className="text-xs text-gold shrink-0 group-hover:underline">{copied ? '✓ Copied' : 'Copy'}</span>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Twitter / X', href: `https://twitter.com/intent/tweet?text=Join+me+on+StarWorld+🌟&url=${encodeURIComponent(shareUrl)}` },
            { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent('Join StarWorld 🌟 ' + shareUrl)}` },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs flex-1 text-center py-2">{label}</a>
          ))}
        </div>
      </div>

      {/* Bronze payout progress */}
      {!stats.payoutUnlocked && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Bronze payout unlock</span>
            <span className="text-xs text-gray-400">{activated} / {BRONZE_TARGET} activated</span>
          </div>
          <div className="progress-track">
            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
          </div>
          <p className="text-xs text-gray-500">{remaining > 0 ? `${remaining} more activated referral${remaining !== 1 ? 's' : ''} to unlock cash payouts` : 'Almost there!'}</p>
          <p className="text-[11px] text-gray-600">A referral activates when the referred user verifies their email <strong className="text-gray-400">and</strong> has a credited deposit.</p>
        </div>
      )}

      {stats.payoutUnlocked && (
        <div className="card card-gold p-4 text-center space-y-1">
          <p className="text-gold font-heading font-bold text-lg">🎉 Payout Unlocked</p>
          <p className="text-xs text-gray-400">You've hit 7 activated referrals — Bronze cash payouts are enabled.</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center"><p className="text-xl font-heading font-bold text-white">{stats.totalReferrals}</p><p className="text-[11px] text-gray-500 mt-0.5">Total referred</p></div>
        <div className="card p-3 text-center"><p className="text-xl font-heading font-bold text-white">{stats.activatedCount}</p><p className="text-[11px] text-gray-500 mt-0.5">Activated</p></div>
        <div className="card p-3 text-center"><p className="text-xl font-heading font-bold text-white">{stats.pendingCount}</p><p className="text-[11px] text-gray-500 mt-0.5">Pending</p></div>
      </div>

      {/* Referral list */}
      {stats.list?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Referred users</p>
          {stats.list.map((r: any) => (
            <div key={r.id} className={cn('card px-4 py-3 flex items-center justify-between', r.activated && 'border-win/20')}>
              <div className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full', r.activated ? 'bg-win' : 'bg-amber-400')} />
                <span className="text-sm text-white">@{r.username}</span>
              </div>
              <div className="text-right">
                <span className={cn('text-[11px] font-medium', r.activated ? 'text-win' : 'text-amber-400')}>{r.activated ? 'Active' : 'Pending'}</span>
                <p className="text-[10px] text-gray-600">{formatDistanceToNow(new Date(r.joinedAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!stats.list || stats.list.length === 0) && <p className="text-sm text-gray-500 text-center py-4">No referrals yet — share your link to get started.</p>}
    </div>
  )
}