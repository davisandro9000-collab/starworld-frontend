import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/axios';
import Spinner from '../components/ui/Spinner';
import { placeholders, getSafeImageUrl } from '../lib/placeholders';

type Tab = 'stars' | 'tickets' | 'predictions';

export default function FootballPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stars');
  const { data: stars, isLoading: starsLoading } = useQuery({
    queryKey: ['football-stars'],
    queryFn: () => api.get('/football/stars').then(r => r.data.stars),
  });
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['football-matches'],
    queryFn: () => api.get('/football/matches').then(r => r.data.matches),
  });
  const { data: predictions, isLoading: predLoading } = useQuery({
    queryKey: ['football-predictions'],
    queryFn: () => api.get('/football/predictions').then(r => r.data.predictions),
    enabled: activeTab === 'predictions',
  });
  const { data: leaderboard, isLoading: lbLoading } = useQuery({
    queryKey: ['football-leaderboard'],
    queryFn: () => api.get('/football/leaderboard').then(r => r.data.leaderboard),
  });

  return (
    <div className="page-content">
      <h1 className="font-heading font-bold text-2xl text-white mb-2">⚽ Football</h1>
      <p className="text-white/40 text-sm mb-6">Follow stars, get tickets, predict winners</p>

      <div className="flex gap-2 border-b border-sw-border mb-6">
        {[
          { id: 'stars', label: 'Stars', icon: '⭐' },
          { id: 'tickets', label: 'Tickets', icon: '🎫' },
          { id: 'predictions', label: 'Prediction Games', icon: '🏆' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-gold text-gold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span className="mr-1">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stars' && (
        starsLoading ? <Spinner size="lg" /> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stars?.map((star: any) => (
              <Link
                key={star.id}
                to={`/football/star/${star.slug}`}
                className="card-hover p-4 text-center transition-all hover:-translate-y-1"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3">
                  <img
                    src={getSafeImageUrl(star.avatarUrl, 'celebrityAvatar')}
                    alt={star.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = placeholders.celebrityAvatar(star.name); }}
                  />
                </div>
                <h3 className="font-heading font-semibold text-white">{star.name}</h3>
                <p className="text-xxs text-white/40 mt-1">{star.club || star.nationality}</p>
              </Link>
            ))}
          </div>
        )
      )}

      {activeTab === 'tickets' && (
        matchesLoading ? <Spinner size="lg" /> : (
          <div className="space-y-4">
            {matches?.map((match: any) => (
              <div key={match.id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-heading font-bold text-white">{match.homeTeam} vs {match.awayTeam}</p>
                  <p className="text-xs text-white/40">{new Date(match.matchDate).toLocaleString()}</p>
                  <p className="text-xs text-white/40">{match.venue}</p>
                </div>
                {match.ticketUrl ? (
                  <a href={match.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn-gold text-sm px-4 py-2">
                    Buy Tickets
                  </a>
                ) : (
                  <span className="text-white/30 text-sm">Tickets TBA</span>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-8">
          <div>
            <h2 className="font-heading font-bold text-lg text-white mb-3">Make your predictions</h2>
            {matchesLoading ? <Spinner /> : (
              <div className="space-y-3">
                {matches?.filter((m: any) => m.status === 'upcoming').map((match: any) => (
                  <PredictionCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-white mb-3">🏆 Leaderboard</h2>
            {lbLoading ? <Spinner /> : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-sw-card-2">
                    <tr className="text-white/40 text-xs">
                      <th className="p-2 text-left">Rank</th>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.map((entry: any, idx: number) => (
                      <tr key={entry.userId} className="border-t border-sw-border/30">
                        <td className="p-2 text-white text-sm">{idx + 1}</td>
                        <td className="p-2 text-white text-sm">{entry.username}</td>
                        <td className="p-2 text-right text-gold font-bold">{entry.totalPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-white mb-3">My predictions</h2>
            {predLoading ? <Spinner /> : (
              <div className="space-y-2">
                {predictions?.length ? predictions.map((p: any) => (
                  <div key={p.id} className="card p-3 text-sm">
                    <p>{p.match.homeTeam} vs {p.match.awayTeam}</p>
                    <p>Predicted: {p.predictedWinner?.name} {p.predictedScore ? `(${p.predictedScore})` : ''}</p>
                    <p>Points: {p.pointsEarned}</p>
                  </div>
                )) : <p className="text-white/40">No predictions yet.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PredictionCard({ match }: { match: any }) {
  const [selectedWinner, setSelectedWinner] = useState('');
  const [score, setScore] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { data: stars } = useQuery({
    queryKey: ['football-stars'],
    queryFn: () => api.get('/football/stars').then(r => r.data.stars),
  });
  const submitMutation = useMutation({
    mutationFn: () => api.post('/football/predictions', {
      matchId: match.id,
      predictedWinnerId: selectedWinner,
      predictedScore: score,
    }),
    onSuccess: () => setSubmitted(true),
  });
  if (submitted) return <div className="text-win text-sm">Prediction saved!</div>;
  return (
    <div className="card p-4 space-y-2">
      <p className="font-bold">{match.homeTeam} vs {match.awayTeam}</p>
      <p className="text-xs text-white/40">{new Date(match.matchDate).toLocaleString()}</p>
      <select
        className="input-sw w-full"
        value={selectedWinner}
        onChange={e => setSelectedWinner(e.target.value)}
      >
        <option value="">Select winner</option>
        {stars?.map((star: any) => (
          <option key={star.id} value={star.id}>{star.name}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Score (e.g., 2-1)"
        value={score}
        onChange={e => setScore(e.target.value)}
        className="input-sw w-full"
      />
      <button
        onClick={() => submitMutation.mutate()}
        disabled={!selectedWinner || submitMutation.isPending}
        className="btn-gold w-full"
      >
        Submit Prediction
      </button>
    </div>
  );
}