import { useEffect, useRef } from 'react'
import { useCoinStore } from '../../stores/coinStore'

export default function CoinBalance() {
  const balance = useCoinStore(s => s.balance)
  const prevRef = useRef(balance)
  const chipRef = useRef<HTMLDivElement>(null)

  // Pop animation whenever balance changes
  useEffect(() => {
    if (balance !== prevRef.current && chipRef.current) {
      chipRef.current.classList.remove('animate-coin-pop')
      // Force reflow to restart animation
      void chipRef.current.offsetWidth
      chipRef.current.classList.add('animate-coin-pop')
    }
    prevRef.current = balance
  }, [balance])

  return (
    <div
      ref={chipRef}
      className="coin-chip select-none"
      title={`${balance.toLocaleString()} coins ≈ $${(balance / 3).toFixed(2)} USD`}
    >
      <span className="coin-dot" aria-hidden="true" />
      <span className="font-heading font-bold text-sm tabular-nums">
        {balance.toLocaleString()}
      </span>
    </div>
  )
}
