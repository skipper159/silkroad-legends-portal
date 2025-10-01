
import { Award, Calendar, Shield, Coins, Users } from "lucide-react";

const featuresData = [
  {
    icon: <Award className="h-10 w-10 text-silkroad-gold" />,
    title: "Level Cap 100",
    description: "Progress further than ever with our extended level cap and challenging content."
  },
  {
    icon: <Coins className="h-10 w-10 text-silkroad-gold" />,
    title: "Free Silk on Registration",
    description: "Begin your adventure with free premium currency to customize your experience."
  },
  {
    icon: <Calendar className="h-10 w-10 text-silkroad-gold" />,
    title: "Daily Events",
    description: "New challenges and rewards every day keep the adventure fresh and exciting."
  },
  {
    icon: <Coins className="h-10 w-10 text-silkroad-gold" />,
    title: "Play2Win Economy",
    description: "Our balanced economy ensures that dedication and skill are always rewarded."
  },
  {
    icon: <Shield className="h-10 w-10 text-silkroad-gold" />,
    title: "Active GM Support",
    description: "Our team of game masters provide 24/7 support for all your needs."
  },
  {
    icon: <Users className="h-10 w-10 text-silkroad-gold" />,
    title: "Thriving Community",
    description: "Join thousands of players in our active and friendly community."
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-black/20">
      <div className="container mx-auto px-4">
        <h2 className="decorated-heading text-3xl md:text-4xl text-center">
          Server Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {featuresData.map((feature, index) => (
            <div 
              key={index} 
              className="card-gradient text-center rounded-lg p-6 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-lafftale-gold/20 to-lafftale-bronze/10 rounded-full group-hover:from-lafftale-gold/30 group-hover:to-lafftale-bronze/20 transition-all duration-300 group-hover:animate-icon-float group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-lafftale-gold group-hover:text-lafftale-bronze transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
