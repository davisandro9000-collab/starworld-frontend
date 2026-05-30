// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllCelebrities } from '../api/celebrity.api';
import Spinner from '../components/ui/Spinner';

// Helper to generate a slug from name
const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

export default function LandingPage() {
  const { data: celebrities, isLoading, error } = useQuery({
    queryKey: ['celebrities'],
    queryFn: getAllCelebrities,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-10 text-white/50">Failed to load celebrities.</div>;

  return (
    <div className="page-content py-10">
      <h1 className="font-heading font-bold text-3xl text-gold mb-6">Choose Your Star</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {celebrities?.map((celeb) => {
          // Use backend slug if exists, otherwise generate
          const slug = celeb.slug || generateSlug(celeb.name);
          console.log(`Link for ${celeb.name}: /star/${slug}`);
          return (
            <Link
              key={celeb.id}
              to={`/star/${slug}`}
              className="card-hover rounded-xl overflow-hidden bg-sw-card border border-sw-border"
            >
              <div className="h-32 bg-sw-card-2 flex items-center justify-center">
                {celeb.avatarUrl ? (
                  <img src={celeb.avatarUrl} alt={celeb.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">⭐</span>
                )}
              </div>
              <div className="p-3 text-center">
                <p className="font-heading font-semibold text-white">{celeb.name}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}