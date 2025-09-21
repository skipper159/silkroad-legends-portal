// utils/characterUtils.ts
import { getRaceIconUrl, getCharacterImageUrl, getJobIconUrl } from './assetUtils';

export interface RaceInfo {
  name: 'Chinese' | 'European';
  icon: string;
}

export const getRaceInfo = (refObjID: number): RaceInfo => {
  if (refObjID > 2000) {
    return {
      name: 'European',
      icon: getRaceIconUrl('europe'),
    };
  }
  return {
    name: 'Chinese',
    icon: getRaceIconUrl('china'),
  };
};

export const getCharacterImage = (charIcon: number, race: 'Chinese' | 'European'): string => {
  const racePrefix = race === 'Chinese' ? 'ch' : 'eu';

  // Determine gender based on CharIcon ranges (this is a simplified mapping)
  // In real SRO, the mapping is more complex
  const isWoman = charIcon >= 14; // Simplified - women usually have higher IDs
  const gender = isWoman ? 'f' : 'm';

  // Calculate character number (1-13)
  const charNumber = ((charIcon - 1) % 13) + 1;

  return getCharacterImageUrl(racePrefix as 'ch' | 'eu', gender, charNumber);
};

export const getJobIcon = (jobType: 'trader' | 'hunter' | 'thief'): string => {
  switch (jobType) {
    case 'trader':
      return getJobIconUrl('merchant');
    case 'hunter':
      return getJobIconUrl('hunter');
    case 'thief':
      return getJobIconUrl('thief');
    default:
      return getJobIconUrl('merchant');
  }
};
