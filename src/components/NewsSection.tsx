import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Award, Calendar, Users, Newspaper } from 'lucide-react';
import { weburl } from '@/lib/api';

// News Item Interface
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

// Get the appropriate icon for each category
const getCategoryIcon = (category: string) => {
  const lowerCategory = category?.toLowerCase();
  if (lowerCategory === 'update') return <Award className='h-5 w-5' />;
  if (lowerCategory === 'event') return <Calendar className='h-5 w-5' />;
  if (lowerCategory === 'community') return <Users className='h-5 w-5' />;
  return <Newspaper className='h-5 w-5' />;
};

// Fallback news items in case API fails
const fallbackNewsItems = [
  {
    id: 1,
    title: 'Server Update 2.1.5',
    date: 'April 5, 2025',
    category: 'Update',
    excerpt: 'Latest server update includes balance changes to the Hunter class and new dungeon rewards.',
    imageUrl: '/image/Web/Serverupdate.png',
  },
  {
    id: 2,
    title: 'Weekend XP Event',
    date: 'April 12-14, 2025',
    category: 'Event',
    excerpt: 'Join us for a special weekend XP boost! All characters will receive 2x experience points.',
    imageUrl: '/image/Web/xpevent.png',
  },
  {
    id: 3,
    title: 'Community Spotlight: GuildWars',
    date: 'March 28, 2025',
    category: 'Community',
    excerpt: "Highlights from last week's epic Guild Wars event where Dragon Dynasty claimed victory.",
    imageUrl: '/image/Web/community.png',
  },
];

const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch news from the API
    const fetchNews = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${weburl}/api/news?limit=3`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setNews(data.data);
        } else {
          // Fallback to static data if API fails or returns no data
          setNews(
            fallbackNewsItems.map((item) => ({
              id: item.id,
              title: item.title,
              slug: `news-${item.id}`,
              excerpt: item.excerpt,
              category: item.category,
              image: item.imageUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // Use fallback data if API fails
        setNews(
          fallbackNewsItems.map((item) => ({
            id: item.id,
            title: item.title,
            slug: `news-${item.id}`,
            excerpt: item.excerpt,
            category: item.category,
            image: item.imageUrl,
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

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        <h2 className='decorated-heading text-3xl md:text-4xl text-center'>News & Events</h2>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lafftale-gold'></div>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12'>
              {news.map((item) => (
                <article key={item.id} className='card overflow-hidden group'>
                  <div className='relative h-60 overflow-hidden mb-3'>
                    <img
                      src={item.image?.startsWith('http') ? item.image : `${weburl}${item.image}`}
                      alt={item.title}
                      className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                      onError={(e) => {
                        // Fallback image if loading fails
                        (e.target as HTMLImageElement).src = '/image/Web/news-placeholder.png';
                      }}
                    />
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                      <div className='flex items-center gap-2'>
                        <span className='bg-silkroad-crimson px-2 py-1 rounded text-xs font-bold flex items-center gap-1'>
                          {getCategoryIcon(item.category)} {item.category}
                        </span>
                        <span className='text-xs text-gray-300'>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className='text-xl font-bold mb-2 group-hover:text-silkroad-blue transition-colors'>
                    {item.title}
                  </h3>

                  <p className='text-gray-400 mb-4 line-clamp-2'>{item.excerpt}</p>

                  <Button variant='link' asChild className='p-0 text-silkroad-gold hover:text-silkroad-blue'>
                    <Link to={`/news/${item.slug}`}>Read More →</Link>
                  </Button>
                </article>
              ))}
            </div>

            <div className='text-center mt-10'>
              <Button asChild variant='outline' className='btn-outline'>
                <Link to='/news'>View All News</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
