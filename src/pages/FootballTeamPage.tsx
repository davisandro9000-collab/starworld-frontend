import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import Spinner from '../components/ui/Spinner';
import PredictionModal from '../components/football/PredictionModal';
import TicketResaleModal from '../components/football/TicketResaleModal';
import { getActivePredictionGames } from '../api/football';

export default function FootballTeamPage() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<'squad' | 'matches' | 'news'>('squad');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [predictionMatchId, setPredictionMatchId] = useState<string | null>(null);

  // 1. Team data
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['football-team', slug],
    queryFn: () => api.get(`/football/teams/${slug}`).then(r => r.data.team),
  });

  // 2. Team news
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['football-news', slug],
    queryFn: () => api.get(`/football/teams/${slug}/news`).then(r => r.data.news),
    enabled: !!slug && activeTab === 'news',
  });

  // 3. Team matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['football-team-matches', slug],
    queryFn: () => api.get(`/football/teams/${slug}/matches`).then(r => r.data.matches),
    enabled: !!slug && activeTab === 'matches',
  });

  // 4. Active prediction games
  const { data: predictionGames } = useQuery({
    queryKey: ['prediction-games'],
    queryFn: getActivePredictionGames,
    enabled: activeTab === 'matches',
  });

  if (teamLoading) return <Spinner size="lg" />;
  if (!team) return <div className="page-content text-center py-16">Team not found</div>;

  return (
    <div className="page-content">
      <Link to="/football" className="text-gold text-sm mb-4 inline-block">← Back to Teams</Link>

      {/* Team header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-sw-card-2 flex items-center justify-center">
          {team.flagUrl ? (
            <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🏆</span>
          )}
        </div>
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">{team.name}</h1>
          <p className="text-white/60">Group {team.group} · Coach: {team.coach}</p>
          {team.worldRanking && <p className="text-white/40 text-sm">FIFA Ranking: #{team.worldRanking}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sw-border mb-4">
        {(['squad', 'matches', 'news'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-heading font-semibold capitalize transition-colors -mb-px ${
              activeTab === tab ? 'border-b-2 border-gold text-gold' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Squad Tab */}
      {activeTab === 'squad' && (
        <>
          <h2 className="font-heading font-bold text-xl text-white mb-3">Squad</h2>
          {team.players?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sw-card-2">
                  <tr className="text-white/40 text-xs">
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-left">Goals</th>
                    <th className="p-2 text-left">Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map(player => (
                    <tr key={player.id} className="border-t border-sw-border/30">
                      <td className="p-2 text-white text-sm">{player.number || '—'}</td>
                      <td className="p-2 text-white text-sm">{player.name}</td>
                      <td className="p-2 text-white/60 text-sm">{player.position || '—'}</td>
                      <td className="p-2 text-white/60 text-sm">{player.goals}</td>
                      <td className="p-2 text-white/60 text-sm">{player.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white/40">No player data available.</p>
          )}
        </>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <>
          <h2 className="font-heading font-bold text-xl text-white mb-3">Upcoming & Recent Matches</h2>
          {matchesLoading && <Spinner size="md" />}
          {matches?.length === 0 && <p className="text-white/40">No matches found for this team.</p>}
          <div className="space-y-3">
            {matches?.map(match => {
              const hasPredictionGame = predictionGames?.some(g => g.matchId === match.id) ?? false;
              return (
                <div key={match.id} className="bg-sw-card-2 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-bold text-white">{match.homeTeam.name}</span>
                    <span className="text-white/60 text-xl">vs</span>
                    <span className="font-heading font-bold text-white">{match.awayTeam.name}</span>
                    <span className="text-white/40 text-sm ml-2">
                      {new Date(match.matchDate).toLocaleString()} · {match.venue}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {hasPredictionGame ? (
                      <button onClick={() => setPredictionMatchId(match.id)} className="btn-gold text-sm px-3 py-1.5">
                        Predict
                      </button>
                    ) : (
                      <button disabled className="btn-gold text-sm px-3 py-1.5 opacity-50 cursor-not-allowed">
                        No Predictions
                      </button>
                    )}
                    <button onClick={() => setSelectedMatchId(match.id)} className="btn-outline text-sm px-3 py-1.5">
                      Buy Tickets
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <>
          <h2 className="font-heading font-bold text-xl text-white mb-3">Latest News</h2>
          {newsLoading && <Spinner size="md" />}
          {news?.length === 0 && <p className="text-white/40">No news articles found.</p>}
          <div className="space-y-4">
            {news?.map(article => (
              <div key={article.id} className="bg-sw-card-2 p-4 rounded-lg">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  <h3 className="text-white font-bold">{article.title}</h3>
                </a>
                <p className="text-white/60 text-sm">{article.source} · {new Date(article.publishedAt).toLocaleDateString()}</p>
                <p className="text-white/80 mt-2 line-clamp-2">{article.content}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <PredictionModal open={!!predictionMatchId} onClose={() => setPredictionMatchId(null)} matchId={predictionMatchId!} />
      <TicketResaleModal open={!!selectedMatchId} onClose={() => setSelectedMatchId(null)} matchId={selectedMatchId!} />
    </div>
  );
}