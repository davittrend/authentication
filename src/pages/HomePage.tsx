import React from 'react';
import { Header } from '../components/Header';
import { Features } from '../components/Features';
import { AuthButton } from '../components/AuthButton';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const { isLoading, isAuthenticated, handleAuth } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <Header />
          <div className="p-8">
            <Features isAuthenticated={isAuthenticated} />
            <div className="mt-6">
              <AuthButton isLoading={isLoading} onClick={handleAuth} />
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;