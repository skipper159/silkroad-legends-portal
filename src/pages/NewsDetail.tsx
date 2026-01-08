import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { weburl } from '@/lib/api';
import ActiveTemplate from '@/config/theme-config';
import ContentRenderer from '@/utils/contentRenderer';

const { Layout } = ActiveTemplate.components;

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  image?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  featured?: boolean;
  views?: number;
}

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${weburl}/api/news/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found');
          } else {
            setError('Error loading article');
          }
          return;
        }

        const data = await response.json();
        if (data.success) {
          setArticle(data.data);
        } else {
          setError(data.message || 'Error loading article');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Network error loading article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Update':
        return 'bg-blue-600';
      case 'Event':
        return 'bg-green-600';
      case 'Community':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <Layout>
        <main className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center py-16'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary'></div>
          </div>
        </main>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <main className='container mx-auto px-4 py-8'>
          <div className='text-center py-16'>
            <h1 className='text-4xl font-bold text-white mb-4'>Article not found</h1>
            <p className='text-theme-text-muted mb-8'>{error}</p>
            <Link to='/news'>
              <Button className='bg-theme-primary hover:bg-theme-primary/80 text-black'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to News
              </Button>
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className='container mx-auto px-4 py-8'>
        {/* Back to News Button */}
        <div className='mb-6'>
          <Link to='/news'>
            <Button variant='outline' className='border-theme-primary/30 text-theme-primary hover:bg-theme-primary/10'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to News
            </Button>
          </Link>
        </div>

        <article className='max-w-4xl mx-auto'>
          <Card className='bg-theme-background/60 border-theme-primary/30 backdrop-blur-sm'>
            <CardContent className='p-8'>
              {/* Category Badge */}
              <div className='mb-4'>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(
                    article.category
                  )}`}
                >
                  <Tag className='h-3 w-3 mr-1' />
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h1 className='text-3xl md:text-4xl font-bold text-white mb-6 leading-tight'>{article.title}</h1>

              {/* Meta Information */}
              <div className='flex flex-wrap items-center gap-6 text-theme-text-muted mb-8 pb-6 border-b border-theme-primary/20'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{formatDate(article.created_at)}</span>
                </div>

                {article.views && (
                  <div className='flex items-center gap-2'>
                    <Eye className='h-4 w-4' />
                    <span>{article.views} Aufrufe</span>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {article.image && (
                <div className='mb-8'>
                  <img
                    src={article.image.startsWith('http') ? article.image : `${weburl}${article.image}`}
                    alt={article.title}
                    className='w-full h-64 md:h-96 object-cover rounded-lg border border-theme-primary/20'
                  />
                </div>
              )}

              {/* Content */}
              <div className='prose prose-invert prose-lg max-w-none'>
                <ContentRenderer content={article.content} />
              </div>

              {/* Footer */}
              <div className='mt-12 pt-6 border-t border-theme-primary/20'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-theme-text-muted'>
                    Letzte Aktualisierung: {formatDate(article.updated_at)}
                  </div>

                  <Link to='/news'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-theme-primary/30 text-theme-primary hover:bg-theme-primary/10'
                    >
                      Weitere News
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
    </Layout>
  );
};

export default NewsDetail;
