import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pinterest/oauth/url');
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