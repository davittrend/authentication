import React from 'react';
import { Loader } from 'lucide-react';

interface AuthButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export function AuthButton({ isLoading, onClick }: AuthButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
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
  );
}