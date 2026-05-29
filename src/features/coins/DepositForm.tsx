import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDepositAddresses,
  submitDeposit,
  type SubmitDepositPayload,
} from '../../api/deposit.api'
import Spinner from '../../components/ui/Spinner'
import { cn } from '../../lib/utils'

// ─── Crypto definitions with address pairs ───────────────────────────────────
const CRYPTO_CONFIG: Record<string, {
  name: string
  icon: string
  addresses: string[]
}> = {
  BTC: {
    name: 'Bitcoin',
    icon: '₿',
    addresses: [
      'bc1q68dufekl3qsstnjs8um3z4kx8hegu6au6868qu',
      'bc1qqtfxy2h5dcjdt7w7qscasj8m8lfg4kn5u6knnj',
    ],
  },
  ETH: {
    name: 'Ethereum',
    icon: 'Ξ',
    addresses: [
      '0xd24a2e388a9da692b5ea59ac3004fa153c8b56f3',
      '0x2fd3ec2068254a4965241729d45ac7bc0c2bfa91',
    ],
  },
  USDT: {
    name: 'USDT (ERC20)',
    icon: '₮',
    addresses: [
      '0xd24a2e388a9da692b5ea59ac3004fa153c8b56f3',
      '0x2fd3ec2068254a4965241729d45ac7bc0c2bfa91',
    ],
  },
  USDC: {
    name: 'USDC (ERC20)',
    icon: '💵',
    addresses: [
      '0xd24a2e388a9da692b5ea59ac3004fa153c8b56f3',
      '0x2fd3ec2068254a4965241729d45ac7bc0c2bfa91',
    ],
  },
  BNB: {
    name: 'BNB (BEP20)',
    icon: 'B',
    addresses: [
      '0xd24a2e388a9da692b5ea59ac3004fa153c8b56f3',
      '0x2fd3ec2068254a4965241729d45ac7bc0c2bfa91',
    ],
  },
}

const GIFT_CARD_BRANDS = ['amazon', 'google_play', 'apple', 'steam']

const GIFT_CARD_LABELS: Record<string, { icon: string; label: string }> = {
  amazon:      { icon: '📦', label: 'Amazon' },
  google_play: { icon: '🎮', label: 'Google Play' },
  apple:       { icon: '🍎', label: 'Apple' },
  steam:       { icon: '🎲', label: 'Steam' },
}

function usdToCoins(usd: number) { return Math.floor(usd * 3) }

function CryptoPanel({ method, address }: { method: string; address: string }) {
  const [txHash, setTxHash] = useState('')
  const [usdValue, setUsdValue] = useState('')
  const [copied, setCopied] = useState(false)
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: () =>
      submitDeposit({
        method: 'crypto',
        cryptoCurrency: method as any,
        txHash: txHash.trim(),
        walletAddressUsed: address,
        usdValue: parseFloat(usdValue),
      } as SubmitDepositPayload),
    onSuccess: () => {
      setTxHash('')
      setUsdValue('')
      qc.invalidateQueries({ queryKey: ['deposit-history'] })
    },
  })

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const coins = usdValue ? usdToCoins(parseFloat(usdValue)) : 0
  const canSubmit = txHash.trim().length > 10 && parseFloat(usdValue) > 0 && !isPending

  return (
    <div className="space-y-4">
      <div className="card p-4 rounded-sw-lg">
        <p className="text-xxs text-white/40 uppercase tracking-widest font-heading mb-2">
          Send {CRYPTO_CONFIG[method]?.name || method} to this address
        </p>
        <div className="flex items-center gap-2 bg-sw-bg rounded-sw p-3">
          <code className="flex-1 text-xs text-cyan font-mono break-all leading-relaxed">
            {address}
          </code>
          <button
            onClick={copyAddress}
            className={cn('btn-ghost text-xxs px-2.5 py-1.5 shrink-0 transition-colors', copied && 'text-win')}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xxs text-white/50 font-body mb-1.5">Transaction Hash (TX ID)</label>
        <input className="input-sw font-mono text-xs" placeholder="0x... or blockchain TX hash" value={txHash} onChange={e => setTxHash(e.target.value)} />
      </div>

      <div>
        <label className="block text-xxs text-white/50 font-body mb-1.5">Amount sent (USD equivalent)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
          <input className="input-sw pl-7" type="number" min="1" step="0.01" placeholder="0.00" value={usdValue} onChange={e => setUsdValue(e.target.value)} />
        </div>
        {coins > 0 && (
          <p className="text-xxs text-gold/70 font-body mt-1.5">
            You will receive approximately <span className="font-bold text-gold">{coins.toLocaleString()} coins</span> after admin verification
          </p>
        )}
      </div>

      <button onClick={() => mutate()} disabled={!canSubmit} className="btn-gold w-full">
        {isPending ? <Spinner size="sm" /> : 'Submit Deposit'}
      </button>

      {isSuccess && (
        <div className="card p-3 rounded-sw border border-win/30 bg-win/5 text-center">
          <p className="text-sm text-win font-heading font-semibold">✓ Deposit submitted</p>
          <p className="text-xxs text-white/40 font-body mt-0.5">Admin will verify and credit your coins shortly</p>
        </div>
      )}

      {isError && (
        <div className="card p-3 rounded-sw border border-loss/30 bg-loss/5 text-center">
          <p className="text-sm text-loss font-heading font-semibold">Submission failed</p>
          <p className="text-xxs text-white/40 font-body mt-0.5">Check your details and try again</p>
        </div>
      )}
    </div>
  )
}

function GiftCardPanel({ brand }: { brand: string }) {
  const [digits, setDigits] = useState('')
  const [amount, setAmount] = useState('')
  const qc = useQueryClient()
  const meta = GIFT_CARD_LABELS[brand] ?? { icon: '🎁', label: brand }

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: () =>
      submitDeposit({
        method: 'gift_card',
        giftCardBrand: brand,
        giftCardDigits: digits.trim(),
        giftCardAmountUsd: parseFloat(amount),
      } as SubmitDepositPayload),
    onSuccess: () => {
      setDigits('')
      setAmount('')
      qc.invalidateQueries({ queryKey: ['deposit-history'] })
    },
  })

  const coins = amount ? usdToCoins(parseFloat(amount)) : 0
  const canSubmit = digits.trim().length >= 4 && parseFloat(amount) > 0 && !isPending

  return (
    <div className="space-y-4">
      <div className="card p-4 rounded-sw-lg text-center">
        <span className="text-4xl block mb-1">{meta.icon}</span>
        <p className="font-heading font-semibold text-sm text-white">{meta.label} Gift Card</p>
        <p className="text-xxs text-white/40 font-body mt-0.5">Enter the code on the back of your card</p>
      </div>

      <div>
        <label className="block text-xxs text-white/50 font-body mb-1.5">Gift card code / digits</label>
        <input className="input-sw font-mono tracking-widest uppercase text-sm" placeholder="XXXX-XXXX-XXXX-XXXX" value={digits} onChange={e => setDigits(e.target.value.toUpperCase())} />
      </div>

      <div>
        <label className="block text-xxs text-white/50 font-body mb-1.5">Card value (USD)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
          <input className="input-sw pl-7" type="number" min="1" step="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        {coins > 0 && (
          <p className="text-xxs text-gold/70 font-body mt-1.5">
            You will receive approximately <span className="font-bold text-gold">{coins.toLocaleString()} coins</span> after admin verification
          </p>
        )}
      </div>

      <button onClick={() => mutate()} disabled={!canSubmit} className="btn-gold w-full">
        {isPending ? <Spinner size="sm" /> : 'Submit Gift Card'}
      </button>

      {isSuccess && (
        <div className="card p-3 rounded-sw border border-win/30 bg-win/5 text-center">
          <p className="text-sm text-win font-heading font-semibold">✓ Gift card submitted</p>
          <p className="text-xxs text-white/40 font-body mt-0.5">Admin will verify and credit your coins shortly</p>
        </div>
      )}

      {isError && (
        <div className="card p-3 rounded-sw border border-loss/30 bg-loss/5 text-center">
          <p className="text-sm text-loss font-heading font-semibold">Submission failed</p>
          <p className="text-xxs text-white/40 font-body mt-0.5">Check your details and try again</p>
        </div>
      )}
    </div>
  )
}

export default function DepositForm() {
  const [method, setMethod] = useState<'crypto' | 'gift_card'>('crypto')
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [selectedGiftCard, setSelectedGiftCard] = useState<string | null>(null)

  // Fetch gift card methods from backend (they have no addresses)
  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['deposit-addresses'],
    queryFn: getDepositAddresses,
    staleTime: 1000 * 60 * 10,
  })

  // Extract gift card methods from backend (methods that are in GIFT_CARD_BRANDS)
  let giftCardMethods: string[] = []
  if (Array.isArray(addressesData)) {
    giftCardMethods = addressesData
      .filter((a) => GIFT_CARD_BRANDS.includes(a.method))
      .map((a) => a.method)
  } else if (addressesData && typeof addressesData === 'object') {
    const arr = (addressesData as any).addresses || []
    giftCardMethods = arr
      .filter((a: any) => GIFT_CARD_BRANDS.includes(a.method))
      .map((a: any) => a.method)
  }

  // Crypto methods (always available from our config)
  const cryptoMethods = Object.keys(CRYPTO_CONFIG)

  // When a crypto method is selected, pick a random address from its list
  const getRandomAddress = (method: string) => {
    const config = CRYPTO_CONFIG[method]
    if (!config) return ''
    const randomIndex = Math.floor(Math.random() * config.addresses.length)
    return config.addresses[randomIndex]
  }

  // Safe access: selectedCrypto is non‑null when we reach this point
  const selectedAddress = selectedCrypto ? getRandomAddress(selectedCrypto) : ''

  return (
    <div className="space-y-5">
      <div className="card p-4 rounded-sw-lg border border-gold/15 bg-gradient-to-r from-gold/5 to-transparent">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">ℹ️</span>
          <div>
            <p className="font-heading font-semibold text-sm text-white mb-0.5">Manual verification</p>
            <p className="text-xxs text-white/50 font-body leading-relaxed">
              All deposits are reviewed by an admin. Coins are credited once verified — usually within 1–2 hours.
              Rate: <span className="text-gold font-semibold">$1 = 3 coins</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-sw-card rounded-sw-lg border border-sw-border">
        {(['crypto', 'gift_card'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMethod(m); setSelectedCrypto(null); setSelectedGiftCard(null) }}
            className={cn(
              'flex-1 py-2 rounded-sw text-sm font-heading font-semibold transition-all',
              method === m ? 'bg-gold text-sw-bg shadow-gold-sm' : 'text-white/50 hover:text-white'
            )}
          >
            {m === 'crypto' ? '🔗 Crypto' : '🎁 Gift Card'}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-6"><Spinner size="md" /></div>}

      {!isLoading && method === 'crypto' && (
        <>
          {!selectedCrypto ? (
            <div>
              <p className="text-xxs text-white/40 uppercase tracking-widest font-heading mb-3">Select currency</p>
              <div className="grid grid-cols-2 gap-2">
                {cryptoMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedCrypto(method)}
                    className="card-hover p-4 rounded-sw-lg text-center border border-sw-border hover:border-gold/30"
                  >
                    <span className="text-2xl font-mono font-bold text-gold block mb-1">
                      {CRYPTO_CONFIG[method].icon}
                    </span>
                    <span className="text-xs font-heading font-semibold text-white">
                      {CRYPTO_CONFIG[method].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setSelectedCrypto(null)} className="btn-ghost text-xs px-2 py-1.5">
                ← Change currency
              </button>
              {selectedAddress && (
                <CryptoPanel method={selectedCrypto} address={selectedAddress} />
              )}
            </>
          )}
        </>
      )}

      {!isLoading && method === 'gift_card' && (
        <>
          {!selectedGiftCard ? (
            <div>
              <p className="text-xxs text-white/40 uppercase tracking-widest font-heading mb-3">Select gift card type</p>
              <div className="grid grid-cols-2 gap-2">
                {giftCardMethods.map(brand => {
                  const meta = GIFT_CARD_LABELS[brand]
                  return (
                    <button
                      key={brand}
                      onClick={() => setSelectedGiftCard(brand)}
                      className="card-hover p-4 rounded-sw-lg text-center border border-sw-border hover:border-gold/30"
                    >
                      <span className="text-2xl block mb-1">{meta.icon}</span>
                      <span className="text-xs font-heading font-semibold text-white">{meta.label}</span>
                    </button>
                  )
                })}
                {giftCardMethods.length === 0 && (
                  <p className="col-span-2 text-center text-xxs text-white/30 font-body py-4">
                    Gift cards are currently unavailable.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setSelectedGiftCard(null)} className="btn-ghost text-xs px-2 py-1.5">
                ← Change type
              </button>
              <GiftCardPanel brand={selectedGiftCard} />
            </>
          )}
        </>
      )}
    </div>
  )
}