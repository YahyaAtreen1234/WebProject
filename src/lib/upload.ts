/**
 * File upload utilities for product images
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES_PER_PRODUCT = 5;

/**
 * Validate image file
 * @param file - File to validate
 * @throws Error if file is invalid
 */
export function validateImageFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  // Additional validation: check file extension
  const filename = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExtension = validExtensions.some((ext) => filename.endsWith(ext));

  if (!hasValidExtension) {
    throw new Error('Invalid file extension');
  }
}

/**
 * Check if image array is at max capacity
 * @param currentImages - Array of current image URLs
 * @returns true if at max capacity, false otherwise
 */
export function isImageArrayFull(currentImages: string[]): boolean {
  return currentImages.length >= MAX_IMAGES_PER_PRODUCT;
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
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
  MAX_IMAGES_PER_PRODUCT,
};
