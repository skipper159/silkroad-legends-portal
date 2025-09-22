import { useState, useEffect } from 'react';
import { fetchWithAuth, weburl } from '@/lib/api';

interface ItemPointsData {
  characterId: number;
  characterName: string;
  itemPoints: number;
}

export function useCharacterItemPoints(characterId: number | null) {
  const [itemPoints, setItemPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) {
      setItemPoints(0);
      return;
    }

    const fetchItemPoints = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth(`${weburl}/api/characters/${characterId}/itempoints`);

        if (!response.ok) {
          throw new Error('Error loading Item Points');
        }

        const data: ItemPointsData = await response.json();
        setItemPoints(data.itemPoints);
      } catch (err: any) {
        console.error('Error loading Item Points:', err);
        setError(err.message);
        setItemPoints(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemPoints();
  }, [characterId]);

  return { itemPoints, isLoading, error };
}
