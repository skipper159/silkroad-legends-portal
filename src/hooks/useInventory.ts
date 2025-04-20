import { useState, useEffect } from 'react';
import type { InventoryItem } from '../types/inventory';

export function useInventory(characterId: number) {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetch(`/api/characters/${characterId}/inventory`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Fehler beim Abrufen des Inventars');
        }
        return response.json();
      })
      .then((data) => setItems(data))
      .catch((error) => console.error(error));
  }, [characterId]);

  return items;
}