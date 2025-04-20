import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useInventory } from '../hooks/useInventory';
import type { CharacterOverviewProps as CharacterInventoryProps } from '../types/inventory';
import styles from '../styles/Inventory.module.css';

/**
 * CharacterInventory-Komponente zeigt das Inventar eines Charakters im Silkroad-Stil.
 * @param characterId - ID des Charakters, dessen Items angezeigt werden sollen
 */
export default function CharacterInventory({ characterId }: CharacterInventoryProps) {
  const items = useInventory(characterId);

  return (
    <div className={styles.inventory}>
      {items.map(item => (
        <div className={styles.slot} key={item.id}>
          <Tippy
            content={
              <div>
                <h4>{item.name}</h4>
                <ul>
                  {Object.entries(item.stats).map(([k, v]) => (
                    <li key={k}>{k}: {v}</li>
                  ))}
                </ul>
              </div>
            }
            animation="scale"
            duration={200}
          >
            <img src={item.icon} alt={item.name} />
          </Tippy>
        </div>
      ))}
    </div>
  );
}
