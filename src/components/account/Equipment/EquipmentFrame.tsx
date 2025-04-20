import React from "react";

interface EquipmentFrameProps {
  horizontalRepeats: number;
  verticalRepeats: number;
}

export const EquipmentFrame: React.FC<EquipmentFrameProps> = ({
  horizontalRepeats,
  verticalRepeats,
}) => {
  return (
    <div className="w-full h-full pointer-events-none select-none">
      {/* Top Row */}
      <div className="flex w-full">
        <img src="/public/image/sro/interface/equipment/equip_window_left_up.png" alt="" />
        {Array.from({ length: horizontalRepeats }).map((_, i) => (
          <img key={`top-${i}`} src="/public/image/sro/interface/equipment/equip_window_mid_up.png" alt="" />
        ))}
        <img src="/public/image/sro/interface/equipment/equip_window_right_up.png" alt="" />
      </div>

      {/* Middle */}
      <div className="flex w-full">
        {/* Left Side */}
        <div className="flex flex-col">
          {Array.from({ length: verticalRepeats }).map((_, i) => (
            <img key={`left-${i}`} src="/public/image/sro/interface/equipment/equip_window_left_side.png" alt="" />
          ))}
        </div>

        <div className="flex-1" />

        {/* Right Side */}
        <div className="flex flex-col">
          {Array.from({ length: verticalRepeats }).map((_, i) => (
            <img key={`right-${i}`} src="/public/image/sro/interface/equipment/equip_window_right_side.png" alt="" />
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex w-full">
        <img src="/public/image/sro/interface/equipment/equip_window_left_down.png" alt="" />
        {Array.from({ length: horizontalRepeats }).map((_, i) => (
          <img key={`bottom-${i}`} src="/public/image/sro/interface/equipment/equip_window_mid_down.png" alt="" />
        ))}
        <img src="/public/image/sro/interface/equipment/equip_window_right_down.png" alt="" />
      </div>
    </div>
  );
};
