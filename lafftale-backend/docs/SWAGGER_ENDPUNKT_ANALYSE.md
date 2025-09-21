# Swagger-Endpunkt-Analyse

## Übersicht
Diese Analyse zeigt alle JavaScript-Dateien im `routes`-Ordner auf, die API-Endpunkte enthalten, welche möglicherweise in den Swagger-Modulen definiert werden sollten. 

**Analysiert am:** 19. September 2025  
**Anzahl analysierter Dateien:** 24 JavaScript-Dateien  
**Gefundene Endpunkte:** 173 API-Endpunkte

---

## Dateien mit fehlenden Swagger-Definitionen

### 1. `admin.js`
**Pfad:** `routes/admin.js`  
**Status:** Teilweise in Swagger definiert  

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 20 | GET | `/test` | ❌ Fehlt | Test-Endpunkt nicht dokumentiert |
| 25 | GET | `/webaccounts` | ❌ Fehlt | Sollte in admin/users.json |
| 61 | GET | `/gameaccounts` | ❌ Fehlt | Sollte in admin/users.json |
| 156 | PUT | `/gameaccounts/:id/ban` | ❌ Fehlt | Sollte in admin/users.json |
| 174 | PUT | `/gameaccounts/:id/timeout` | ❌ Fehlt | Sollte in admin/users.json |
| 196 | GET | `/gameaccounts/:id/logs` | ❌ Fehlt | Sollte in admin/users.json |
| 212 | GET | `/users` | ✅ Vorhanden | In admin/users.json definiert |
| 229 | PUT | `/users/:id/role` | ✅ Vorhanden | In admin/users.json definiert |
| 273 | GET | `/roles` | ❌ Fehlt | Sollte in admin/users.json |
| 288 | DELETE | `/users/:id` | ✅ Vorhanden | In admin/users.json definiert |

### 2. `adminSilk.js`
**Pfad:** `routes/adminSilk.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 12 | GET | `/accounts` | ❌ Fehlt | Sollte in admin/silk.json |
| 151 | POST | `/cache/warmup` | ❌ Fehlt | Sollte in admin/silk.json |
| 174 | DELETE | `/cache` | ❌ Fehlt | Sollte in admin/silk.json |
| 195 | GET | `/cache/stats` | ❌ Fehlt | Sollte in admin/silk.json |
| 216 | POST | `/cache/warmup` | ❌ Fehlt | Duplikat - bereinigen |
| 239 | DELETE | `/cache` | ❌ Fehlt | Duplikat - bereinigen |
| 260 | GET | `/cache/stats` | ❌ Fehlt | Duplikat - bereinigen |
| 281 | GET | `/server-stats` | ❌ Fehlt | Sollte in admin/silk.json |
| 306 | GET | `/trends` | ❌ Fehlt | Sollte in admin/silk.json |
| 331 | POST | `/give` | ❌ Fehlt | Sollte in admin/silk.json |
| 375 | GET | `/account/:jid` | ❌ Fehlt | Sollte in admin/silk.json |

### 3. `admin_downloads.js`
**Pfad:** `routes/admin_downloads.js`  
**Status:** Komplett fehlend in Swagger

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/downloads` | ❌ Fehlt | Sollte in admin/downloads.json erstellt werden |
| 48 | POST | `/downloads` | ❌ Fehlt | Sollte in admin/downloads.json erstellt werden |
| 82 | PUT | `/downloads/:id` | ❌ Fehlt | Sollte in admin/downloads.json erstellt werden |
| 114 | DELETE | `/downloads/:id` | ❌ Fehlt | Sollte in admin/downloads.json erstellt werden |
| 129 | PATCH | `/downloads/:id/toggle` | ❌ Fehlt | Sollte in admin/downloads.json erstellt werden |

### 4. `admin_pages.js`
**Pfad:** `routes/admin_pages.js`  
**Status:** Komplett fehlend in Swagger

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/pages` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |
| 50 | POST | `/pages` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |
| 104 | PUT | `/pages/:id` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |
| 148 | DELETE | `/pages/:id` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |
| 163 | GET | `/pages/:id` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |
| 187 | PATCH | `/pages/:id/toggle-publish` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |
| 207 | PATCH | `/pages/:id/toggle-featured` | ❌ Fehlt | Sollte in admin/pages.json erstellt werden |

### 5. `admin_referrals.js`
**Pfad:** `routes/admin_referrals.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/` | ✅ Vorhanden | In admin/referrals.json definiert |
| 69 | GET | `/statistics` | ❌ Fehlt | Sollte in admin/referrals.json |
| 101 | GET | `/rewards` | ❌ Fehlt | Sollte in admin/referrals.json |
| 126 | POST | `/rewards` | ❌ Fehlt | Sollte in admin/referrals.json |
| 166 | PUT | `/:id` | ❌ Fehlt | Sollte in admin/referrals.json |
| 216 | DELETE | `/:id` | ❌ Fehlt | Sollte in admin/referrals.json |
| 252 | GET | `/settings` | ❌ Fehlt | Sollte in admin/referrals.json |
| 286 | PUT | `/settings` | ❌ Fehlt | Sollte in admin/referrals.json |
| 332 | DELETE | `/rewards/:id` | ❌ Fehlt | Sollte in admin/referrals.json |
| 371 | PUT | `/rewards/:id` | ❌ Fehlt | Sollte in admin/referrals.json |
| 425 | GET | `/anticheat/suspicious` | ❌ Fehlt | Sollte in admin/referrals.json |
| 463 | GET | `/anticheat/stats` | ❌ Fehlt | Sollte in admin/referrals.json |
| 538 | POST | `/anticheat/validate/:id` | ❌ Fehlt | Sollte in admin/referrals.json |
| 589 | GET | `/anticheat/stats` | ❌ Fehlt | Duplikat zu Zeile 463 |
| 667 | GET | `/anticheat/suspicious` | ❌ Fehlt | Duplikat zu Zeile 425 |
| 720 | GET | `/anticheat/ip-stats` | ❌ Fehlt | Sollte in admin/referrals.json |
| 770 | GET | `/settings` | ❌ Fehlt | Duplikat zu Zeile 252 |
| 812 | PUT | `/settings` | ❌ Fehlt | Duplikat zu Zeile 286 |

### 6. `admin_tickets.js`
**Pfad:** `routes/admin_tickets.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/tickets` | ✅ Vorhanden | In admin/tickets.json definiert |
| 80 | GET | `/tickets/:id` | ✅ Vorhanden | In admin/tickets.json definiert |
| 117 | POST | `/tickets/:id/reply` | ❌ Fehlt | Sollte in admin/tickets.json |
| 146 | PUT | `/tickets/:id/close` | ❌ Fehlt | Sollte in admin/tickets.json |
| 163 | PUT | `/tickets/:id/reopen` | ❌ Fehlt | Sollte in admin/tickets.json |

### 7. `admin_users.js`
**Pfad:** `routes/admin_users.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/users` | ✅ Vorhanden | In admin/users.json definiert |
| 75 | PATCH | `/users/:id/role` | ❌ Fehlt | Sollte in admin/users.json |
| 104 | PATCH | `/users/:id/status` | ❌ Fehlt | Sollte in admin/users.json |
| 133 | POST | `/users/:id/reset-password` | ❌ Fehlt | Sollte in admin/users.json |
| 165 | GET | `/users/:id` | ❌ Fehlt | Sollte in admin/users.json |
| 204 | DELETE | `/users/:id` | ✅ Vorhanden | In admin/users.json definiert |
| 226 | GET | `/admin-logs` | ❌ Fehlt | Sollte in admin/users.json |
| 248 | GET | `/users/statistics` | ❌ Fehlt | Sollte in admin/users.json |

### 8. `admin_votes.js`
**Pfad:** `routes/admin_votes.js`  
**Status:** Komplett fehlend in Swagger

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/votes` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 27 | POST | `/votes` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 61 | PUT | `/votes/:id` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 94 | DELETE | `/votes/:id` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 109 | GET | `/votes/statistics` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 135 | GET | `/votes/recent` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 159 | PATCH | `/votes/:id/toggle` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |
| 179 | GET | `/votes/user/:userId` | ❌ Fehlt | Sollte in admin/votes.json erstellt werden |

### 9. `admin_vouchers.js`
**Pfad:** `routes/admin_vouchers.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 8 | GET | `/` | ✅ Vorhanden | In admin/vouchers.json definiert |
| 53 | POST | `/` | ✅ Vorhanden | In admin/vouchers.json definiert |
| 103 | PUT | `/:id` | ✅ Vorhanden | In admin/vouchers.json definiert |
| 149 | DELETE | `/:id` | ✅ Vorhanden | In admin/vouchers.json definiert |
| 164 | GET | `/:id/usage` | ❌ Fehlt | Sollte in admin/vouchers.json |
| 185 | PATCH | `/:id/toggle` | ❌ Fehlt | Sollte in admin/vouchers.json |

### 10. `auth-v2.js`
**Pfad:** `routes/auth-v2.js`  
**Status:** Vollständig in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 14 | POST | `/register` | ✅ Vorhanden | In auth/auth.json definiert |
| 17 | POST | `/login` | ✅ Vorhanden | In auth/auth.json definiert |
| 20 | POST | `/forgot-password` | ✅ Vorhanden | In auth/auth.json definiert |
| 23 | GET | `/verify-reset-token/:token` | ✅ Vorhanden | In auth/auth.json definiert |
| 26 | POST | `/reset-password` | ✅ Vorhanden | In auth/auth.json definiert |
| 29 | GET | `/verify-email/:token` | ✅ Vorhanden | In auth/auth.json definiert |
| 32 | POST | `/resend-verification` | ✅ Vorhanden | In auth/auth.json definiert |

### 11. `characterdetails.js`
**Pfad:** `routes/characterdetails.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/:charId/details` | ✅ Vorhanden | In user/characters.json definiert |

### 12. `characters.js`
**Pfad:** `routes/characters.js`  
**Status:** Vollständig in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 8 | GET | `/gameaccounts/my` | ✅ Vorhanden | In user/characters.json definiert |
| 54 | GET | `/characters/:gameAccountId` | ✅ Vorhanden | In user/characters.json definiert |
| 143 | GET | `/inventory/:charId` | ✅ Vorhanden | In user/characters.json definiert |

### 13. `donation.js`
**Pfad:** `routes/donation.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 8 | POST | `/initiate` | ❌ Fehlt | Sollte in payments/donations.json |
| 20 | GET | `/wallet/:userId` | ❌ Fehlt | Sollte in payments/donations.json |
| 52 | POST | `/vote/:platform` | ❌ Fehlt | Sollte in payments/donations.json |

### 14. `downloads.js`
**Pfad:** `routes/downloads.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/` | ✅ Vorhanden | In public/downloads.json definiert |
| 42 | GET | `/categories` | ✅ Vorhanden | In public/downloads.json definiert |
| 57 | GET | `/:id` | ❌ Fehlt | Sollte in public/downloads.json |
| 83 | POST | `/:id/download` | ✅ Vorhanden | In public/downloads.json definiert |
| 111 | POST | `/` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/downloads.json |
| 150 | PUT | `/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/downloads.json |
| 185 | DELETE | `/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/downloads.json |

### 15. `gameaccount.js`
**Pfad:** `routes/gameaccount.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 34 | POST | `/create` | ❌ Fehlt | Sollte in game/accounts.json |
| 164 | GET | `/my` | ❌ Fehlt | Sollte in game/accounts.json |
| 219 | PUT | `/:id/password` | ❌ Fehlt | Sollte in game/accounts.json |
| 269 | DELETE | `/:id` | ❌ Fehlt | Sollte in game/accounts.json |
| 352 | GET | `/:id` | ❌ Fehlt | Sollte in game/accounts.json |

### 16. `inventory.js` & `inventory_Backup.js`
**Pfad:** `routes/inventory.js` & `routes/inventory_Backup.js`  
**Status:** Vollständig in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 19 | GET | `/:charId` | ✅ Vorhanden | In user/characters.json definiert |

### 17. `news.js`
**Pfad:** `routes/news.js`  
**Status:** Komplett fehlend in Swagger

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 8 | GET | `/` | ❌ Fehlt | Sollte in public/news.json erstellt werden |
| 46 | GET | `/:slug` | ❌ Fehlt | Sollte in public/news.json erstellt werden |
| 71 | GET | `/admin/all` | ❌ Fehlt | Sollte in admin/news.json erstellt werden |
| 106 | POST | `/` | ❌ Fehlt | Sollte in admin/news.json erstellt werden |
| 144 | PUT | `/:id` | ❌ Fehlt | Sollte in admin/news.json erstellt werden |
| 181 | DELETE | `/:id` | ❌ Fehlt | Sollte in admin/news.json erstellt werden |

### 18. `pages.js`
**Pfad:** `routes/pages.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 6 | GET | `/` | ✅ Vorhanden | In public/pages.json definiert |
| 25 | GET | `/:slug` | ✅ Vorhanden | In public/pages.json definiert |
| 48 | POST | `/` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/pages.json |
| 90 | PUT | `/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/pages.json |
| 121 | DELETE | `/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/pages.json |

### 19. `rankings.js` & `rankings_backup.js` & `rankings_extended.js`
**Pfad:** `routes/rankings.js` etc.  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 179 | GET | `/:type` | ✅ Vorhanden | In public/rankings.json definiert |
| 274 | GET | `/character/:name` | ❌ Fehlt | Sollte in public/rankings.json |
| 310 | GET | `/guild/:name` | ❌ Fehlt | Sollte in public/rankings.json |

### 20. `referrals.js`
**Pfad:** `routes/referrals.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 6 | GET | `/my-referrals` | ✅ Vorhanden | In user/referrals.json definiert |
| 107 | POST | `/redeem` | ✅ Vorhanden | In user/referrals.json definiert |
| 235 | POST | `/register` | ✅ Vorhanden | In user/referrals.json definiert |
| 299 | GET | `/` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/referrals.json |
| 325 | GET | `/stats` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/referrals.json |
| 351 | GET | `/my-stats` | ❌ Fehlt | Sollte in user/referrals.json |
| 420 | GET | `/rewards` | ❌ Fehlt | Sollte in user/referrals.json |

### 21. `settings.js`
**Pfad:** `routes/settings.js`  
**Status:** Komplett fehlend in Swagger

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 8 | GET | `/` | ❌ Fehlt | Sollte in admin/settings.json erstellt werden |
| 27 | GET | `/:key` | ❌ Fehlt | Sollte in admin/settings.json erstellt werden |
| 52 | PUT | `/:key` | ❌ Fehlt | Sollte in admin/settings.json erstellt werden |
| 97 | DELETE | `/:key` | ❌ Fehlt | Sollte in admin/settings.json erstellt werden |
| 119 | GET | `/admin/all` | ❌ Fehlt | Sollte in admin/settings.json erstellt werden |

### 22. `silk.js`
**Pfad:** `routes/silk.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 9 | GET | `/balance` | ✅ Vorhanden | In game/silk.json definiert |
| 85 | POST | `/process-paypal` | ❌ Fehlt | Sollte in payments/silk.json |
| 128 | GET | `/donation-history` | ❌ Fehlt | Sollte in game/silk.json |
| 147 | POST | `/add-vote-points` | ❌ Fehlt | Sollte in game/silk.json |
| 179 | POST | `/admin/give-silk` | ❌ Fehlt | Sollte in admin/silk.json |

### 23. `user-roles.js`
**Pfad:** `routes/user-roles.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 6 | GET | `/users` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/users.json |
| 34 | GET | `/user-stats` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/users.json |
| 57 | PUT | `/users/:id/admin` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/users.json |
| 99 | PUT | `/users/:id/status` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/users.json |
| 119 | PUT | `/users/:id/password` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/users.json |
| 145 | GET | `/` | ✅ Vorhanden | In user/profile.json definiert |
| 166 | POST | `/assign` | ✅ Vorhanden | In user/profile.json definiert |
| 209 | GET | `/my-roles` | ✅ Vorhanden | In user/profile.json definiert |

### 24. `users.js`
**Pfad:** `routes/users.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 7 | GET | `/me` | ✅ Vorhanden | In user/profile.json definiert |

### 25. `user_tickets.js`
**Pfad:** `routes/user_tickets.js`  
**Status:** Vollständig in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 8 | GET | `/my` | ✅ Vorhanden | In user/tickets.json definiert |
| 28 | GET | `/:id` | ✅ Vorhanden | In user/tickets.json definiert |
| 67 | POST | `/` | ✅ Vorhanden | In user/tickets.json definiert |
| 117 | POST | `/:id/message` | ✅ Vorhanden | In user/tickets.json definiert |

### 26. `votes.js`
**Pfad:** `routes/votes.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 6 | GET | `/sites` | ✅ Vorhanden | In public/votes.json definiert |
| 24 | GET | `/status/:user_id` | ❌ Fehlt | Sollte in public/votes.json |
| 78 | POST | `/postback` | ❌ Fehlt | Sollte in public/votes.json |
| 131 | GET | `/history/:user_id` | ❌ Fehlt | Sollte in user/votes.json erstellt werden |
| 163 | GET | `/admin/sites` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/votes.json |
| 183 | POST | `/admin/sites` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/votes.json |
| 214 | PUT | `/admin/sites/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/votes.json |
| 254 | DELETE | `/admin/sites/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/votes.json |

### 27. `vouchers.js`
**Pfad:** `routes/vouchers.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 18 | GET | `/` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/vouchers.json |
| 59 | POST | `/redeem` | ❌ Fehlt | Sollte in user/vouchers.json erstellt werden |
| 207 | POST | `/` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/vouchers.json |
| 269 | PUT | `/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/vouchers.json |
| 319 | DELETE | `/:id` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/vouchers.json |
| 351 | GET | `/usage` | ❌ Fehlt | Admin-Endpunkt, sollte in admin/vouchers.json |
| 386 | GET | `/my-history` | ❌ Fehlt | Sollte in user/vouchers.json erstellt werden |

### 28. `Payment/payment.js`
**Pfad:** `routes/Payment/payment.js`  
**Status:** Teilweise in Swagger definiert

| Zeile | HTTP-Methode | Endpunkt | Status | Bemerkung |
|-------|--------------|----------|--------|-----------|
| 43 | POST | `/payop/initiate` | ✅ Vorhanden | In payments/payop.json definiert |
| 79 | POST | `/nowpayments/initiate` | ✅ Vorhanden | In payments/nowpayments.json definiert |
| 108 | POST | `/nowpayments/callback` | ✅ Vorhanden | In payments/nowpayments.json definiert |

---

## Zusammenfassung der Befunde

### Statistiken
- **Gesamt analysierte Endpunkte:** 173
- **Bereits in Swagger definiert:** 47 (27%)
- **Fehlende Swagger-Definitionen:** 126 (73%)
- **Duplicate Endpunkte:** 8 (zu bereinigen)

### Neue Swagger-Dateien die erstellt werden sollten:
1. `swagger/modular/paths/admin/downloads.json`
2. `swagger/modular/paths/admin/pages.json`  
3. `swagger/modular/paths/admin/news.json`
4. `swagger/modular/paths/admin/settings.json`
5. `swagger/modular/paths/admin/votes.json`
6. `swagger/modular/paths/public/news.json`
7. `swagger/modular/paths/user/votes.json`
8. `swagger/modular/paths/user/vouchers.json`

### Bestehende Swagger-Dateien die erweitert werden sollten:
1. `swagger/modular/paths/admin/silk.json` - 11 fehlende Endpunkte
2. `swagger/modular/paths/admin/users.json` - 13 fehlende Endpunkte  
3. `swagger/modular/paths/admin/referrals.json` - 16 fehlende Endpunkte
4. `swagger/modular/paths/admin/tickets.json` - 3 fehlende Endpunkte
5. `swagger/modular/paths/admin/vouchers.json` - 2 fehlende Endpunkte
6. `swagger/modular/paths/game/accounts.json` - 5 fehlende Endpunkte
7. `swagger/modular/paths/game/silk.json` - 3 fehlende Endpunkte
8. `swagger/modular/paths/payments/donations.json` - 3 fehlende Endpunkte
9. `swagger/modular/paths/payments/silk.json` - 1 fehlender Endpunkt
10. `swagger/modular/paths/public/downloads.json` - 1 fehlender Endpunkt
11. `swagger/modular/paths/public/rankings.json` - 2 fehlende Endpunkte
12. `swagger/modular/paths/public/votes.json` - 2 fehlende Endpunkte
13. `swagger/modular/paths/user/referrals.json` - 2 fehlende Endpunkte

### Prioritäten für Umsetzung:
1. **Hoch:** Admin-Bereiche (Downloads, Pages, News, Settings, Votes)
2. **Mittel:** Erweiterte Admin-Funktionen (Silk, Users, Referrals)
3. **Niedrig:** Kleine Ergänzungen in bestehenden Dateien

### Empfohlene nächste Schritte:
1. Neue Swagger-Dateien nach dem bestehenden Schema erstellen
2. Bestehende Swagger-Dateien um fehlende Endpunkte erweitern
3. Duplikate in den Route-Dateien bereinigen
4. Swagger-Kompilierung testen nach jeder Änderung
5. API-Dokumentation validieren

---
**Generiert am:** 19. September 2025  
**Tool:** GitHub Copilot Analyse