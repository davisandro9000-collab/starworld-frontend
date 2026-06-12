import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import Spinner from '../components/ui/Spinner';

export default function FootballTeamsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['football-teams'],
    queryFn: () => api.get('/football/teams').then(r => r.data.teams),
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!data || data.length === 0) {
    return (
      <div className="page-content text-center py-16">
        <p className="text-white/60">No teams available yet.</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="font-heading font-bold text-2xl text-white mb-2">⚽ World Cup 2026 Teams</h1>
      <p className="text-white/40 text-sm mb-6">Browse teams, check players, predict matches</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map(team => (
          <Link
            key={team.id}
            to={`/football/team/${team.slug}`}
            className="card-hover p-4 text-center transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 bg-sw-card-2 flex items-center justify-center">
              {team.flagUrl ? (
                <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🏆</span>
              )}
            </div>
            <h3 className="font-heading font-semibold text-white">{team.name}</h3>
            <p className="text-xxs text-white/40 mt-1">Group {team.group}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}