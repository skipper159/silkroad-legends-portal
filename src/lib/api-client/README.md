# Lafftale API Client

Auto-generated TypeScript client for the Lafftale API.

## Installation

```typescript
import { apiClient, useAuth, useCharacters } from './lib/api-client';
```

## Usage

### Basic API Client

```typescript
import { apiClient } from './lib/api-client';

// Login
const { data } = await apiClient.login('username', 'password');

// Get user profile
const profile = await apiClient.getProfile();

// Get characters
const characters = await apiClient.getCharacters();
```

### React Hooks

```typescript
import { useAuth, useCharacters } from './lib/api-client/hooks';

function LoginComponent() {
  const { user, login, loading, error } = useAuth();
  
  const handleLogin = async () => {
    await login('username', 'password');
  };
  
  return (
    <div>
      {user ? `Welcome ${user.StrUserID}` : 'Not logged in'}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}

function CharactersComponent() {
  const { characters, loading, error, refetch } = useCharacters();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {characters.map(char => (
        <div key={char.CharID}>
          {char.CharName16} - Level {char.CurLevel}
        </div>
      ))}
    </div>
  );
}
```

## API Endpoints

The client provides methods for all 64 API endpoints:

- GET /admin/referrals\n- GET /admin/referrals/stats\n- GET /admin/referrals/suspicious\n- PUT /admin/referrals/{id}/validate\n- POST /admin/referrals/{id}/reward\n- GET /admin/referrals/settings\n- PUT /admin/referrals/settings\n- GET /admin/referrals/anti-cheat\n- GET /api/admin_tickets/tickets\n- PUT /api/admin_tickets/tickets/{id}/close\n- GET /api/admin_tickets/tickets/{id}/messages\n- POST /api/admin_tickets/tickets/{id}/reply\n- GET /api/admin/webaccounts\n- GET /api/admin/gameaccounts\n- POST /api/admin/gameaccounts/{id}/ban\n- POST /api/admin/gameaccounts/{id}/timeout\n- GET /api/admin/vouchers\n- POST /api/admin/vouchers\n- GET /api/admin/vouchers/{id}\n- PUT /api/admin/vouchers/{id}\n- DELETE /api/admin/vouchers/{id}\n- GET /api/vouchers\n- POST /api/vouchers/redeem\n- POST /auth/register\n- POST /auth/login\n- POST /auth/logout\n- GET /auth/verify\n- POST /auth/refresh\n- POST /api/gameaccount/create\n- GET /api/gameaccount/my\n- GET /api/gameaccount/{id}\n- PUT /api/gameaccount/{id}\n- PUT /api/gameaccount/{id}/password\n- GET /api/silk/balance/{gameAccountId}\n- POST /api/silk/add\n- POST /api/silk/spend\n- POST /api/donation/initiate\n- GET /api/donation/wallet/{userId}\n- POST /api/donation/vote/{platform}\n- POST /api/payment/nowpayments/initiate\n- POST /api/payment/nowpayments/callback\n- POST /api/payment/payop/initiate\n- POST /api/payment/payop/callback\n- GET /api/downloads\n- GET /api/downloads/categories\n- GET /api/downloads/{id}/download\n- POST /api/downloads/{id}/download\n- GET /api/pages\n- GET /api/pages/{slug}\n- GET /api/ranking/{type}\n- GET /api/rankings-extended/{type}\n- GET /api/votes\n- GET /api/votes/user-status\n- POST /api/votes/{id}/vote\n- GET /api/characters/characters/{gameAccountId}\n- GET /api/characters/gameaccounts/my\n- GET /api/characters/inventory/{charId}\n- GET /api/characters/{charId}/details\n- GET /api/inventory/{charId}\n- GET /api/auth/profile\n- PUT /api/auth/profile\n- GET /api/user-roles\n- POST /api/user-roles/assign\n- GET /api/user-roles/my-roles\n- GET /api/referrals/my-referrals\n- POST /api/referrals/redeem\n- POST /api/referrals/register\n- GET /api/user_tickets\n- POST /api/user_tickets\n- GET /api/user_tickets/my\n- GET /api/user_tickets/{id}\n- PUT /api/user_tickets/{id}\n- POST /api/user_tickets/{id}/message

## Types

All TypeScript types are auto-generated from the OpenAPI specification:

- User\n- LoginRequest\n- LoginResponse\n- RegisterRequest\n- PasswordResetRequest\n- Character\n- CharacterInventory\n- CharacterStats\n- News\n- ServerInfo\n- Download\n- GuildInfo\n- CmsSettings\n- PaginationInfo\n- SuccessResponse\n- ErrorResponse\n- RankingEntry\n- Payment\n- PaymentPackage\n- PaymentStats\n- CoinBalance\n- CoinTransaction\n- Referral\n- ReferralStats\n- ReferralSettings\n- ReferralCode\n- AntiCheatValidation\n- Ticket\n- TicketReply\n- TicketStats\n- TicketFilters

---

*Generated on: 2025-09-16T19:08:12.966Z*
*From: Lafftale API Documentation*
