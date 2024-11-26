import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

// These values should match your Pinterest Developer App settings
const PINTEREST_CLIENT_ID = '1507772';
const REDIRECT_URI = 'https://adorable-shortbread-ea235b.netlify.app/callback';
const SCOPE = 'boards:read,pins:read,pins:write';
const STATE = crypto.randomUUID(); // Generate random state for security

export default function AuthButton() {
  const { isAuthenticated, clearAuth } = useAuthStore();

  const handleLogin = () => {
    // Store state in sessionStorage to verify when returning
    sessionStorage.setItem('pinterest_auth_state', STATE);
    
    const authUrl = `https://www.pinterest.com/oauth/?` + 
      `client_id=${PINTEREST_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `state=${STATE}`;

    window.location.href = authUrl;
  };

  return isAuthenticated ? (
    <button
      onClick={clearAuth}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Disconnect Pinterest
    </button>
  ) : (
    <button
      onClick={handleLogin}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Connect Pinterest
    </button>
  );
}