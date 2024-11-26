import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { Calendar, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '../../store/store';
import { addScheduledPin } from '../../store/slices/schedulerSlice';
import toast from 'react-hot-toast';

export function PinScheduler() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { items: boards } = useSelector((state: RootState) => state.boards);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      // In a real app, you'd upload the file to a server here
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !imageUrl || !selectedBoard || !scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newPin = {
      id: Date.now().toString(),
      title,
      description,
      link,
      imageUrl,
      boardId: selectedBoard,
      scheduledTime,
      status: 'pending' as const
    };

    dispatch(addScheduledPin(newPin));
    toast.success('Pin scheduled successfully');

    // Reset form
    setTitle('');
    setDescription('');
    setLink('');
    setImageUrl('');
    setScheduledTime('');
    setSelectedBoard('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Schedule New Pin</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div {...getRootProps()} className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}
        `}>
          <input {...getInputProps()} />
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag & drop an image here, or click to select
          </p>
        </div>

        {imageUrl && (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Link (optional)</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <LinkIcon className="h-4 w-4" />
              </span>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="">Select a board</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Schedule Pin
          </button>
        </div>
      </form>
    </div>
  );
}