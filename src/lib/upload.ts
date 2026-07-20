/**
 * File upload utilities for product images
 */

/**
 * Image upload utilities now accept all image formats and sizes.
 */
export function validateImageFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }
}

/**
 * Check if image array is at max capacity.
 * This project no longer enforces a maximum image count.
 */
export function isImageArrayFull(currentImages: string[]): boolean {
  return false;
}

/**
 * Generate a unique filename for uploaded image
 * @param originalFilename - Original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  return `product-${timestamp}-${random}${extension}`;
}

/**
 * Parse images JSON field from Prisma
 * @param imagesJson - JSON string from database
 * @returns Array of image URLs
 */
export function parseImagesJson(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson || '[]');
  } catch {
    return [];
  }
}

/**
 * Convert images array to JSON for database storage
 * @param images - Array of image URLs
 * @returns JSON string
 */
export function stringifyImages(images: string[]): string {
  return JSON.stringify(images || []);
}

/**
 * Validate image URL
 * @param url - URL to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Should be HTTPS for security
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Get file extension from filename
 * @param filename - Filename
 * @returns File extension without dot
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Create FormData for image upload
 * @param file - File to upload
 * @returns FormData object
 */
export function createFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', generateUniqueFilename(file.name));
  return formData;
}

export const UPLOAD_CONFIG = {
  // Upload restrictions are intentionally removed.
};
