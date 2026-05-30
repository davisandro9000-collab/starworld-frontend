import { api } from './axios'

export type DepositMethod =
  | 'BTC' | 'ETH' | 'USDT_TRC20' | 'USDT_ERC20' | 'BNB'
  | 'amazon' | 'google_play' | 'apple' | 'steam'

export type DepositStatus = 'pending' | 'credited' | 'rejected'

// ─── Deposit record — consumed by DepositStatus.tsx ──────────────────────────
export interface Deposit {
  id: string
  status: DepositStatus
  createdAt: string

  // 'crypto' | 'giftcard' — server normalises raw DepositMethod into this
  method: 'crypto' | 'giftcard'

  // Crypto fields
  cryptoCurrency?: string
  txHash?: string | null
  usdValue?: number | null

  // Gift card fields
  giftCardBrand?: string | null
  giftCardAmountUsd?: number | null

  // Result fields
  coinsToAward?: number | null
  rejectionReason?: string | null
}

// ─── Submit payload — matches what DepositForm sends ─────────────────────────
export type SubmitDepositPayload =
  | {
      method: 'crypto'
      cryptoCurrency: DepositMethod
      txHash?: string
      walletAddressUsed?: string
      usdValue: number
      claimedAmountUsd?: number
    }
  | {
      method: 'gift_card'
      giftCardBrand: string
      giftCardDigits: string
      giftCardAmountUsd: number
      claimedAmountUsd?: number
    }

// ─── Deposit address — consumed by DepositForm.tsx ───────────────────────────
export interface DepositAddress {
  method: DepositMethod
  address: string
  network: string
  qrUrl: string | null
  isActive: boolean
}

// ─── API calls ────────────────────────────────────────────────────────────────
export const submitDeposit = (payload: SubmitDepositPayload) =>
  api.post<{ depositId: string; status: 'pending' }>('/users/me/deposit', payload).then(r => r.data)

export const getDepositAddresses = async (): Promise<DepositAddress[]> => {
  const response = await api.get('/deposits/addresses');
  // If backend returns { success: true, addresses: [...] }, return response.data.addresses
  // If it returns the array directly, return response.data
  return Array.isArray(response.data) ? response.data : response.data.addresses || [];
};

export const getDepositHistory = () =>
  api.get<Deposit[]>('/users/me/deposit-history').then(r => r.data)
