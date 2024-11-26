import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { PinScheduler } from '../components/Scheduler/PinScheduler';
import { setBoards, setBoardsLoading, setBoardsError } from '../store/slices/boardsSlice';
import { RootState } from '../store/store';
import toast from 'react-hot-toast';

function DashboardPage() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.auth);
  const { items: boards, isLoading, error } = useSelector((state: RootState) => state.boards);

  useEffect(() => {
    async function fetchBoards() {
      if (!userData?.token?.access_token || boards.length > 0) return;

      dispatch(setBoardsLoading(true));
      try {
        const response = await fetch('/api/pinterest-auth?path=/boards', {
          headers: {
            'Authorization': `Bearer ${userData.token.access_token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch boards');
        }

        dispatch(setBoards(data.items));
      } catch (error) {
        console.error('Error fetching boards:', error);
        dispatch(setBoardsError(error instanceof Error ? error.message : 'Failed to fetch boards'));
        toast.error('Failed to load Pinterest boards');
      } finally {
        dispatch(setBoardsLoading(false));
      }
    }

    fetchBoards();
  }, [dispatch, userData?.token?.access_token]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-red-500 hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!boards.length) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pinterest Boards Found</h3>
          <p className="text-gray-500">
            Please create at least one board on Pinterest before scheduling pins.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PinScheduler />
    </DashboardLayout>
  );
}

export default DashboardPage;