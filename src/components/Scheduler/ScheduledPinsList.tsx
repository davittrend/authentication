import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Trash2, SendHorizonal, Clock } from 'lucide-react';
import { RootState } from '../../store/store';
import { removeScheduledPin, updateScheduledPin } from '../../store/slices/schedulerSlice';
import toast from 'react-hot-toast';

export function ScheduledPinsList() {
  const dispatch = useDispatch();
  const { scheduledPins } = useSelector((state: RootState) => state.scheduler);
  const { items: boards } = useSelector((state: RootState) => state.boards);
  const { userData } = useSelector((state: RootState) => state.auth);

  const handleDelete = (pinId: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled pin?')) {
      dispatch(removeScheduledPin(pinId));
      toast.success('Pin deleted successfully');
    }
  };

  const handlePublishNow = async (pin: any) => {
    if (!userData?.token?.access_token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/pinterest-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token.access_token}`
        },
        body: JSON.stringify({ pin })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish pin');
      }

      // Update pin status in Redux store
      dispatch(updateScheduledPin({
        ...pin,
        status: 'published',
        publishedAt: new Date().toISOString(),
        pinterestId: data.id // Store Pinterest's pin ID
      }));

      toast.success('Pin published successfully to Pinterest');
    } catch (error) {
      console.error('Publish error:', error);
      
      // Check if it's a token expiration error
      if (error instanceof Error && error.message.includes('token')) {
        // Try to refresh the token
        try {
          const refreshResponse = await fetch(`/api/pinterest-auth?path=/token&refresh_token=${userData.token.refresh_token}`);
          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok && refreshData.token) {
            // Update token in localStorage
            const updatedAuth = {
              ...userData,
              token: {
                ...userData.token,
                ...refreshData.token
              }
            };
            localStorage.setItem('pinterest_auth', JSON.stringify(updatedAuth));
            
            // Retry publishing with new token
            await handlePublishNow(pin);
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          toast.error('Session expired. Please log in again.');
          return;
        }
      }

      dispatch(updateScheduledPin({
        ...pin,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to publish pin'
      }));

      toast.error('Failed to publish pin');
    }
  };

  const getBoardName = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    return board?.name || 'Unknown Board';
  };

  if (scheduledPins.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled pins</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new scheduled pin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Scheduled Pins</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {scheduledPins.map((pin) => (
            <div key={pin.id} className="p-6 flex items-start space-x-6">
              <div className="flex-shrink-0 w-24 h-24">
                <img
                  src={pin.imageUrl}
                  alt={pin.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900 truncate">
                    {pin.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePublishNow(pin)}
                      disabled={pin.status === 'published'}
                      className={`p-2 rounded-lg text-sm font-medium ${
                        pin.status === 'published'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={pin.status === 'published' ? 'Already published' : 'Publish now'}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete pin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {pin.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(pin.scheduledTime), 'MMM d, yyyy h:mm a')}
                  </span>
                  <span>•</span>
                  <span>{getBoardName(pin.boardId)}</span>
                  <span>•</span>
                  <span className={`capitalize ${
                    pin.status === 'published' ? 'text-green-600' :
                    pin.status === 'failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {pin.status}
                  </span>
                </div>
                {pin.link && (
                  <div className="mt-2">
                    <a
                      href={pin.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {pin.link}
                    </a>
                  </div>
                )}
                {pin.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {pin.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}