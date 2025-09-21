// Auto-generated TypeScript types for Lafftale API
// Generated on: 2025-09-16T19:08:12.962Z
// DO NOT EDIT MANUALLY

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error_code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  /** Unique user identifier */
  StrUserID: string;
  /** User email address */
  StrEmail: string;
  /** User JID */
  JID: number;
  /** Registration date */
  RegDate?: string;
  /** Last login timestamp */
  LastLogin?: string;
  /** Account active status */
  isActive?: boolean;
  /** Account banned status */
  isBanned?: boolean;
  /** Silk points owned */
  SilkOwn?: number;
  /** User role/permission level */
  role?: 'user' | 'gm' | 'admin';
}

export interface LoginRequest {
  /** Username or email */
  username: string;
  /** User password */
  password: string;
  /** Remember login session */
  remember?: boolean;
}

export interface LoginResponse {
  /** JWT authentication token */
  token: string;
  user: User;
  /** Token expiration time in seconds */
  expires_in?: number;
}

export interface RegisterRequest {
  /** Unique username */
  username: string;
  /** Valid email address */
  email: string;
  /** Account password */
  password: string;
  /** Password confirmation */
  password_confirmation: string;
  /** Optional referral code */
  referral_code?: string;
  /** Terms and conditions acceptance */
  terms_accepted: boolean;
}

export interface PasswordResetRequest {
  /** Email address for password reset */
  email: string;
}

export interface Character {
  /** Unique character identifier */
  CharID: number;
  /** Character name */
  CharName16: string;
  /** Character nickname */
  NickName16?: string;
  /** Current character level */
  CurLevel?: number;
  /** Maximum level achieved */
  MaxLevel?: number;
  /** Experience points */
  ExpOffset?: number;
  /** GM access level */
  GMLevel?: number;
  /** Job type (Trader/Thief/Hunter) */
  JobType?: number;
  /** Job level */
  JobLevel?: number;
  /** Job experience points */
  JobExp?: number;
  /** Current health points */
  HP?: number;
  /** Current mana points */
  MP?: number;
  /** Character gold amount */
  Gold?: number;
  /** Available skill points */
  SkillPoint?: number;
  /** Available stat points */
  StatPoint?: number;
  /** Strength stat */
  Strength?: number;
  /** Intelligence stat */
  Intellect?: number;
  /** Teleport position X */
  TelePosX?: number;
  /** Teleport position Y */
  TelePosY?: number;
  /** Teleport position Z */
  TelePosZ?: number;
  /** Death position X */
  DiedPosX?: number;
  /** Death position Y */
  DiedPosY?: number;
  /** Death position Z */
  DiedPosZ?: number;
  /** World/Region ID */
  World?: number;
  /** Character model reference */
  RefObjID?: number;
  /** Remaining time for temporary effects */
  RemainTime?: number;
  /** Last logout timestamp */
  LogoutTime?: string;
  /** Character deletion timestamp */
  DeleteTime?: string;
  /** Player killer flag */
  PKFlag?: number;
  /** Teleport flag */
  TPFlag?: number;
  /** Auto invest experience setting */
  AutoInvestExp?: number;
  /** Guild ID (if member of guild) */
  GuildID?: number;
}

export interface CharacterInventory {
  /** Inventory slot position */
  slot: number;
  /** Item type identifier */
  itemType: string;
  /** Item quantity */
  quantity: number;
  /** Enhancement level */
  enhancement?: number;
  /** Unique item serial number */
  serialNumber?: string;
}

export interface CharacterStats {
  /** Total character level */
  totalLevel?: number;
  /** Total play time in minutes */
  playTime?: number;
  /** Total gold amount */
  gold?: number;
  /** Player kill count */
  pkCount?: number;
  /** Death count */
  deathCount?: number;
  /** Current guild name */
  guildName?: string;
}

export interface News {
  /** Unique news ID */
  id: number;
  /** News article title */
  title: string;
  /** News article content */
  content: string;
  /** ID of author */
  author_id: number;
  /** News category */
  category?: string;
  /** Whether article is featured */
  featured?: boolean;
  /** Whether article is published */
  published?: boolean;
  /** Publication timestamp */
  published_at?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
  /** Author username (joined data) */
  author_username?: string;
}

export interface ServerInfo {
  /** Server ID */
  id: number;
  /** Server name */
  name: string;
  /** Server host address */
  host?: string;
  /** Server port */
  port?: number;
  /** Current server status */
  status: 'online' | 'offline' | 'maintenance';
  /** Number of players currently online */
  players_online?: number;
  /** Maximum player capacity */
  max_players?: number;
  /** Server uptime in seconds */
  uptime?: number;
  /** Last status check timestamp */
  last_check?: string;
  /** Server version */
  version?: string;
  rates?: Record<string, any>;
}

export interface Download {
  /** Download ID */
  id: number;
  /** Download name/title */
  name: string;
  /** Download description */
  description?: string;
  /** Download file URL */
  file_url: string;
  /** File size in bytes */
  file_size?: number;
  /** File version */
  version?: string;
  /** Download category */
  category: 'client' | 'patch' | 'tool' | 'other';
  /** Number of downloads */
  download_count?: number;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

export interface GuildInfo {
  /** Guild ID */
  ID: number;
  /** Guild name */
  Name: string;
  /** Guild level */
  Lvl: number;
  /** Guild master character ID */
  MasterID: number;
  /** Alliance ID */
  Alliance?: number;
  /** Guild notice/description */
  Notice?: string;
  /** Guild foundation date */
  FoundationDate?: string;
  /** Number of guild members */
  memberCount?: number;
  /** Guild master character name (joined data) */
  masterName?: string;
}

export interface CmsSettings {
  /** Website name */
  site_name?: string;
  /** Website description */
  site_description?: string;
  /** Whether site is in maintenance mode */
  maintenance_mode?: boolean;
  /** Whether user registration is enabled */
  registration_enabled?: boolean;
  /** Maximum accounts allowed per IP */
  max_accounts_per_ip?: number;
  /** Whether email verification is required */
  email_verification?: boolean;
  /** Whether CAPTCHA is enabled */
  captcha_enabled?: boolean;
  /** Whether accounts are auto-created in game DB */
  auto_account_creation?: boolean;
}

export interface PaginationInfo {
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Whether there is a next page */
  hasNext?: boolean;
  /** Whether there is a previous page */
  hasPrev?: boolean;
}

export interface SuccessResponse {
  /** Indicates successful operation */
  success: boolean;
  /** Success message */
  message?: string;
  /** Response data (varies by endpoint) */
  data?: any;
}

export interface ErrorResponse {
  /** Indicates failed operation */
  success: boolean;
  /** Error message */
  error: string;
  /** Additional error details */
  details?: string;
}

export interface RankingEntry {
  /** Ranking position */
  rank: number;
  /** Player or guild name */
  name: string;
  /** Level or score */
  level?: number;
  /** Points or experience */
  points?: number;
}

export interface Payment {
  /** Unique payment ID */
  id: number;
  /** ID of user who made the payment */
  user_id: number;
  /** Payment amount in currency */
  amount: number;
  /** Payment currency (USD, EUR, etc.) */
  currency: string;
  /** Number of coins/credits awarded */
  coins_awarded?: number;
  /** Payment method used */
  payment_method: 'paypal' | 'stripe' | 'crypto' | 'bank_transfer' | 'other';
  /** External transaction ID from payment provider */
  transaction_id?: string;
  /** Payment status */
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  /** Payment creation timestamp */
  created_at?: string;
  /** Payment completion timestamp */
  completed_at?: string;
  /** Additional payment notes */
  notes?: string;
  /** Username of payer (joined data) */
  username?: string;
}

export interface PaymentPackage {
  /** Package ID */
  id: number;
  /** Package name */
  name: string;
  /** Package description */
  description?: string;
  /** Package price */
  price: number;
  /** Price currency */
  currency: string;
  /** Number of coins/credits provided */
  coins: number;
  /** Bonus coins for this package */
  bonus_coins?: number;
  /** Whether package is available for purchase */
  enabled?: boolean;
  /** Whether package is featured/promoted */
  featured?: boolean;
  /** Display order */
  sort_order?: number;
  /** Package creation timestamp */
  created_at?: string;
}

export interface PaymentStats {
  /** Total number of payments */
  totalPayments?: number;
  /** Total revenue amount */
  totalRevenue?: number;
  /** Number of pending payments */
  pendingPayments?: number;
  /** Number of completed payments */
  completedPayments?: number;
  /** Number of failed payments */
  failedPayments?: number;
  /** Revenue generated today */
  todayRevenue?: number;
  /** Revenue generated this week */
  weekRevenue?: number;
  /** Revenue generated this month */
  monthRevenue?: number;
  /** Average payment amount */
  avgPaymentAmount?: number;
  /** Most popular payment method */
  topPaymentMethod?: string;
}

export interface CoinBalance {
  /** User ID */
  user_id: number;
  /** Current coin balance */
  balance: number;
  /** Total coins earned */
  total_earned?: number;
  /** Total coins spent */
  total_spent?: number;
  /** Last transaction timestamp */
  last_transaction_at?: string;
}

export interface CoinTransaction {
  /** Transaction ID */
  id: number;
  /** User ID */
  user_id: number;
  /** Transaction type */
  type: 'earned' | 'spent' | 'refund' | 'admin_add' | 'admin_remove';
  /** Transaction amount (positive for earned, negative for spent) */
  amount: number;
  /** Transaction description */
  description?: string;
  /** Reference ID (payment ID, purchase ID, etc.) */
  reference_id?: string;
  /** Transaction timestamp */
  created_at?: string;
  /** Username (joined data) */
  username?: string;
}

export interface Referral {
  /** Unique referral ID */
  id: number;
  /** ID of user who created the referral */
  referrer_id: number;
  /** ID of user who was referred */
  referred_user_id?: number;
  /** Unique referral code */
  code: string;
  /** Timestamp when referral was used */
  used_at?: string;
  /** Timestamp when referral was created */
  created_at: string;
  /** Whether reward has been claimed */
  reward_claimed?: boolean;
  /** Timestamp when reward was claimed */
  reward_claimed_at?: string;
  /** IP address used for referral registration */
  ip_address?: string;
  /** Browser fingerprint for anti-cheat detection */
  fingerprint?: string;
  /** Whether referral passed anti-cheat validation */
  is_valid?: boolean;
  /** Reason for marking as suspicious/invalid */
  cheat_reason?: string;
  /** Username of referrer (joined data) */
  referrer_username?: string;
  /** Username of referred user (joined data) */
  referred_username?: string;
}

export interface ReferralStats {
  /** Total number of referrals */
  totalReferrals?: number;
  /** Number of valid referrals */
  validReferrals?: number;
  /** Number of suspicious referrals */
  suspiciousReferrals?: number;
  /** Number of claimed rewards */
  claimedRewards?: number;
  /** Number of unclaimed rewards */
  unclaimedRewards?: number;
  /** Total value of all rewards */
  totalRewardValue?: number;
  /** Referrals created today */
  todayReferrals?: number;
  /** Referrals created this week */
  weekReferrals?: number;
  /** Referrals created this month */
  monthReferrals?: number;
}

export interface ReferralSettings {
  /** Whether referral system is enabled */
  enabled?: boolean;
  /** Reward amount for successful referrals */
  reward_amount?: number;
  /** Maximum referrals allowed per IP address */
  max_per_ip?: number;
  /** Maximum referrals allowed per browser fingerprint */
  max_per_fingerprint?: number;
  /** Minimum level required for referral eligibility */
  require_level?: number;
  /** Whether to automatically validate referrals */
  auto_validate?: boolean;
  /** Whether browser fingerprinting is required */
  fingerprint_required?: boolean;
  /** Whether IP address validation is enabled */
  ip_validation?: boolean;
  /** Whether suspicious referrals require manual review */
  manual_review?: boolean;
}

export interface ReferralCode {
  /** The referral code */
  code: string;
  /** ID of user who owns the code */
  referrer_id: number;
  /** Number of times code has been used */
  uses?: number;
  /** Maximum number of uses allowed */
  max_uses?: number;
  /** Code expiration timestamp */
  expires_at?: string;
}

export interface AntiCheatValidation {
  /** Whether referral passed validation */
  isValid: boolean;
  /** List of validation warnings */
  warnings?: string[];
  /** Reasons for marking as suspicious */
  suspiciousReasons?: string[];
  /** Whether manual review is required */
  requiresManualReview?: boolean;
  /** Browser fingerprint used for validation */
  fingerprint?: string;
  /** IP address used for validation */
  ipAddress?: string;
}

export interface Ticket {
  /** Unique ticket ID */
  id: number;
  /** ID of user who created the ticket */
  user_id: number;
  /** Ticket subject/title */
  subject: string;
  /** Initial ticket message */
  message: string;
  /** Current ticket status */
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  /** Ticket priority level */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  /** Ticket category */
  category?: string;
  /** ID of staff member assigned to ticket */
  assigned_to?: number;
  /** Ticket creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
  /** Resolution timestamp */
  resolved_at?: string;
  /** Username of ticket creator (joined data) */
  username?: string;
  /** Username of assigned staff (joined data) */
  assigned_username?: string;
}

export interface TicketReply {
  /** Unique reply ID */
  id: number;
  /** ID of parent ticket */
  ticket_id: number;
  /** ID of user who wrote the reply */
  user_id: number;
  /** Reply message content */
  message: string;
  /** Whether reply is from staff member */
  is_staff?: boolean;
  /** Reply creation timestamp */
  created_at?: string;
  /** Username of reply author (joined data) */
  username?: string;
}

export interface TicketStats {
  /** Total number of tickets */
  totalTickets?: number;
  /** Number of open tickets */
  openTickets?: number;
  /** Number of tickets in progress */
  inProgressTickets?: number;
  /** Number of resolved tickets */
  resolvedTickets?: number;
  /** Number of closed tickets */
  closedTickets?: number;
  /** Tickets created today */
  todayTickets?: number;
  /** Tickets created this week */
  weekTickets?: number;
  /** Tickets created this month */
  monthTickets?: number;
  /** Average response time in hours */
  avgResponseTime?: number;
  /** Average resolution time in hours */
  avgResolutionTime?: number;
}

export interface TicketFilters {
  /** Filter by status */
  status?: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';
  /** Filter by priority */
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  /** Filter by category */
  category?: string;
  /** Filter by assigned staff member */
  assigned_to?: number;
  /** Filter tickets from this date */
  date_from?: string;
  /** Filter tickets until this date */
  date_to?: string;
  /** Search in subject and message */
  search?: string;
}

// API Endpoint Types
export const API_ENDPOINTS = {
  GETADMINREFERRALS: { method: 'GET', path: '/admin/referrals' },
  GETADMINREFERRALSSTATS: { method: 'GET', path: '/admin/referrals/stats' },
  GETADMINREFERRALSSUSPICIOUS: { method: 'GET', path: '/admin/referrals/suspicious' },
  PUTADMINREFERRALSIDVALIDATE: { method: 'PUT', path: '/admin/referrals/{id}/validate' },
  POSTADMINREFERRALSIDREWARD: { method: 'POST', path: '/admin/referrals/{id}/reward' },
  GETADMINREFERRALSSETTINGS: { method: 'GET', path: '/admin/referrals/settings' },
  PUTADMINREFERRALSSETTINGS: { method: 'PUT', path: '/admin/referrals/settings' },
  GETADMINREFERRALSANTICHEAT: { method: 'GET', path: '/admin/referrals/anti-cheat' },
  GETAPIADMINTICKETSTICKETS: { method: 'GET', path: '/api/admin_tickets/tickets' },
  PUTAPIADMINTICKETSTICKETSIDCLOSE: { method: 'PUT', path: '/api/admin_tickets/tickets/{id}/close' },
  GETAPIADMINTICKETSTICKETSIDMESSAGES: { method: 'GET', path: '/api/admin_tickets/tickets/{id}/messages' },
  POSTAPIADMINTICKETSTICKETSIDREPLY: { method: 'POST', path: '/api/admin_tickets/tickets/{id}/reply' },
  GETAPIADMINWEBACCOUNTS: { method: 'GET', path: '/api/admin/webaccounts' },
  GETAPIADMINGAMEACCOUNTS: { method: 'GET', path: '/api/admin/gameaccounts' },
  POSTAPIADMINGAMEACCOUNTSIDBAN: { method: 'POST', path: '/api/admin/gameaccounts/{id}/ban' },
  POSTAPIADMINGAMEACCOUNTSIDTIMEOUT: { method: 'POST', path: '/api/admin/gameaccounts/{id}/timeout' },
  GETAPIADMINVOUCHERS: { method: 'GET', path: '/api/admin/vouchers' },
  POSTAPIADMINVOUCHERS: { method: 'POST', path: '/api/admin/vouchers' },
  GETAPIADMINVOUCHERSID: { method: 'GET', path: '/api/admin/vouchers/{id}' },
  PUTAPIADMINVOUCHERSID: { method: 'PUT', path: '/api/admin/vouchers/{id}' },
  DELETEAPIADMINVOUCHERSID: { method: 'DELETE', path: '/api/admin/vouchers/{id}' },
  GETAPIVOUCHERS: { method: 'GET', path: '/api/vouchers' },
  POSTAPIVOUCHERSREDEEM: { method: 'POST', path: '/api/vouchers/redeem' },
  POSTAUTHREGISTER: { method: 'POST', path: '/auth/register' },
  POSTAUTHLOGIN: { method: 'POST', path: '/auth/login' },
  POSTAUTHLOGOUT: { method: 'POST', path: '/auth/logout' },
  GETAUTHVERIFY: { method: 'GET', path: '/auth/verify' },
  POSTAUTHREFRESH: { method: 'POST', path: '/auth/refresh' },
  POSTAPIGAMEACCOUNTCREATE: { method: 'POST', path: '/api/gameaccount/create' },
  GETAPIGAMEACCOUNTMY: { method: 'GET', path: '/api/gameaccount/my' },
  GETAPIGAMEACCOUNTID: { method: 'GET', path: '/api/gameaccount/{id}' },
  PUTAPIGAMEACCOUNTID: { method: 'PUT', path: '/api/gameaccount/{id}' },
  PUTAPIGAMEACCOUNTIDPASSWORD: { method: 'PUT', path: '/api/gameaccount/{id}/password' },
  GETAPISILKBALANCEGAMEACCOUNTID: { method: 'GET', path: '/api/silk/balance/{gameAccountId}' },
  POSTAPISILKADD: { method: 'POST', path: '/api/silk/add' },
  POSTAPISILKSPEND: { method: 'POST', path: '/api/silk/spend' },
  POSTAPIDONATIONINITIATE: { method: 'POST', path: '/api/donation/initiate' },
  GETAPIDONATIONWALLETUSERID: { method: 'GET', path: '/api/donation/wallet/{userId}' },
  POSTAPIDONATIONVOTEPLATFORM: { method: 'POST', path: '/api/donation/vote/{platform}' },
  POSTAPIPAYMENTNOWPAYMENTSINITIATE: { method: 'POST', path: '/api/payment/nowpayments/initiate' },
  POSTAPIPAYMENTNOWPAYMENTSCALLBACK: { method: 'POST', path: '/api/payment/nowpayments/callback' },
  POSTAPIPAYMENTPAYOPINITIATE: { method: 'POST', path: '/api/payment/payop/initiate' },
  POSTAPIPAYMENTPAYOPCALLBACK: { method: 'POST', path: '/api/payment/payop/callback' },
  GETAPIDOWNLOADS: { method: 'GET', path: '/api/downloads' },
  GETAPIDOWNLOADSCATEGORIES: { method: 'GET', path: '/api/downloads/categories' },
  GETAPIDOWNLOADSIDDOWNLOAD: { method: 'GET', path: '/api/downloads/{id}/download' },
  POSTAPIDOWNLOADSIDDOWNLOAD: { method: 'POST', path: '/api/downloads/{id}/download' },
  GETAPIPAGES: { method: 'GET', path: '/api/pages' },
  GETAPIPAGESSLUG: { method: 'GET', path: '/api/pages/{slug}' },
  GETAPIRANKINGTYPE: { method: 'GET', path: '/api/ranking/{type}' },
  GETAPIRANKINGSEXTENDEDTYPE: { method: 'GET', path: '/api/rankings-extended/{type}' },
  GETAPIVOTES: { method: 'GET', path: '/api/votes' },
  GETAPIVOTESUSERSTATUS: { method: 'GET', path: '/api/votes/user-status' },
  POSTAPIVOTESIDVOTE: { method: 'POST', path: '/api/votes/{id}/vote' },
  GETAPICHARACTERSCHARACTERSGAMEACCOUNTID: { method: 'GET', path: '/api/characters/characters/{gameAccountId}' },
  GETAPICHARACTERSGAMEACCOUNTSMY: { method: 'GET', path: '/api/characters/gameaccounts/my' },
  GETAPICHARACTERSINVENTORYCHARID: { method: 'GET', path: '/api/characters/inventory/{charId}' },
  GETAPICHARACTERSCHARIDDETAILS: { method: 'GET', path: '/api/characters/{charId}/details' },
  GETAPIINVENTORYCHARID: { method: 'GET', path: '/api/inventory/{charId}' },
  GETAPIAUTHPROFILE: { method: 'GET', path: '/api/auth/profile' },
  PUTAPIAUTHPROFILE: { method: 'PUT', path: '/api/auth/profile' },
  GETAPIUSERROLES: { method: 'GET', path: '/api/user-roles' },
  POSTAPIUSERROLESASSIGN: { method: 'POST', path: '/api/user-roles/assign' },
  GETAPIUSERROLESMYROLES: { method: 'GET', path: '/api/user-roles/my-roles' },
  GETAPIREFERRALSMYREFERRALS: { method: 'GET', path: '/api/referrals/my-referrals' },
  POSTAPIREFERRALSREDEEM: { method: 'POST', path: '/api/referrals/redeem' },
  POSTAPIREFERRALSREGISTER: { method: 'POST', path: '/api/referrals/register' },
  GETAPIUSERTICKETS: { method: 'GET', path: '/api/user_tickets' },
  POSTAPIUSERTICKETS: { method: 'POST', path: '/api/user_tickets' },
  GETAPIUSERTICKETSMY: { method: 'GET', path: '/api/user_tickets/my' },
  GETAPIUSERTICKETSID: { method: 'GET', path: '/api/user_tickets/{id}' },
  PUTAPIUSERTICKETSID: { method: 'PUT', path: '/api/user_tickets/{id}' },
  POSTAPIUSERTICKETSIDMESSAGE: { method: 'POST', path: '/api/user_tickets/{id}/message' },
} as const;

