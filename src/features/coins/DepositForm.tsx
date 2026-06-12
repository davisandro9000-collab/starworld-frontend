import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { cn } from '../../lib/utils';

const CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin', icon: '₿' },
  { value: 'ETH', label: 'Ethereum', icon: 'Ξ' },
  { value: 'USDT_TRC20', label: 'USDT (TRC20)', icon: '₮' },
  { value: 'BNB', label: 'BNB (BEP20)', icon: 'B' },
];

const GIFT_CARD_BRANDS = [
  { value: 'amazon', label: 'Amazon', icon: '📦' },
  { value: 'google_play', label: 'Google Play', icon: '🎮' },
  { value: 'apple', label: 'Apple', icon: '🍎' },
  { value: 'steam', label: 'Steam', icon: '🎲' },
];

function usdToCoins(usd: number) { return Math.floor(usd * 3); }

export default function DepositForm() {
  const qc = useQueryClient();
  const [method, setMethod] = useState<'crypto' | 'gift_card'>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedGiftBrand, setSelectedGiftBrand] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState('');
  const [walletAddressUsed, setWalletAddressUsed] = useState('');
  const [giftCardDigits, setGiftCardDigits] = useState('');

  const { data: addressesData, isLoading: addressesLoading } = useQuery({
    queryKey: ['deposit-addresses'],
    queryFn: () => api.get('/deposits/addresses').then(r => r.data.addresses),
  });

  const depositMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey = crypto.randomUUID();
      const payload: any = {
        method,
        usdValue: parseFloat(usdValue),
      };
      if (method === 'crypto') {
        payload.cryptoCurrency = selectedCrypto;
        payload.walletAddressUsed = walletAddressUsed;
      } else {
        payload.giftCardBrand = selectedGiftBrand;
        payload.giftCardDigits = giftCardDigits;
      }
      await api.post('/deposits', payload, { headers: { 'Idempotency-Key': idempotencyKey } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deposit-history'] });
      setUsdValue('');
      setWalletAddressUsed('');
      setGiftCardDigits('');
      alert('Deposit submitted! Admin will review and credit your coins soon.');
    },
    onError: () => alert('Submission failed. Please try again.'),
  });

  const coins = usdValue ? usdToCoins(parseFloat(usdValue)) : 0;
  const canSubmit = parseFloat(usdValue) > 0 &&
    (method === 'crypto' ? selectedCrypto && walletAddressUsed.trim().length > 0 : selectedGiftBrand && giftCardDigits.trim().length > 0);

  if (addressesLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      {/* Method toggle */}
      <div className="flex gap-2 p-1 bg-sw-card rounded-sw-lg border border-sw-border">
        {(['crypto', 'gift_card'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMethod(m); setSelectedCrypto(null); setSelectedGiftBrand(null); setWalletAddressUsed(''); setGiftCardDigits(''); }}
            className={cn(
              'flex-1 py-2 rounded-sw text-sm font-heading font-semibold transition-all',
              method === m ? 'bg-gold text-sw-bg shadow-gold-sm' : 'text-white/50 hover:text-white'
            )}
          >
            {m === 'crypto' ? '🔗 Crypto' : '🎁 Gift Card'}
          </button>
        ))}
      </div>

      {/* Amount field */}
      <div>
        <label className="block text-xxs text-white/50 font-body mb-1.5">Amount in USD</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
          <input
            type="number"
            min="1"
            step="0.01"
            className="input-sw pl-7"
            placeholder="0.00"
            value={usdValue}
            onChange={e => setUsdValue(e.target.value)}
          />
        </div>
        {coins > 0 && (
          <p className="text-xxs text-gold/70 mt-1.5">
            You will receive <span className="font-bold text-gold">{coins.toLocaleString()} coins</span> after verification
          </p>
        )}
      </div>

      {/* Crypto section */}
      {method === 'crypto' && !selectedCrypto && (
        <div>
          <p className="text-xxs text-white/40 uppercase tracking-widest mb-2">Select cryptocurrency</p>
          <div className="grid grid-cols-2 gap-2">
            {CRYPTO_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedCrypto(opt.value)}
                className="card-hover p-4 rounded-sw-lg text-center border border-sw-border"
              >
                <span className="text-2xl font-mono font-bold text-gold block mb-1">{opt.icon}</span>
                <span className="text-xs font-heading font-semibold text-white">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {method === 'crypto' && selectedCrypto && (
        <>
          <button onClick={() => setSelectedCrypto(null)} className="btn-ghost text-xs px-2 py-1.5">← Change currency</button>
          <div>
            <label className="block text-xxs text-white/50 font-body mb-1.5">Your wallet address (where you send from)</label>
            <input
              className="input-sw font-mono text-xs"
              placeholder="0x... or bc1..."
              value={walletAddressUsed}
              onChange={e => setWalletAddressUsed(e.target.value)}
            />
            <p className="text-xxs text-white/30 mt-1">The address you are sending from – for admin reference</p>
          </div>
          {addressesData && addressesData.find((a: any) => a.method === selectedCrypto) && (
            <div className="card p-4 rounded-sw-lg">
              <p className="text-xxs text-white/40 uppercase mb-2">Send {selectedCrypto} to this address</p>
              <code className="block bg-sw-bg p-3 rounded text-xs font-mono break-all text-cyan">
                {addressesData.find((a: any) => a.method === selectedCrypto).address}
              </code>
            </div>
          )}
        </>
      )}

      {/* Gift card section */}
      {method === 'gift_card' && !selectedGiftBrand && (
        <div>
          <p className="text-xxs text-white/40 uppercase tracking-widest mb-2">Select gift card brand</p>
          <div className="grid grid-cols-2 gap-2">
            {GIFT_CARD_BRANDS.map(b => (
              <button
                key={b.value}
                onClick={() => setSelectedGiftBrand(b.value)}
                className="card-hover p-4 rounded-sw-lg text-center border border-sw-border"
              >
                <span className="text-2xl block mb-1">{b.icon}</span>
                <span className="text-xs font-heading font-semibold text-white">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {method === 'gift_card' && selectedGiftBrand && (
        <>
          <button onClick={() => setSelectedGiftBrand(null)} className="btn-ghost text-xs px-2 py-1.5">← Change brand</button>
          <div>
            <label className="block text-xxs text-white/50 font-body mb-1.5">Gift card code / digits</label>
            <input
              className="input-sw font-mono tracking-widest uppercase"
              placeholder="XXXX-XXXX-XXXX"
              value={giftCardDigits}
              onChange={e => setGiftCardDigits(e.target.value.toUpperCase())}
            />
          </div>
        </>
      )}

      <button
        onClick={() => depositMutation.mutate()}
        disabled={!canSubmit || depositMutation.isPending}
        className="btn-gold w-full"
      >
        {depositMutation.isPending ? <Spinner size="sm" /> : 'Submit Deposit'}
      </button>
    </div>
  );
}