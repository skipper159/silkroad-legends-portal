#!/usr/bin/env node

/**
 * API Client Generator for Lafftale API
 * Generiert TypeScript/JavaScript Clients aus der Swagger-Dokumentation
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Generating Lafftale API Client...\n');

// Pfade
const SWAGGER_FILE = path.join(__dirname, '..', 'swagger', 'swagger_compiled.json');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'src', 'lib', 'api-client');
const TYPES_DIR = path.join(OUTPUT_DIR, 'types');

// Swagger-Dokumentation laden
let swaggerDoc;
try {
  swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_FILE, 'utf8'));
  console.log('✅ Loaded Swagger documentation');
} catch (error) {
  console.error('❌ Failed to load Swagger documentation:', error.message);
  process.exit(1);
}

// Output-Verzeichnisse erstellen
[OUTPUT_DIR, TYPES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${path.relative(process.cwd(), dir)}`);
  }
});

// TypeScript-Typen generieren
function generateTypes() {
  console.log('📝 Generating TypeScript types...');

  const schemas = swaggerDoc.components?.schemas || {};
  let typesContent = `// Auto-generated TypeScript types for Lafftale API
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

`;

  // Basis-Typen
  typesContent += `// Base API Response Types
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

`;

  // Schema-Typen konvertieren
  Object.entries(schemas).forEach(([name, schema]) => {
    typesContent += generateTypeFromSchema(name, schema);
  });

  // API-Endpunkt-Typen
  typesContent += generateEndpointTypes();

  fs.writeFileSync(path.join(TYPES_DIR, 'index.ts'), typesContent);
  console.log('✅ Generated TypeScript types');
}

function generateTypeFromSchema(name, schema) {
  let typeContent = `export interface ${name} {\n`;

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      const optional = !schema.required?.includes(propName) ? '?' : '';
      const propType = getTypeScriptType(propSchema);
      const description = propSchema.description ? `  /** ${propSchema.description} */\n` : '';

      typeContent += `${description}  ${propName}${optional}: ${propType};\n`;
    });
  }

  typeContent += '}\n\n';
  return typeContent;
}

function getTypeScriptType(schema) {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }

  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum.map((e) => `'${e}'`).join(' | ');
      }
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      const itemType = getTypeScriptType(schema.items || { type: 'any' });
      return `${itemType}[]`;
    case 'object':
      return 'Record<string, any>';
    default:
      return 'any';
  }
}

function generateEndpointTypes() {
  let endpointTypes = `// API Endpoint Types\n`;

  const paths = swaggerDoc.paths || {};
  const endpoints = [];

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`,
          summary: operation.summary,
          tags: operation.tags,
        });
      }
    });
  });

  endpointTypes += `export const API_ENDPOINTS = {\n`;
  endpoints.forEach((endpoint) => {
    const key = endpoint.operationId.toUpperCase();
    endpointTypes += `  ${key}: { method: '${endpoint.method}', path: '${endpoint.path}' },\n`;
  });
  endpointTypes += `} as const;\n\n`;

  return endpointTypes;
}

// API Client generieren
function generateApiClient() {
  console.log('🔧 Generating API client...');

  const clientContent = `// Auto-generated API Client for Lafftale API
// Generated on: ${new Date().toISOString()}
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
    this.baseUrl = baseUrl.replace(/\\/$/, '');
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
    const url = \`\${this.baseUrl}\${endpoint}\`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
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
      throw new Error(\`API request failed: \${error.message}\`);
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
    return this.request<Character>('GET', \`/api/user/characters/\${id}\`);
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
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), clientContent);
  console.log('✅ Generated API client');
}

// React Hooks generieren
function generateReactHooks() {
  console.log('⚛️ Generating React hooks...');

  const hooksContent = `// Auto-generated React hooks for Lafftale API
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ApiResponse, type User, type Character, type Ticket } from './index';

// Authentication Hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.login(username, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    getProfile
  };
}

// Characters Hook
export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getCharacters();
      if (response.success && response.data) {
        setCharacters(response.data);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters().catch(() => {});
  }, [fetchCharacters]);

  return {
    characters,
    loading,
    error,
    refetch: fetchCharacters
  };
}

// Tickets Hook
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getTickets();
      if (response.success && response.data) {
        setTickets(response.data);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (ticketData: {
    subject: string;
    category: string;
    message: string;
    priority?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createTicket(ticketData);
      if (response.success && response.data) {
        setTickets(prev => [response.data!, ...prev]);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets().catch(() => {});
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    createTicket,
    refetch: fetchTickets
  };
}

// Generic API Hook
export function useApi<T>(endpoint: () => Promise<ApiResponse<T>>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await endpoint();
      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetch().catch(() => {});
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refetch: fetch
  };
}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'hooks.ts'), hooksContent);
  console.log('✅ Generated React hooks');
}

// README generieren
function generateReadme() {
  const readmeContent = `# Lafftale API Client

Auto-generated TypeScript client for the Lafftale API.

## Installation

\`\`\`typescript
import { apiClient, useAuth, useCharacters } from './lib/api-client';
\`\`\`

## Usage

### Basic API Client

\`\`\`typescript
import { apiClient } from './lib/api-client';

// Login
const { data } = await apiClient.login('username', 'password');

// Get user profile
const profile = await apiClient.getProfile();

// Get characters
const characters = await apiClient.getCharacters();
\`\`\`

### React Hooks

\`\`\`typescript
import { useAuth, useCharacters } from './lib/api-client/hooks';

function LoginComponent() {
  const { user, login, loading, error } = useAuth();
  
  const handleLogin = async () => {
    await login('username', 'password');
  };
  
  return (
    <div>
      {user ? \`Welcome \${user.StrUserID}\` : 'Not logged in'}
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
\`\`\`

## API Endpoints

The client provides methods for all ${Object.keys(swaggerDoc.paths || {}).length} API endpoints:

${Object.entries(swaggerDoc.paths || {})
  .map(([path, methods]) =>
    Object.keys(methods)
      .map((method) => `- ${method.toUpperCase()} ${path}`)
      .join('\\n')
  )
  .join('\\n')}

## Types

All TypeScript types are auto-generated from the OpenAPI specification:

${Object.keys(swaggerDoc.components?.schemas || {})
  .map((name) => `- ${name}`)
  .join('\\n')}

---

*Generated on: ${new Date().toISOString()}*
*From: Lafftale API Documentation*
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readmeContent);
  console.log('✅ Generated README');
}

// Haupt-Execution
async function main() {
  try {
    generateTypes();
    generateApiClient();
    generateReactHooks();
    generateReadme();

    console.log(`
✅ API Client generation completed!

📁 Generated files:
   - ${path.relative(process.cwd(), path.join(OUTPUT_DIR, 'index.ts'))} (Main client)
   - ${path.relative(process.cwd(), path.join(TYPES_DIR, 'index.ts'))} (TypeScript types)
   - ${path.relative(process.cwd(), path.join(OUTPUT_DIR, 'hooks.ts'))} (React hooks)
   - ${path.relative(process.cwd(), path.join(OUTPUT_DIR, 'README.md'))} (Documentation)

🚀 Ready to use in your React app!
    `);
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
