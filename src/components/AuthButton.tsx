import React, { useState } from 'react';
import { Loader, LogOut, User } from 'lucide-react';

interface AuthButtonProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  onClick: () => Promise<void>; // Ensure onClick is async for error handling
  onLogout?: () => void;
  username?: string;
  errorMessage?: string; // Optional prop for displaying error messages
}

export function AuthButton({
  isLoading,
  isAuthenticated,
  onClick,
  onLogout,
  username,
  errorMessage,
}: AuthButtonProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  // Handler for connect action with error handling
  const handleConnectClick = async () => {
    try {
      setLocalError(null); // Reset any previous errors
      await onClick();
    } catch (error) {
      console.error('Error connecting to Pinterest:', error);
      setLocalError('Failed to connect to Pinterest. Please try again.');
    }
  };

  // Logout handler with confirmation
  const handleLogoutClick = () => {
    if (confirm('Are you sure you want to disconnect your account?')) {
      onLogout?.();
    }
  };

  if (isAuthenticated && username) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Connected as</p>
              <p className="font-medium text-gray-900">{username}</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Disconnect account"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleConnectClick}
        disabled={isLoading}
        aria-busy={isLoading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader className="animate-spin h-5 w-5 mr-3" />
            Connecting...
          </span>
        ) : (
          'Connect Pinterest Account'
        )}
      </button>
      {errorMessage && (
        <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
      )}
      {localError && (
        <p className="text-sm text-red-600 mt-2">{localError}</p>
      )}
    </div>
  );
}
