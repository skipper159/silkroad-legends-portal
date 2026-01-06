export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, { ...options, headers });
};

// Unified weburl export with fallback
const defaultUrl = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://backend.lafftale.online';
export const weburl =
  import.meta.env.VITE_API_weburl || import.meta.env.VITE_API_webURL || defaultUrl;
export const webUrl = weburl;
