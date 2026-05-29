import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

interface Celebrity {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
}

const fetchCelebrities = async (): Promise<Celebrity[]> => {
  const response = await api.get('/celebrities');
  // Backend returns { success: true, celebrities: [...] }
  return response.data.celebrities || [];
};

export default function GamesPage() {
  const { data: celebrities, isLoading, error } = useQuery({
    queryKey: ['celebrities'],
    queryFn: fetchCelebrities,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !celebrities || celebrities.length === 0) {
    return (
      <div className="page-content text-center py-20">
        <p className="text-white/60">No celebrities available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="font-heading font-bold text-2xl text-white mb-2">Games</h1>
      <p className="text-white/40 text-sm mb-6">Pick a celebrity to play games and earn coins</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {celebrities.map((celeb) => (
          <Link
            key={celeb.id}
            to={`/star/${celeb.slug}`}
            className="card-hover p-4 text-center transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-sw-card-2 flex items-center justify-center text-3xl mb-3">
              {celeb.avatarUrl ? (
                <img src={celeb.avatarUrl} alt={celeb.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                '⭐'
              )}
            </div>
            <h3 className="font-heading font-semibold text-white">{celeb.name}</h3>
            <p className="text-xxs text-white/40 mt-1">Play games & win prizes</p>
          </Link>
        ))}
      </div>
    </div>
  );
}