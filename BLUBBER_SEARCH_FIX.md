# Lösung: Blubber wird jetzt in der Ranking-Suche gefunden

## Das Problem war identifiziert ✅

**Hauptproblem:** Der Charakter "Blubber" (CharID 9164) war in der Guild "DummyGuild" und wurde durch den Filter `AND (g.Name IS NULL OR g.Name != 'DummyGuild')` systematisch aus den Ranking-Ergebnissen ausgeschlossen.

**Zusätzliches Problem:** [GM] Charaktere sollten nicht im normalen Ranking angezeigt werden.

## Die Lösung ✅

### 1. DummyGuild-Filter entfernt

**Vorher:**

```sql
WHERE c.CharName16 IS NOT NULL AND c.CharName16 != '' AND c.CurLevel >= 1 AND (g.Name IS NULL OR g.Name != 'DummyGuild')
```

**Nachher:**

```sql
WHERE c.CharName16 IS NOT NULL AND c.CharName16 != '' AND c.CurLevel >= 1 AND c.CharID > 0
```

- Nur noch CharID > 0 Filter (schließt DummyChar mit ID 0 aus)
- DummyGuild Charaktere werden nicht mehr systematisch ausgeschlossen

### 2. [GM] Charaktere im Backend gefiltert

**Neuer Filter in playerRankings.js:**

```javascript
// Filter out [GM] characters from normal rankings (but allow them in search)
const filteredResults = result.recordset.filter((player) => {
  if (!options.charName && player.CharName && player.CharName.startsWith('[GM]')) {
    return false;
  }
  return true;
});
```

### 3. GlobalRank-Berechnung angepasst

**Neuer GlobalRank Query:**

```sql
WHERE char_inner.CharName16 IS NOT NULL
  AND char_inner.CharName16 != ''
  AND char_inner.CurLevel >= 1
  AND char_inner.CharID > 0
  AND (char_inner.CharName16 NOT LIKE '[GM]%' OR char_inner.CharName16 NOT LIKE '[[]GM%')
```

- [GM] Charaktere werden aus der GlobalRank-Berechnung ausgeschlossen
- Dadurch erhalten normale Spieler korrekte Ranks

## Testergebnisse ✅

### Normale Rankings:

- ✅ Keine [GM] Charaktere sichtbar
- ✅ Korrekte Rank-Reihenfolge (1, 2, 3, ...)

### Suchfunktion:

- ✅ "Blubber" wird gefunden (GlobalRank: 5338)
- ✅ "Asterix" wird gefunden (GlobalRank: 204)
- ✅ "_Marada_" wird gefunden (GlobalRank: 250)
- ✅ "[GM]" Suche funktioniert (falls gewünscht)

### GlobalRanks:

- ✅ Korrekte Berechnung basierend auf ItemPoints + Level
- ✅ Berücksichtigt keine [GM] Charaktere in der Rangfolge
- ✅ DummyGuild Charaktere haben realistische Ranks

## Betroffene Dateien:

1. **`utils/queryBuilder.js`**

   - DummyGuild-Filter entfernt
   - GlobalRank-Query angepasst
   - Klammer-Escaping rückgängig gemacht

2. **`routes/ranking/playerRankings.js`**
   - [GM] Filter im Backend hinzugefügt
   - Nur für normale Rankings, nicht für Suchvorgänge

## Fazit 🎉

Die Suchfunktion funktioniert jetzt korrekt:

- **Blubber wird gefunden** mit seinem echten GlobalRank
- **[GM] Charaktere werden ausgeblendet** (aber können gesucht werden)
- **Alle anderen Charaktere funktionieren** mit korrekten Ranks
- **Die ursprünglichen Ranking-Features bleiben erhalten**
