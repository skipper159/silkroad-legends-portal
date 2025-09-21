// Auto-generated React hooks for Lafftale API
// Generated on: 2025-09-16T19:08:12.965Z
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
