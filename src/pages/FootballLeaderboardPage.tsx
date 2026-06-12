import { useQuery } from '@tanstack/react-query';
import { getPredictionLeaderboard } from '../api/football';
import Spinner from '../components/ui/Spinner';
import { Trophy } from 'lucide-react';

export default function FootballLeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['prediction-leaderboard'],
    queryFn: getPredictionLeaderboard,
  });

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="page-content">
      <h1 className="font-heading font-bold text-2xl text-white mb-2 flex items-center gap-2">
        <Trophy className="text-gold" size={28} /> Prediction Leaderboard
      </h1>
      <p className="text-white/40 text-sm mb-6">Top predictors earn points and coins</p>
      <div className="bg-sw-card-2 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gold/10">
            <tr className="text-white/60 text-sm">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-right">Points</th>
              <th className="p-3 text-right">Coins</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((entry, idx) => (
              <tr key={entry.userId} className="border-t border-sw-border/30">
                <td className="p-3 text-white font-bold">#{idx + 1}</td>
                <td className="p-3 text-white flex items-center gap-2">
                  {entry.avatarUrl ? <img src={entry.avatarUrl} className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs">{entry.username[0]}</div>}
                  {entry.username}
                </td>
                <td className="p-3 text-white/80 text-right">{entry.totalPoints}</td>
                <td className="p-3 text-white/80 text-right">{entry.totalCoins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}