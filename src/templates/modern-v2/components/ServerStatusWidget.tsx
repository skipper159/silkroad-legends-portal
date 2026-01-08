import { Users, Wifi, Clock, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

const ServerStatusWidget = () => {
  const [playersOnline, setPlayersOnline] = useState<number | null>(null);

  useEffect(() => {
    apiClient
      .getPlayersOnline()
      .then((res) => {
        if (res.data) setPlayersOnline(res.data.count ?? 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
      <div className='bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4'>
        <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-xl'>
          <Users size={24} />
        </div>
        <div>
          <p className='text-zinc-500 text-xs font-bold uppercase tracking-wider'>Players</p>
          <p className='text-2xl font-bold text-white'>{playersOnline ?? '...'}</p>
        </div>
      </div>

      <div className='bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4'>
        <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-xl'>
          <Activity size={24} />
        </div>
        <div>
          <p className='text-zinc-500 text-xs font-bold uppercase tracking-wider'>Status</p>
          <p className='text-2xl font-bold text-emerald-400'>Online</p>
        </div>
      </div>

      <div className='bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4'>
        <div className='p-3 bg-blue-500/10 text-blue-500 rounded-xl'>
          <Wifi size={24} />
        </div>
        <div>
          <p className='text-zinc-500 text-xs font-bold uppercase tracking-wider'>Ping</p>
          <p className='text-2xl font-bold text-white'>45ms</p>
        </div>
      </div>

      <div className='bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4'>
        <div className='p-3 bg-orange-500/10 text-orange-500 rounded-xl'>
          <Clock size={24} />
        </div>
        <div>
          <p className='text-zinc-500 text-xs font-bold uppercase tracking-wider'>Uptime</p>
          <p className='text-xl font-bold text-white'>24h 12m</p>
        </div>
      </div>
    </div>
  );
};

export default ServerStatusWidget;
