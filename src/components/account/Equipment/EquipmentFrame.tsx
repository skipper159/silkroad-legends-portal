import React from 'react';
import { getInterfaceUrl } from '@/utils/assetUtils';

interface EquipmentFrameProps {
  horizontalRepeats: number;
  verticalRepeats: number;
}

export const EquipmentFrame: React.FC<EquipmentFrameProps> = ({ horizontalRepeats, verticalRepeats }) => {
  return (
    <div className='w-full h-full pointer-events-none select-none'>
      {/* Top Row */}
      <div className='flex w-full'>
        <img src={getInterfaceUrl('equipment', 'equip_window_left_up.PNG')} alt='' />
        {Array.from({ length: horizontalRepeats }).map((_, i) => (
          <img key={`top-${i}`} src={getInterfaceUrl('equipment', 'equip_window_mid_up.PNG')} alt='' />
        ))}
        <img src={getInterfaceUrl('equipment', 'equip_window_right_up.PNG')} alt='' />
      </div>

      {/* Middle */}
      <div className='flex w-full'>
        {/* Left Side */}
        <div className='flex flex-col'>
          {Array.from({ length: verticalRepeats }).map((_, i) => (
            <img key={`left-${i}`} src={getInterfaceUrl('equipment', 'equip_window_left_side.PNG')} alt='' />
          ))}
        </div>

        <div className='flex-1' />

        {/* Right Side */}
        <div className='flex flex-col'>
          {Array.from({ length: verticalRepeats }).map((_, i) => (
            <img key={`right-${i}`} src={getInterfaceUrl('equipment', 'equip_window_right_side.PNG')} alt='' />
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className='flex w-full'>
        <img src={getInterfaceUrl('equipment', 'equip_window_left_down.PNG')} alt='' />
        {Array.from({ length: horizontalRepeats }).map((_, i) => (
          <img key={`bottom-${i}`} src={getInterfaceUrl('equipment', 'equip_window_mid_down.PNG')} alt='' />
        ))}
        <img src={getInterfaceUrl('equipment', 'equip_window_right_down.PNG')} alt='' />
      </div>
    </div>
  );
};
