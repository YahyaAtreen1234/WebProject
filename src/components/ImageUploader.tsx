'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onImageSelect, currentImage }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated. Please login as admin.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(data.error || `Upload failed (${response.status})`);
      }

      const data = await response.json();
      setPreview(data.url);
      onImageSelect(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview('');
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white mb-2">Product Image</label>

      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-sapphire-500/30 bg-midnight-800">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 px-2 py-1 bg-rose-600 text-white rounded text-xs hover:bg-rose-700"
          >
            ✕ Remove
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50 font-semibold"
        >
          {uploading ? '⏳ Uploading...' : '📸 Choose Image'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-midnight-400">
        Supported: JPEG, PNG, WebP, GIF (Max 5MB)
      </p>
    </div>
  );
}
