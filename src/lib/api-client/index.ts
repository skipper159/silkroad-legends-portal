// Auto-generated API Client for Lafftale API
// Generated on: 2025-09-16T19:08:12.964Z
// DO NOT EDIT MANUALLY

import type { 
  ApiResponse, 
  PaginatedResponse, 
  ErrorResponse,
  User,
  Character,
  Ticket,
  Payment,
  Referral
} from './types';

export class LafftaleApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // Authentication
  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      ...options,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      
      return result;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // Authentication Methods
  async login(username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<{ token: string; user: User }>('POST', '/auth/login', {
      username,
      password
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    referral_code?: string;
    terms_accepted: boolean;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('POST', '/auth/register', userData);
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('POST', '/auth/logout');
    this.clearToken();
    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('GET', '/api/auth/profile');
  }

  // User Methods
  async getCharacters(): Promise<ApiResponse<Character[]>> {
    return this.request<Character[]>('GET', '/api/user/characters');
  }

  async getCharacter(id: number): Promise<ApiResponse<Character>> {
    return this.request<Character>('GET', `/api/user/characters/${id}`);
  }

  async getTickets(): Promise<ApiResponse<Ticket[]>> {
    return this.request<Ticket[]>('GET', '/api/user/tickets');
  }

  async createTicket(ticketData: {
    subject: string;
    category: string;
    message: string;
    priority?: string;
  }): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>('POST', '/api/user/tickets', ticketData);
  }

  // Referral Methods
  async getReferrals(): Promise<ApiResponse<Referral[]>> {
    return this.request<Referral[]>('GET', '/api/user/referrals');
  }

  async redeemReferral(code: string): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/user/referrals/redeem', { code });
  }

  // Payment Methods
  async getDonationPackages(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/api/payments/donations');
  }

  async createDonation(packageId: number): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('POST', '/api/payments/donations', { package_id: packageId });
  }

  // Public Methods (no auth required)
  async getPlayerRankings(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/api/rankings/players');
  }

  async getGuildRankings(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/api/rankings/guilds');
  }

  async getDownloads(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/api/downloads');
  }

  async getVoteSites(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/api/votes/sites');
  }

  // Game Methods
  async getGameAccounts(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/api/game/accounts');
  }

  async getSilkBalance(): Promise<ApiResponse<{ balance: number }>> {
    return this.request<{ balance: number }>('GET', '/api/game/silk/balance');
  }

  async transferSilk(targetAccount: string, amount: number): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/game/silk/transfer', {
      target_account: targetAccount,
      amount
    });
  }
}

// Singleton instance
export const apiClient = new LafftaleApiClient();

// Export types
export type * from './types';
