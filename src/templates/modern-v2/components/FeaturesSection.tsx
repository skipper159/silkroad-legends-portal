import { Zap, Shield, Globe, Cpu } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    { icon: <Zap />, title: 'High Performance', desc: 'Optimized for 144hz gameplay' },
    { icon: <Shield />, title: 'Anti-Cheat', desc: 'Fair play guaranteed with custom protection' },
    { icon: <Globe />, title: 'Low Latency', desc: 'Global server locations for best ping' },
    { icon: <Cpu />, title: 'Modern Engine', desc: 'DirectX 9 optimized client' },
  ];

  return (
    <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6'>
      {features.map((f, i) => (
        <div key={i} className='bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-800 transition'>
          <div className='w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-200 mb-4'>
            {f.icon}
          </div>
          <h4 className='text-white font-bold mb-1'>{f.title}</h4>
          <p className='text-sm text-zinc-500'>{f.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesSection;
