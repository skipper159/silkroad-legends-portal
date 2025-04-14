export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  
    return fetch(url, { ...options, headers });
  };

  export const weburl = import.meta.env.VITE_API_weburl;
  export const webUrl = import.meta.env.VITE_API_webURL;