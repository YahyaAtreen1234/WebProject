'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  altText?: string;
  showThumbnails?: boolean;
  onImageClick?: (imageUrl: string, index: number) => void;
  editable?: boolean;
  onRemoveImage?: (imageUrl: string) => void;
}

export default function ProductImageGallery({
  images,
  altText = 'Product image',
  showThumbnails = true,
  onImageClick,
  editable = false,
  onRemoveImage,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const displayImages = images && images.length > 0 ? images : ['/placeholder-product.jpg'];
  const mainImage = displayImages[selectedIndex];

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setZoomLevel(1);
    if (onImageClick) {
      onImageClick(displayImages[index], index);
    }
  };

  const handleRemove = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    if (onRemoveImage) {
      onRemoveImage(imageUrl);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      if (direction === 'in') {
        return Math.min(prev + 0.2, 3);
      } else {
        return Math.max(prev - 0.2, 1);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
        <div className="relative w-full h-full overflow-auto flex items-center justify-center">
          <img
            src={mainImage}
            alt={altText}
            className="object-contain transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          />

          {/* Zoom Controls */}
          {zoomLevel > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleZoom('out')}
                className="bg-white hover:bg-gray-100 p-2 rounded shadow"
                title="Zoom out"
              >
                −
              </button>
              <button
                onClick={() => handleZoom('in')}
                className="bg-white hover:bg-gray-100 p-2 rounded shadow"
                title="Zoom in"
              >
                +
              </button>
            </div>
          )}

          {zoomLevel < 3 && (
            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded text-sm text-gray-600">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}
        </div>

        {/* Remove Button (Edit Mode) */}
        {editable && onRemoveImage && images.length > 1 && (
          <button
            onClick={(e) => handleRemove(e, mainImage)}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow"
            title="Remove image"
          >
            ✕
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <div
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                selectedIndex === index
                  ? 'border-yellow-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${altText} ${index + 1}`}
                className="object-cover w-full h-full"
              />

              {/* Remove Button on Thumbnail (Edit Mode) */}
              {editable && onRemoveImage && images.length > 1 && (
                <button
                  onClick={(e) => handleRemove(e, image)}
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {displayImages.length > 1 && (
        <div className="text-sm text-gray-600 text-center">
          {selectedIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  );
}
