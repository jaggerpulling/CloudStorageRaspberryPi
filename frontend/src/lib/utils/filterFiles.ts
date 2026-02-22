/**
 * Filters an array of files based on search text
 * 
 * Performs case-insensitive search on both file name and path.
 * Returns a new array without modifying the original.
 * 
 * @param files - Array of FileItem objects to filter
 * @param filterText - Text to search for (case-insensitive)
 * @returns New filtered array containing only matching files
 * 
 * @example
 * const files = [
 *   { id: '1', name: 'document.pdf', size: 1024, type: 'pdf', lastModified: new Date(), path: '/docs/document.pdf' },
 *   { id: '2', name: 'image.jpg', size: 2048, type: 'jpg', lastModified: new Date(), path: '/images/image.jpg' },
 *   { id: '3', name: 'report.pdf', size: 3072, type: 'pdf', lastModified: new Date(), path: '/reports/report.pdf' }
 * ];
 * 
 * filterFiles(files, 'pdf') // Returns document.pdf and report.pdf
 * filterFiles(files, 'image') // Returns image.jpg (matches name and path)
 * filterFiles(files, '') // Returns all files (empty filter)
 */

import type { FileItem } from '../types';

export function filterFiles(
  files: FileItem[],
  filterText: string
): FileItem[] {
  // Validate inputs
  if (!Array.isArray(files)) {
    throw new Error('Files must be an array');
  }

  if (typeof filterText !== 'string') {
    throw new Error('Filter text must be a string');
  }

  // Handle empty filter - return all files
  const trimmedFilter = filterText.trim();
  if (trimmedFilter === '') {
    return [...files];
  }

  // Normalize filter text for case-insensitive comparison
  const normalizedFilter = trimmedFilter.toLowerCase();

  // Filter files based on name and path
  return files.filter((file) => {
    const nameMatch = file.name.toLowerCase().includes(normalizedFilter);
    const pathMatch = file.path.toLowerCase().includes(normalizedFilter);
    
    return nameMatch || pathMatch;
  });
}
