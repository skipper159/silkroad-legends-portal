import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Award, Calendar, Users, Newspaper, ArrowRight } from 'lucide-react';
import { weburl } from '@/lib/api';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

const getCategoryIcon = (category: string) => {
  const lowerCategory = category?.toLowerCase();
  if (lowerCategory === 'update') return <Award className='h-4 w-4' />;
  if (lowerCategory === 'event') return <Calendar className='h-4 w-4' />;
  if (lowerCategory === 'community') return <Users className='h-4 w-4' />;
  return <Newspaper className='h-4 w-4' />;
};

const getCategoryColor = (category: string) => {
  const lowerCategory = category?.toLowerCase();
  if (lowerCategory === 'update') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (lowerCategory === 'event') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (lowerCategory === 'community') return 'text-theme-primary bg-theme-primary/10 border-theme-primary/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
};

const fallbackNewsItems = [
  {
    id: 1,
    title: 'Server Update 2.1.5',
    category: 'Update',
    excerpt: 'Latest server update includes balance changes to the Hunter class and new dungeon rewards.',
    imageUrl: '/image/Web/Serverupdate.png',
  },
  {
    id: 2,
    title: 'Weekend XP Event',
    category: 'Event',
    excerpt: 'Join us for a special weekend XP boost! All characters will receive 2x experience points.',
    imageUrl: '/image/Web/xpevent.png',
  },
  {
    id: 3,
    title: 'Guild Wars Season 5',
    category: 'Community',
    excerpt: "Highlights from last week's epic Guild Wars event where Dragon Dynasty claimed victory.",
    imageUrl: '/image/Web/community.png',
  },
];

const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${weburl}/api/news?limit=3`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setNews(data.data);
        } else {
          setNews(
            fallbackNewsItems.map((item) => ({
              ...item,
              slug: `news-${item.id}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews(
          fallbackNewsItems.map((item) => ({
            ...item,
            slug: `news-${item.id}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className='py-16 bg-theme-background'>
      <div className='container mx-auto px-6'>
        <div className='flex justify-between items-end mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-theme-text mb-2'>Latest Updates</h2>
            <p className='text-theme-text-muted'>Stay informed with the latest news from Lafftale.</p>
          </div>
          <Button variant='ghost' className='text-theme-primary hover:text-theme-primary hover:bg-theme-primary/10'>
            View All <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>

        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-64 bg-theme-surface animate-pulse rounded-xl'></div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.slug}`} className='group block h-full'>
                <article className='h-full bg-theme-surface border border-theme-border rounded-xl overflow-hidden hover:border-theme-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col'>
                  <div className='relative h-48 overflow-hidden'>
                    <img
                      src={item.image?.startsWith('http') ? item.image : `${weburl}${item.image}`}
                      alt={item.title}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.svg')}
                    />
                    <div className='absolute top-3 left-3'>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 backdrop-blur-md ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className='p-6 flex-1 flex flex-col'>
                    <div className='flex items-center gap-2 mb-3 text-xs text-theme-text-muted'>
                      <Calendar size={12} />
                      {formatDate(item.created_at)}
                    </div>
                    <h3 className='text-xl font-bold text-theme-text mb-2 group-hover:text-theme-primary transition-colors'>
                      {item.title}
                    </h3>
                    <p className='text-theme-text-muted text-sm line-clamp-2 mb-4 flex-1'>{item.excerpt}</p>
                    <div className='text-theme-primary text-sm font-medium flex items-center gap-1 mt-auto group-hover:gap-2 transition-all'>
                      Read Article <ArrowRight size={14} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
