# Theme Migration - Vollständige Aufgabenliste

## 🎯 Ziel

**Jede einzelne Seite** und **jedes Komponente** soll die dynamischen `theme-*` Tailwind-Klassen verwenden, damit das Farbschema über das Admin Dashboard anpassbar ist.

---

## ✅ Bereits migriert

### Modern V2 Template

- [x] `Sidebar.tsx`
- [x] `Header.tsx`
- [x] `HeroSection.tsx`
- [x] `Layout.tsx`
- [x] `NewsSection.tsx`
- [x] `Footer.tsx`

---

## 🔴 Was noch fehlt

### 1. Seiten (`src/pages/`) - 20 Dateien

| Datei                        | Priorität  | Problem                         |
| ---------------------------- | ---------- | ------------------------------- |
| `Login.tsx`                  | ✅ Fertig  | Card nutzt --theme-card-\* Vars |
| `Register.tsx`               | ✅ Fertig  | Card nutzt --theme-card-\* Vars |
| `Account.tsx`                | ✅ Fertig  | Tabs, Cards, Dialogs migriert   |
| `AdminDashboard.tsx`         | ✅ Fertig  | Tabs, Cards komplett migriert   |
| `Rankings.tsx`               | ✅ Fertig  | Header, Main migriert           |
| `News.tsx`                   | ✅ Fertig  | Cards, Loader, Text migriert    |
| `NewsDetail.tsx`             | 🟡 Mittel  | Article-Styling                 |
| `Download.tsx`               | 🟡 Mittel  | Download-Cards                  |
| `ServerInfo.tsx`             | 🟡 Mittel  | Info-Cards, Stats-Boxen         |
| `Guide.tsx`                  | 🟢 Niedrig | Guide-Karten                    |
| `BeginnerGuide.tsx`          | 🟢 Niedrig | Accordion-Styling               |
| `ServerGuide.tsx`            | 🟢 Niedrig | Accordion-Styling               |
| `ForgotPassword.tsx`         | 🟢 Niedrig | Form-Card                       |
| `ResetPassword.tsx`          | 🟢 Niedrig | Form-Card                       |
| `VerifyEmail.tsx`            | 🟢 Niedrig | Status-Card                     |
| `ResendVerification.tsx`     | 🟢 Niedrig | Form-Card                       |
| `ConfirmAccountDeletion.tsx` | 🟢 Niedrig | Warning-Card                    |
| `NotFound.tsx`               | 🟢 Niedrig | 404-Layout                      |
| `PrivacyPolicy.tsx`          | 🟢 Niedrig | Legal-Text                      |
| `Index.tsx`                  | ✅         | Nutzt Modern V2 Sections        |

---

### 2. Haupt-Komponenten (`src/components/`) - 16 Dateien

| Datei                       | Was muss gemacht werden               |
| --------------------------- | ------------------------------------- |
| `CookieBanner.tsx`          | ✅ Migriert zu theme-\* Klassen       |
| `CookieSettingsModal.tsx`   | 🔴 Modal-Background, Buttons          |
| `GrandOpeningModal.tsx`     | 🔴 Modal-Styling, Gold-Farben         |
| `GlobalEventModal.tsx`      | 🔴 Modal-Styling                      |
| `TwoFactorModal.tsx`        | 🟡 Modal-Background                   |
| `CharacterOverview.tsx`     | 🔴 **30KB!** Viele Cards, Tabs, Stats |
| `GuildOverview.tsx`         | 🔴 Member-Liste, Stats-Cards          |
| `DownloadSection.tsx`       | 🟡 Download-Buttons, Cards            |
| `ServerOverview.tsx`        | 🟡 Server-Stats, Status-Anzeigen      |
| `NewsCard.tsx`              | 🟡 Card-Styling                       |
| `NewsSection.tsx`           | 🟡 News-Grid                          |
| `Features.tsx`              | 🟢 Feature-Cards                      |
| `Hero.tsx`                  | 🟢 Hero-Styling                       |
| `JobAnalyticsDashboard.tsx` | 🟡 Charts, Tabellen                   |
| `AdvancedJobFilter.tsx`     | 🟡 Filter-Buttons                     |
| `CharacterInventory.tsx`    | 🟢 Inventory-Grid                     |

---

### 3. Rankings (`src/components/Rankings/`) - 12 Tabellen-Komponenten

**Das größte Problem:** Tabellen verwenden alle `bg-lafftale-*` und `border-lafftale-*`

| Datei                      | Status                      |
| -------------------------- | --------------------------- |
| `RankingTabs.tsx`          | ✅ Migriert zu theme-\*     |
| `RankingPagination.tsx`    | 🔴 Pagination-Buttons       |
| `TopPlayerRanking.tsx`     | ✅ Migriert zu theme-\*     |
| `TopGuildRanking.tsx`      | 🔴 Top3-Cards               |
| `HonorRankingTable.tsx`    | 🔴 Tabellen-Headers, Zeilen |
| `PvPRankingTable.tsx`      | 🔴 Tabellen-Headers, Zeilen |
| `ItemRankingTable.tsx`     | 🔴 Tabellen-Headers, Zeilen |
| `UniqueRankingTable.tsx`   | 🔴 Tabellen-Headers, Zeilen |
| `FortressRankingTable.tsx` | 🔴 Tabellen-Headers, Zeilen |
| `JobRankingsTable.tsx`     | 🔴 Tabellen-Headers, Zeilen |
| `JobKDRankingTable.tsx`    | 🔴 Tabellen-Headers, Zeilen |
| `JobRankingsContainer.tsx` | 🟡 Container-Styling        |

---

### 4. Account-Komponenten (`src/components/account/`) - 10 Dateien

| Datei                    | Status                         |
| ------------------------ | ------------------------------ |
| `GameAccountManager.tsx` | 🔴 Account-Cards, Tabellen     |
| `CharacterOverview.tsx`  | 🔴 Character-Stats, Equipment  |
| `CharacterInventory.tsx` | 🔴 Item-Grid                   |
| `TwoFactorSetup.tsx`     | 🔴 Setup-Wizard                |
| `SupportTickets.tsx`     | 🔴 Ticket-Liste, Status-Badges |
| `UserReferrals.tsx`      | 🔴 Referral-Stats, Tabellen    |
| `UserVoting.tsx`         | 🔴 Vote-Buttons, Cooldowns     |
| `UserVouchers.tsx`       | 🔴 Voucher-Cards               |
| `DonateSilkMall.tsx`     | 🔴 Payment-UI                  |
| `AccountWebSettings.tsx` | 🔴 Settings-Form               |

---

### 5. Admin Dashboard (`src/components/admin/`) - 17 Dateien

⚠️ **Das Admin Dashboard wurde komplett ignoriert!**

| Datei                     | Größe  | Problem                            |
| ------------------------- | ------ | ---------------------------------- |
| `ReferralManager.tsx`     | 112KB! | Riesige Komponente, viele Tabellen |
| `SilkAdminPanel.tsx`      | 21KB   | Silk-Statistiken, Charts           |
| `VotesManager.tsx`        | 18KB   | Vote-Tabellen                      |
| `NewsManager.tsx`         | 17KB   | News-Liste, Editor                 |
| `PagesManager.tsx`        | 17KB   | Page-Editor                        |
| `VoucherManager.tsx`      | 16KB   | Voucher-Tabellen                   |
| `WebAccountsList.tsx`     | 15KB   | User-Tabelle                       |
| `TicketSystem.tsx`        | 15KB   | Ticket-Tabelle                     |
| `SilkDashboardWidget.tsx` | 13KB   | Dashboard-Cards                    |
| `DownloadsManager.tsx`    | 13KB   | File-Liste                         |
| `SettingsManager.tsx`     | 12KB   | Settings-Forms                     |
| `CronJobManager.tsx`      | 12KB   | Cron-Tabelle                       |
| `GameAccountsList.tsx`    | 11KB   | Game-Accounts                      |
| `FooterLinksManager.tsx`  | 24KB   | Link-Manager                       |
| `ImageUpload.tsx`         | 8KB    | Upload-UI                          |
| `SearchBar.tsx`           | 2KB    | Search-Input                       |

---

### 6. Legal (`src/components/Legal/`) - 3 Dateien

| Datei                | Status        |
| -------------------- | ------------- |
| `ServerRules.tsx`    | 🟢 Legal-Text |
| `TermsOfService.tsx` | 🟢 Legal-Text |
| `Impressum.tsx`      | 🟢 Legal-Text |

---

### 7. UI Components (`src/components/ui/`) - 49 Dateien

❓ **Frage:** Sollen die shadcn/ui Basiskomponenten auch Theme-Farben verwenden?

- `button.tsx` - Standardfarben?
- `card.tsx` - Card-Background?
- `table.tsx` - Tabellen-Styling?
- `tabs.tsx` - Tab-Farben?
- `input.tsx` - Border-Farben?

---

## 📋 Migrations-Strategie

### Phase 1: Basis-UI-Komponenten (Optional aber empfohlen)

Wenn `src/components/ui/` geändert wird, kaskadieren die Änderungen automatisch.

### Phase 2: Auth-Seiten

Login, Register, Password-Reset → Konsistenter erster Eindruck

### Phase 3: Haupt-Seiten

Account, Rankings, News → Meistbesuchte Seiten

### Phase 4: Admin Dashboard

Komplettes Admin-Styling → Backend einheitlich

### Phase 5: Modals & Overlays

Cookie, Event, 2FA → Popups einheitlich

### Phase 6: Rest

Guides, Legal, etc.

---

## 🎨 Farb-Mapping Referenz

| Alt                       | Neu                            |
| ------------------------- | ------------------------------ |
| `bg-lafftale-dark`        | `bg-theme-background`          |
| `bg-lafftale-darkgray`    | `bg-theme-surface`             |
| `text-lafftale-gold`      | `text-theme-primary`           |
| `border-lafftale-gold/30` | `border-theme-border`          |
| `text-gray-400`           | `text-theme-text-muted`        |
| `text-white`              | `text-theme-text`              |
| `bg-emerald-500`          | `bg-theme-primary`             |
| `text-emerald-500`        | `text-theme-primary`           |
| `hover:bg-emerald-600`    | `hover:bg-theme-primary-hover` |
| `bg-zinc-900`             | `bg-theme-surface`             |
| `border-zinc-800`         | `border-theme-border`          |

---

## 🆕 Phase 7: Extended Branding & Assets

### 7.1 Site Branding

| Feature        | Status | Beschreibung                       |
| -------------- | ------ | ---------------------------------- |
| Site Name      | ✅     | Dynamisch in Sidebar/Footer/Header |
| Logo Upload    | ✅     | Upload Button mit onClick-Ref      |
| Favicon Upload | ✅     | Upload Button mit onClick-Ref      |

### 7.2 Background Images

| Feature             | Status | Beschreibung             |
| ------------------- | ------ | ------------------------ |
| Login Background    | ✅     | Upload + Opacity/Overlay |
| Register Background | ✅     | Upload + Opacity/Overlay |
| Hero Background     | ✅     | Upload + Opacity/Overlay |
| Page Background     | ✅     | Upload + Opacity/Overlay |
| Overlay Settings    | ✅     | Color + Opacity Sliders  |

### 7.3 Text Customization

| Feature              | Status | Beschreibung             |
| -------------------- | ------ | ------------------------ |
| Hero Title           | ✅     | Dynamisch in HeroSection |
| Hero Subtitle        | ✅     | Dynamisch in HeroSection |
| Hero CTA Button Text | ✅     | Dynamisch in HeroSection |
| Footer Copyright     | ✅     | Dynamisch in Footer      |
| Footer About Text    | ✅     | Dynamisch in Footer      |

### 7.4 Links & SEO

| Feature         | Status | Beschreibung                     |
| --------------- | ------ | -------------------------------- |
| Social Links    | ✅     | Discord/Facebook/Twitter/YouTube |
| Download URL    | ✅     | ThemeContext aktualisiert        |
| SEO Title       | ✅     | ThemeContext aktualisiert        |
| SEO Description | ✅     | ThemeContext aktualisiert        |

### 7.5 Theme Settings - Typography (NEW)

| Feature    | Status | Beschreibung                  |
| ---------- | ------ | ----------------------------- |
| Font Color | ✅     | Text/TextMuted/Primary/Accent |

---

## 📊 Zusammenfassung

| Kategorie          | Dateien   | Status                |
| ------------------ | --------- | --------------------- |
| Modern V2 Template | 6         | ✅ Fertig             |
| Seiten             | 20        | ✅ 3 fertig           |
| Haupt-Komponenten  | 16        | ✅ 1 fertig           |
| Rankings           | 12        | ✅ 2 fertig           |
| Account            | 10        | 🔴 0 fertig           |
| Admin              | 17        | 🔴 0 fertig           |
| Legal              | 3         | 🟡 Optional           |
| UI Basis           | 49        | ❓ Entscheidung nötig |
| Extended Branding  | 16        | 🔴 0 fertig           |
| **GESAMT**         | **~145+** | -                     |
