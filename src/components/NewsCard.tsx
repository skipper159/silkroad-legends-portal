import { weburl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

// News Item Interface Definition
export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface NewsCardProps {
  news: NewsItem;
}

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'update':
      return 'bg-blue-600 text-white';
    case 'event':
      return 'bg-yellow-500 text-black';
    case 'community':
      return 'bg-green-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

const getCategoryIcon = (category: string) => {
  // Depending on category, different icons could be returned here
  return <Tag size={14} />;
};

export const NewsCard = ({ news }: NewsCardProps) => {
  // Format date as relative time (e.g., "3 days ago")
  const formattedDate = formatDistanceToNow(new Date(news.created_at), {
    addSuffix: true,
    locale: enUS,
  });

  return (
    <div className='bg-silkroad-dark/30 border border-silkroad-gold/20 rounded-lg overflow-hidden flex flex-col mb-6'>
      <div className='flex flex-col md:flex-row'>
        {/* Image Section */}
        {news.image && (
          <div className='w-full md:w-1/3 p-2'>
            <img
              src={news.image.startsWith('http') ? news.image : `${weburl}${news.image}`}
              alt={news.title}
              className='w-full h-40 object-cover rounded-lg'
              onError={(e) => {
                console.log('Image failed to load:', news.image);
                // If image fails to load, hide it
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content Section */}
        <div className={`w-full ${news.image ? 'md:w-2/3' : 'md:w-full'} p-4`}>
          <div className='flex justify-between items-start mb-2'>
            <h3 className='text-xl font-semibold text-lafftale-gold'>{news.title}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getCategoryColor(news.category)}`}
            >
              {getCategoryIcon(news.category)}
              {news.category}
            </span>
          </div>

          <div className='text-gray-400 text-xs mb-3 flex items-center'>
            <Calendar size={14} className='mr-1' />
            {formattedDate}
          </div>

          <p className='text-gray-300 text-sm mb-4'>{news.excerpt}</p>

          <Link to={`/news/${news.slug}`}>
            <Button className='btn-primary flex items-center gap-2' size='sm'>
              Read More
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
