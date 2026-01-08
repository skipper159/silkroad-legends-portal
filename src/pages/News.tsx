import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, AlertCircle, Calendar, Users, Award } from 'lucide-react';
import { weburl } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ActiveTemplate from '@/config/theme-config';

const { Layout } = ActiveTemplate.components;

// News Item Interface Definition - updated to match backend
interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  image?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  featured?: boolean;
  views?: number;
}

const getCategoryIcon = (category: string) => {
  const lowerCategory = category?.toLowerCase();
  if (lowerCategory === 'update') return <Award className='h-5 w-5' />;
  if (lowerCategory === 'event') return <Calendar className='h-5 w-5' />;
  if (lowerCategory === 'community') return <Users className='h-5 w-5' />;
  return <Newspaper className='h-5 w-5' />;
};

const getCategoryClass = (category: string) => {
  const lowerCategory = category?.toLowerCase();
  if (lowerCategory === 'update') return 'bg-blue-600';
  if (lowerCategory === 'event') return 'bg-theme-highlight text-theme-surface';
  if (lowerCategory === 'community') return 'bg-green-600';
  return 'bg-theme-accent';
};

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // Fetch news from the API
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all news
        const response = await fetch(`${weburl}/api/news`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setNews(data.data);
        } else {
          setNews([]);
          console.warn('No news available or unexpected API response format');
        }

        // Fetch categories
        const categoriesResponse = await fetch(`${weburl}/api/news/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success && Array.isArray(categoriesData.data)) {
            setCategories(categoriesData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filterNews = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') return;

    setLoading(true);
    fetch(`${weburl}/api/news?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNews(data.data);
        } else {
          setNews([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching category news:', err);
        setError('Failed to load news for this category');
        setLoading(false);
      });
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${ActiveTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
            News <span className='text-theme-accent font-cinzel text-4xl font-bold'>& Updates</span>
          </h1>
          <p className='text-lg max-w-2xl mx-auto mb-10 text-theme-text-muted'>
            Stay up to date with the latest updates, events and community news from Lafftale Silkroad Online.
          </p>
        </div>
      </div>
      <hr />

      <div className='container mx-auto px-4 py-10'>
        {/* Category Tabs */}
        <div className='flex justify-center mb-8'>
          <Tabs defaultValue='all' className='w-full' value={activeCategory} onValueChange={filterNews}>
            <TabsList className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              <TabsTrigger value='all' className='flex items-center gap-2'>
                <Newspaper size={16} />
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className='flex items-center gap-2'>
                  {getCategoryIcon(category)}
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* News Content Area */}
            <div className='mt-8'>
              {loading ? (
                <div className='flex justify-center items-center py-20'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary'></div>
                </div>
              ) : error ? (
                <div className='flex flex-col items-center py-20'>
                  <AlertCircle size={48} className='text-red-500 mb-4' />
                  <p className='text-center text-red-400'>{error}</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {news.length > 0 ? (
                    news.map((item, index) => (
                      <article
                        key={item.id}
                        className='card-gradient overflow-hidden group rounded-lg shadow-lg'
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        <div className='relative z-10'>
                          <div className='relative h-60 overflow-hidden mb-3 rounded-t-lg'>
                            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 group-hover:to-black/40 transition-all duration-500'></div>
                            <img
                              src={item.image?.startsWith('http') ? item.image : `${weburl}${item.image}`}
                              alt={item.title}
                              className='w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110'
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-20'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className={`${getCategoryClass(
                                    item.category
                                  )} px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-lg group-hover:shadow-[0_0_15px_rgba(var(--theme-highlight),0.4)] transition-shadow duration-300`}
                                >
                                  {getCategoryIcon(item.category)} {item.category}
                                </span>
                                <span className='text-xs text-theme-text-muted group-hover:text-theme-primary transition-colors duration-300'>
                                  {formatDate(item.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='p-4'>
                          <h3 className='text-xl font-bold mb-2 text-theme-primary group-hover:text-theme-accent transition-colors duration-300'>
                            {item.title}
                          </h3>

                          <p className='text-theme-text-muted mb-4 line-clamp-3 group-hover:text-theme-text transition-colors duration-300'>
                            {item.excerpt
                              ? item.excerpt
                              : item.content && typeof item.content === 'string'
                              ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
                              : 'No content available'}
                          </p>

                          <Button
                            variant='link'
                            asChild
                            className='p-0 text-theme-primary hover:text-theme-accent transition-colors duration-300'
                          >
                            <Link to={`/news/${item.slug}`}>Read More →</Link>
                          </Button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className='col-span-full text-center py-10'>
                      <p className='text-theme-text-muted'>
                        {activeCategory === 'all'
                          ? 'No news available.'
                          : `No news available in category "${activeCategory}".`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default News;
