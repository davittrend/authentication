import React from 'react';
import { Pinterest } from 'lucide-react';

export function Header() {
  return (
    <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-r from-red-500 to-pink-500">
      <Pinterest className="w-16 h-16 mx-auto text-white mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">
        Pinterest Authentication
      </h1>
      <p className="text-red-100">
        Connect your Pinterest account securely
      </p>
    </div>
  );
}