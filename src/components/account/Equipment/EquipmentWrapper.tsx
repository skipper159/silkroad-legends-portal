import React from "react";
import { EquipmentGrid } from "./EquipmentGrid";
import { EquipmentFrame } from "./Equipmentframe";

export const EquipmentWrapper: React.FC = () => {
    return (
      <div className="relative w-[216px] h-[400px] bg-black rounded">
        <div className="absolute inset-0 z-0">
          <EquipmentFrame horizontalRepeats={3} verticalRepeats={6} />
        </div>
        <div className="absolute inset-0 z-10">
          <div className="absolute left-[12px] top-[6px]">
            <EquipmentGrid side="left" equipment={selectedCharacter.equipment} />
          </div>
          <div className="absolute right-[12px] top-[6px]">
            <EquipmentGrid side="right" equipment={selectedCharacter.equipment} />
          </div>
        </div>
      </div>
    );
  };