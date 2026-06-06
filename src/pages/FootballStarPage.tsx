import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import Spinner from '../components/ui/Spinner';
import { placeholders, getSafeImageUrl } from '../lib/placeholders';

export default function FootballStarPage() {
  const { slug } = useParams();
  const { data: star, isLoading } = useQuery({
    queryKey: ['football-star', slug],
    queryFn: () => api.get(`/football/stars/${slug}`).then(r => r.data.star),
  });
  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['football-star-news', slug],
    queryFn: () => api.get(`/football/stars/${slug}/news`).then(r => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!star) return <div className="page-content text-center py-16">Football star not found</div>;

  const articles = newsData?.articles || [];

  return (
    <div className="page-content">
      <Link to="/football" className="text-gold text-sm mb-4 inline-block">← Back to Football</Link>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-40 h-40 rounded-full overflow-hidden shrink-0 mx-auto md:mx-0">
          <img
            src={getSafeImageUrl(star.avatarUrl, 'celebrityAvatar')}
            alt={star.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = placeholders.celebrityAvatar(star.name); }}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-heading font-bold text-3xl text-white">{star.name}</h1>
          <p className="text-white/60">{star.nationality} • {star.club}</p>
          <p className="text-white/40 mt-2">{star.bio || 'No bio available.'}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-heading font-bold text-xl text-white mb-4">Latest News</h2>
        {newsLoading ? <Spinner size="md" /> : articles.length === 0 ? (
          <p className="text-white/40">No news articles yet.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article: any, idx: number) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover p-4 rounded-sw-lg flex gap-4 items-start group"
              >
                {article.imageUrl && (
                  <img src={article.imageUrl} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                )}
                <div>
                  <p className="font-heading font-semibold text-sm text-white group-hover:text-gold transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xxs text-white/40 mt-1">{article.description}</p>
                  <p className="text-xxs text-white/25 mt-1">{new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}