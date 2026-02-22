/**
 * Sorts an array of files by a specified field and order
 * 
 * @param files - Array of FileItem objects to sort
 * @param sortBy - Field to sort by: 'name', 'size', 'date', or 'type'
 * @param order - Sort order: 'asc' for ascending or 'desc' for descending
 * @returns New sorted array (original array is not modified)
 * 
 * @example
 * const files = [
 *   { id: '1', name: 'document.pdf', size: 1024, type: 'pdf', lastModified: new Date('2024-01-01'), path: '/docs/document.pdf' },
 *   { id: '2', name: 'image.jpg', size: 2048, type: 'jpg', lastModified: new Date('2024-01-02'), path: '/images/image.jpg' }
 * ];
 * 
 * sortFiles(files, 'name', 'asc') // Sorts by name A-Z
 * sortFiles(files, 'size', 'desc') // Sorts by size largest first
 * sortFiles(files, 'date', 'asc') // Sorts by date oldest first
 */

import type { FileItem, SortField, SortOrder } from '../types';

export function sortFiles(
  files: FileItem[],
  sortBy: SortField,
  order: SortOrder
): FileItem[] {
  // Validate inputs
  if (!Array.isArray(files)) {
    throw new Error('Files must be an array');
  }

  const validSortFields: SortField[] = ['name', 'size', 'date', 'type'];
  if (!validSortFields.includes(sortBy)) {
    throw new Error(`Invalid sortBy field: ${sortBy}. Must be one of: ${validSortFields.join(', ')}`);
  }

  if (order !== 'asc' && order !== 'desc') {
    throw new Error(`Invalid order: ${order}. Must be 'asc' or 'desc'`);
  }

  // Create a copy to avoid mutating the original array
  const sortedFiles = [...files];

  // Define comparator function
  sortedFiles.sort((a, b) => {
    let result: number;

    switch (sortBy) {
      case 'name':
        result = a.name.localeCompare(b.name);
        break;
      case 'size':
        result = a.size - b.size;
        break;
      case 'date':
        result = a.lastModified.getTime() - b.lastModified.getTime();
        break;
      case 'type':
        result = a.type.localeCompare(b.type);
        break;
      default:
        result = 0;
    }

    // Reverse the result if descending order
    return order === 'desc' ? -result : result;
  });

  return sortedFiles;
}
