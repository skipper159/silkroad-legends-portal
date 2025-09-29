# Asset Configuration Guide

## Wie Vite Assets serviert

### Development

- **Vite Dev Server**: `http://localhost:5173`
- **Asset-Pfad**: `public/assets/chars/char_ch_man1.png`
- **URL im Browser**: `http://localhost:5173/assets/chars/char_ch_man1.png`
- **Keine Konfiguration nötig** - Vite serviert `public/` Ordner automatisch von Root

### Production

```env
# Optional: Eigene Domain für Assets
VITE_ASSETS_weburl=https://yourdomain.com
# oder CDN
VITE_ASSETS_weburl=https://cdn.yourdomain.com
```

## Verwendung

Die `assetUtils.ts` behandelt automatisch Development vs. Production:

### Basis-URL

```typescript
import { getAssetUrl } from '@/utils/assetUtils';

const imageUrl = getAssetUrl('assets/chars/char_ch_man1.png');
// Development: /assets/chars/char_ch_man1.png (serviert von Vite)
// Production:  https://yourdomain.com/assets/chars/char_ch_man1.png
```

### Character-Portraits

```typescript
import { getCharacterImageUrl } from '@/utils/assetUtils';

const charUrl = getCharacterImageUrl('ch', 'm', 1);
// -> http://localhost:5173/assets/chars/char_ch_man1.png
```

### Race-Icons

```typescript
import { getRaceIconUrl } from '@/utils/assetUtils';

const raceUrl = getRaceIconUrl('china');
// -> http://localhost:5173/assets/race/china.png
```

### Job-Icons

```typescript
import { getJobIconUrl } from '@/utils/assetUtils';

const jobUrl = getJobIconUrl('hunter');
// -> http://localhost:5173/assets/job/hunter.png
```

### Item-Icons

```typescript
import { getItemIconUrl } from '@/utils/assetUtils';

const itemUrl = getItemIconUrl('china', 'sword_01.png');
// -> http://localhost:5173/assets/items/china/sword_01.png
```

### UI-Elemente

```typescript
import { getUIElementUrl } from '@/utils/assetUtils';

const uiUrl = getUIElementUrl('inventory_bg.png');
// -> http://localhost:5173/assets/ui/inventory_bg.png
```

## Asset-Struktur

```
public/assets/
├── chars/           # Character-Portraits (52 Dateien)
│   ├── char_ch_man1.png
│   ├── char_ch_woman1.png
│   ├── char_eu_man1.png
│   └── char_eu_woman1.png
├── race/            # Race-Icons (2 Dateien)
│   ├── china.png
│   └── europe.png
├── job/             # Job-Icons (4 Dateien)
│   ├── hunter.png
│   ├── merchant.png
│   ├── thief.png
│   └── trader.png
├── items/           # Item-Icons (5.654 Dateien)
│   ├── china/
│   ├── europe/
│   ├── common/
│   ├── etc/
│   ├── avatar/
│   ├── fort/
│   ├── package/
│   └── trade/
└── ui/              # UI-Elemente (11 Dateien)
    ├── inventory_bg.png
    ├── inventoryDiv_bg.png
    ├── accessory_bg.png
    ├── icon_default.png
    └── icon_*.png
```

## Environment Switching

### Development (Automatisch)

- **Vite Dev Server**: Serviert `public/` Ordner automatisch von Root-URL
- **Keine Konfiguration nötig**: `/assets/chars/file.png` funktioniert direkt
- **Hot Reload**: Änderungen an Assets werden sofort sichtbar

### Production

- **Option 1 - Gleiche Domain**: Assets im gleichen Server-Root
- **Option 2 - CDN**: `VITE_ASSETS_weburl=https://cdn.yourdomain.com`
- **Option 3 - Subdomain**: `VITE_ASSETS_weburl=https://assets.yourdomain.com`

## Deployment-Anweisungen

1. **Development starten:**

   ```bash
   npm run dev
   # Assets automatisch verfügbar unter http://localhost:5173/assets/
   ```

2. **Production Build:**

   ```bash
   # Optional: .env für Production anpassen
   # VITE_ASSETS_weburl=https://yourdomain.com

   npm run build
   # Kopiert public/ Ordner in dist/
   ```

3. **Server-Upload:**

   ```bash
   # Gesamten dist/ Ordner auf Server
   # Oder nur assets/ in separaten CDN-Server
   rsync -av dist/ user@server:/var/www/html/
   ```

4. **Nginx Beispiel-Konfiguration:**
   ```nginx
   # Assets mit Cache ausliefern
   location /assets/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
       try_files $uri =404;
   }
   ```
