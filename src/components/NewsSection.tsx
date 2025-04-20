
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Award } from "lucide-react";

const newsItems = [
  {
    id: 1,
    title: "Server Update 2.1.5",
    date: "April 5, 2025",
    category: "Updates",
    icon: <Award className="h-5 w-5" />,
    excerpt: "Latest server update includes balance changes to the Hunter class and new dungeon rewards.",
    imageUrl: "public/image/web/serverupdate.png"
  },
  {
    id: 2,
    title: "Weekend XP Event",
    date: "April 12-14, 2025",
    category: "Events",
    icon: <Calendar className="h-5 w-5" />,
    excerpt: "Join us for a special weekend XP boost! All characters will receive 2x experience points.",
    imageUrl: "public/image/web/xpevent.png"
  },
  {
    id: 3,
    title: "Community Spotlight: GuildWars",
    date: "March 28, 2025",
    category: "Community",
    icon: <Users className="h-5 w-5" />,
    excerpt: "Highlights from last week's epic Guild Wars event where Dragon Dynasty claimed victory.",
    imageUrl: "public/image/web/community.png"
  },
];

const NewsSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="decorated-heading text-3xl md:text-4xl text-center">
          Latest News & Events
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {newsItems.map((item) => (
            <article key={item.id} className="card overflow-hidden group">
              <div className="relative h-60 overflow-hidden mb-3">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-silkroad-crimson px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      {item.icon} {item.category}
                    </span>
                    <span className="text-xs text-gray-300">{item.date}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-silkroad-blue transition-colors">
                {item.title}
              </h3>
              
              <p className="text-gray-400 mb-4 line-clamp-2">
                {item.excerpt}
              </p>
              
              <Button variant="link" asChild className="p-0 text-silkroad-gold hover:text-silkroad-blue">
                <Link to={`/news/${item.id}`}>
                  Read More →
                </Link>
              </Button>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="btn-outline">
            <Link to="/news">View All News</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
