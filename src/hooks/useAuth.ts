import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('pinterest_auth');
    if (auth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pinterest-auth?path=/oauth/url');
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      toast.error('Failed to initiate authentication');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    isAuthenticated,
    handleAuth,
    setIsAuthenticated
  };
}