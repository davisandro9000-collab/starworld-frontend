import { create } from 'zustand';

interface CoinState {
  balance: number;
  setBalance: (balance: number) => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
}

export const useCoinStore = create<CoinState>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  addCoins: (amount) => set((state) => ({ balance: state.balance + amount })),
  deductCoins: (amount) => set((state) => ({ balance: state.balance - amount })),
}));