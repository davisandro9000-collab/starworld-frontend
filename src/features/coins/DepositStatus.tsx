import { useQuery } from '@tanstack/react-query'
import { getDepositHistory, type Deposit } from '../../api/deposit.api'
import Spinner from '../../components/ui/Spinner'
import { cn } from '../../lib/utils'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    icon: '⏳',
    badgeClass: 'bg-warn/10 text-warn border border-warn/25',
    dotClass: 'bg-warn animate-pulse',
  },
  credited: {
    label: 'Credited',
    icon: '✅',
    badgeClass: 'bg-win/10 text-win border border-win/25',
    dotClass: 'bg-win',
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    badgeClass: 'bg-loss/10 text-loss border border-loss/25',
    dotClass: 'bg-loss',
  },
}

function usdToCoins(usd: number) { return Math.floor(usd * 3) }

function DepositCard({ deposit }: { deposit: Deposit }) {
  const config = STATUS_CONFIG[deposit.status]
  const date   = new Date(deposit.createdAt)

  const isCrypto   = deposit.method === 'crypto'
  const usd        = deposit.usdValue ?? deposit.giftCardAmountUsd ?? 0
  const coins      = deposit.coinsToAward ?? usdToCoins(usd)

  return (
    <div className={cn(
      'card rounded-sw-lg p-4 transition-all',
      deposit.status === 'pending' && 'border-warn/20',
      deposit.status === 'credited' && 'border-win/20',
      deposit.status === 'rejected' && 'border-loss/20',
    )}>
      <div className="flex items-start justify-between gap-3">

        {/* Left — method icon + details */}
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-9 h-9 rounded-sw flex items-center justify-center text-base shrink-0',
            'bg-sw-card-2 border border-sw-border'
          )}>
            {isCrypto ? '🔗' : '🎁'}
          </div>
          <div>
            <p className="font-heading font-semibold text-sm text-white leading-snug">
              {isCrypto
                ? `${deposit.cryptoCurrency} Deposit`
                : `${deposit.giftCardBrand ?? 'Gift Card'} Gift Card`}
            </p>
            <p className="text-xxs text-white/35 font-body mt-0.5">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' · '}
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>

            {/* TX hash snippet for crypto */}
            {isCrypto && deposit.txHash && (
              <p className="text-xxs text-white/25 font-mono mt-1 truncate max-w-[160px]">
                {deposit.txHash}
              </p>
            )}

            {/* Rejection reason */}
            {deposit.status === 'rejected' && deposit.rejectionReason && (
              <p className="text-xxs text-loss/80 font-body mt-1 leading-snug">
                Reason: {deposit.rejectionReason}
              </p>
            )}
          </div>
        </div>

        {/* Right — amount + status */}
        <div className="text-right shrink-0">
          {usd > 0 && (
            <p className="font-heading font-bold text-sm text-white">
              ${usd.toFixed(2)}
            </p>
          )}
          {deposit.status === 'credited' && (
            <p className="text-xxs text-gold font-heading font-semibold">
              +{coins.toLocaleString()} coins
            </p>
          )}
          {deposit.status === 'pending' && usd > 0 && (
            <p className="text-xxs text-white/30 font-body">
              ~{usdToCoins(usd).toLocaleString()} coins
            </p>
          )}
          <span className={cn(
            'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xxs font-heading font-semibold',
            config.badgeClass
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />
            {config.label}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DepositStatus() {
  const { data: deposits, isLoading, isError } = useQuery({
    queryKey: ['deposit-history'],
    queryFn: getDepositHistory,
    staleTime: 1000 * 30,      // refresh every 30s — user wants to see status update
    refetchInterval: 1000 * 60, // auto-refetch every 60s while page is open
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="card p-6 rounded-sw-lg text-center">
        <p className="text-sm text-loss font-heading font-semibold">Could not load deposits</p>
        <p className="text-xxs text-white/40 font-body mt-1">Try refreshing the page</p>
      </div>
    )
  }

  if (!deposits?.length) {
    return (
      <div className="card p-8 rounded-sw-lg text-center">
        <span className="text-3xl block mb-3">💳</span>
        <p className="font-heading font-semibold text-sm text-white mb-1">No deposits yet</p>
        <p className="text-xxs text-white/40 font-body">
          Submit a crypto or gift card deposit above to get started
        </p>
      </div>
    )
  }

  const pending  = deposits.filter(d => d.status === 'pending')
  const credited = deposits.filter(d => d.status === 'credited')
  const rejected = deposits.filter(d => d.status === 'rejected')

  return (
    <div className="space-y-4">

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pending',  count: pending.length,  color: 'text-warn' },
          { label: 'Credited', count: credited.length, color: 'text-win'  },
          { label: 'Rejected', count: rejected.length, color: 'text-loss' },
        ].map(({ label, count, color }) => (
          <div key={label} className="stat-card text-center">
            <p className={cn('font-heading font-bold text-xl', color)}>
              {count}
            </p>
            <p className="text-xxs text-white/40 font-body">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending deposits (top — most important) */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xxs text-warn/80 uppercase tracking-widest font-heading">
            Awaiting review
          </p>
          {pending.map(d => <DepositCard key={d.id} deposit={d} />)}
        </div>
      )}

      {/* Credited */}
      {credited.length > 0 && (
        <div className="space-y-2">
          <p className="text-xxs text-white/30 uppercase tracking-widest font-heading">
            Credited
          </p>
          {credited.map(d => <DepositCard key={d.id} deposit={d} />)}
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xxs text-white/30 uppercase tracking-widest font-heading">
            Rejected
          </p>
          {rejected.map(d => <DepositCard key={d.id} deposit={d} />)}
        </div>
      )}
    </div>
  )
}
