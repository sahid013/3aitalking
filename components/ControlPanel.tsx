'use client';

import { useState, useRef } from 'react';
import { useAvatarStore } from '@/store/useAvatarStore';
import CameraControls from './CameraControls';

export default function ControlPanel() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, error, triggerLoad } = useAvatarStore();

  const handleLoadAvatar = () => {
    triggerLoad(avatarUrl || undefined);
  };

  const handleResetCamera = () => {
    useAvatarStore.getState().resetCamera();
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      alert('Please upload a .glb or .gltf file');
      return;
    }

    console.log('📤 Uploading file:', file.name);

    // Create object URL from file
    const objectUrl = URL.createObjectURL(file);
    console.log('🔗 Object URL created:', objectUrl);

    setAvatarUrl(objectUrl);
    setUploadedFileName(file.name);

    // Clear any existing avatar first, then load new one
    setTimeout(() => {
      console.log('🔄 Triggering load for uploaded file');
      triggerLoad(objectUrl);
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside className="w-80 bg-white/95 backdrop-blur-md shadow-xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Avatar Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary-600 border-b-2 border-primary-500 pb-2">
            Avatar Controls
          </h3>

          <button
            onClick={handleLoadAvatar}
            disabled={isLoading}
            className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-semibold
                     hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:-translate-y-0.5"
          >
            {isLoading ? 'Loading...' : 'Load Avatar'}
          </button>

          <button
            onClick={handleResetCamera}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold
                     hover:bg-gray-300 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Reset Camera
          </button>
        </div>

        {/* File Upload - Drag & Drop */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary-600 border-b-2 border-primary-500 pb-2">
            Upload GLB File
          </h3>

          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }
            `}
          >
            <div className="space-y-2">
              <div className="text-4xl">📁</div>
              <div className="text-sm font-medium text-gray-700">
                {uploadedFileName ? (
                  <span className="text-primary-600">✓ {uploadedFileName}</span>
                ) : (
                  <>
                    Drag & drop your .glb file here
                    <br />
                    <span className="text-gray-500">or click to browse</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {uploadedFileName && (
            <button
              onClick={() => triggerLoad(avatarUrl)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-semibold
                       hover:bg-blue-600 transition-all duration-200"
            >
              Reload Uploaded File
            </button>
          )}
        </div>

        {/* Avatar URL Input */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-600 border-b border-gray-300 pb-2">
            Or Use URL
          </h3>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Ready Player Me URL (optional)"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500
                     focus:outline-none transition-colors text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleLoadAvatar()}
          />
          <p className="text-xs text-gray-500">
            Leave empty to use default avatar
          </p>
        </div>

        {/* Camera Controls */}
        <CameraControls />

        {/* System Status */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary-600 border-b-2 border-primary-500 pb-2">
            System Status
          </h3>
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isLoading
                  ? 'bg-yellow-500 animate-pulse'
                  : error
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`}
            ></div>
            <span className="text-sm text-gray-700">
              {isLoading ? 'Loading...' : error ? error : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
