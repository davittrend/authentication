import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface PinterestAuth {
  token: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
  user: {
    username: string;
    [key: string]: any;
  };
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<PinterestAuth | null>(null);

  // Load authentication data from localStorage on mount
  useEffect(() => {
    try {
      const auth = localStorage.getItem('pinterest_auth');
      if (auth) {
        const data = JSON.parse(auth) as PinterestAuth;
        setIsAuthenticated(true);
        setUserData(data);

        // Check token expiration (optional enhancement)
        const tokenExpiration = new Date().getTime() + data.token.expires_in * 1000;
        if (new Date().getTime() > tokenExpiration) {
          toast.error('Session expired. Please log in again.');
          logout(); // Automatically log out if the token is expired
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  }, []);

  // Handle Pinterest authentication flow
  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pinterest-auth?path=/oauth/url');
      if (!response.ok) throw new Error('Failed to fetch authentication URL');
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Authentication URL not found in response');
      }
    } catch (error) {
      toast.error('Failed to initiate authentication');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle logout
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('pinterest_auth');
      setIsAuthenticated(false);
      setUserData(null);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out. Please try again.');
    }
  }, []);

  // Optional: Function to manually update authentication state
  const setAuthData = useCallback((authData: PinterestAuth) => {
    try {
      localStorage.setItem('pinterest_auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUserData(authData);
    } catch (error) {
      console.error('Error saving auth data:', error);
      toast.error('Failed to save authentication data');
    }
  }, []);

  return {
    isLoading,
    isAuthenticated,
    userData,
    handleAuth,
    logout,
    setAuthData,
  };
}
