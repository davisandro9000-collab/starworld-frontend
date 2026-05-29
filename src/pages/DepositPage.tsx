import DepositForm from '../features/coins/DepositForm';

export default function DepositPage() {
  return (
    <div className="page-content">
      <h1 className="font-heading font-bold text-2xl text-white mb-2">Deposit</h1>
      <p className="text-white/40 text-sm mb-6">Add coins using crypto or gift cards – $1 USD = 3 coins</p>
      <DepositForm />
    </div>
  );
}