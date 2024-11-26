import React from 'react';
import { Header } from '../components/Header';
import { Features } from '../components/Features';
import { AuthButton } from '../components/AuthButton';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const { isLoading, isAuthenticated, userData, handleAuth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <Header />
          <div className="p-8">
            <Features isAuthenticated={isAuthenticated} />
            <div className="mt-6">
              <AuthButton 
                isLoading={isLoading}
                isAuthenticated={isAuthenticated}
                onClick={handleAuth}
                onLogout={logout}
                username={userData?.user?.username}
              />
            </div>
            {isAuthenticated && userData?.user && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Account Details</h3>
                <dl className="space-y-1">
                  <div className="flex text-sm">
                    <dt className="text-gray-500 w-24">Username:</dt>
                    <dd className="text-gray-900">{userData.user.username}</dd>
                  </div>
                  {userData.user.first_name && (
                    <div className="flex text-sm">
                      <dt className="text-gray-500 w-24">Name:</dt>
                      <dd className="text-gray-900">
                        {`${userData.user.first_name} ${userData.user.last_name || ''}`}
                      </dd>
                    </div>
                  )}
                  {userData.user.account_type && (
                    <div className="flex text-sm">
                      <dt className="text-gray-500 w-24">Account Type:</dt>
                      <dd className="text-gray-900">{userData.user.account_type}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;