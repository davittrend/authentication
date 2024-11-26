import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { CircleUserRound, LogOut } from 'lucide-react';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export function DashboardHeader() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('pinterest_auth');
    dispatch(logout());
    toast.success('Successfully logged out');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <CircleUserRound className="h-8 w-8 text-red-500" />
            <span className="font-semibold text-xl">Pinterest Manager</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">Signed in as </span>
              <span className="font-medium text-gray-900">{userData?.user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}