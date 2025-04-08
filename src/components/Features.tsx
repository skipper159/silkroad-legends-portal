
import { Award, Calendar, Shield, Coins, Users } from "lucide-react";

const featuresData = [
  {
    icon: <Award className="h-10 w-10 text-silkroad-gold" />,
    title: "Level Cap 110",
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
    <section className="py-20 bg-silkroad-dark/80">
      <div className="container mx-auto px-4">
        <h2 className="decorated-heading text-3xl md:text-4xl text-center">
          Server Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {featuresData.map((feature, index) => (
            <div 
              key={index} 
              className="card hover:border-silkroad-gold/40 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-silkroad-darkgray border border-silkroad-gold/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
