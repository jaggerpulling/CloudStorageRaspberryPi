/**
 * Data validation utilities for Cloud Storage Dashboard
 * 
 * These utilities ensure data integrity by validating storage data,
 * file items, and tab definitions according to the requirements.
 */

import type { StorageData, FileItem, TabDefinition } from '../types';

/**
 * Validates a FileItem object
 * 
 * Requirements: 4.2.1, 4.2.2, 4.2.3, 4.2.4, 4.2.5, 4.2.6
 * 
 * @param item - The file item to validate
 * @returns true if valid, false otherwise
 */
export function validateFileItem(item: unknown): item is FileItem {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const file = item as Partial<FileItem>;

  // 4.2.1: id must be non-empty unique string identifier
  if (typeof file.id !== 'string' || file.id.trim() === '') {
    return false;
  }

  // 4.2.2: name must be non-empty string with file name and extension
  if (typeof file.name !== 'string' || file.name.trim() === '') {
    return false;
  }

  // 4.2.3: size must be non-negative number representing file size in bytes
  if (typeof file.size !== 'number' || file.size < 0 || !Number.isFinite(file.size)) {
    return false;
  }

  // 4.2.4: type must be non-empty string representing MIME type or file extension
  if (typeof file.type !== 'string' || file.type.trim() === '') {
    return false;
  }

  // 4.2.5: lastModified must be Date object representing last modification time
  if (!(file.lastModified instanceof Date) || isNaN(file.lastModified.getTime())) {
    return false;
  }

  // 4.2.6: path must be non-empty string representing full file path
  if (typeof file.path !== 'string' || file.path.trim() === '') {
    return false;
  }

  return true;
}

/**
 * Validates a StorageData object
 * 
 * Requirements: 2.6.1, 2.6.2, 2.6.3, 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5
 * 
 * @param data - The storage data to validate
 * @returns An object with isValid flag and validated data (with invalid files filtered)
 */
export function validateStorageData(data: unknown): {
  isValid: boolean;
  data: StorageData | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Storage data must be an object');
    return { isValid: false, data: null, errors };
  }

  const storage = data as Partial<StorageData>;

  // 4.1.1: totalStorage must be positive number representing total capacity in bytes
  if (typeof storage.totalStorage !== 'number' || storage.totalStorage <= 0 || !Number.isFinite(storage.totalStorage)) {
    errors.push('totalStorage must be a positive number');
  }

  // 4.1.2: usedStorage must be non-negative number representing used space in bytes
  if (typeof storage.usedStorage !== 'number' || storage.usedStorage < 0 || !Number.isFinite(storage.usedStorage)) {
    errors.push('usedStorage must be a non-negative number');
  }

  // 2.6.2: Ensure used storage never exceeds total storage
  if (
    typeof storage.totalStorage === 'number' &&
    typeof storage.usedStorage === 'number' &&
    storage.usedStorage > storage.totalStorage
  ) {
    errors.push('usedStorage cannot exceed totalStorage');
  }

  // 4.1.3: files must be array of FileItem objects (may be empty)
  if (!Array.isArray(storage.files)) {
    errors.push('files must be an array');
  }

  // 4.1.4: storageByType must be object mapping file types to storage used in bytes
  if (!storage.storageByType || typeof storage.storageByType !== 'object' || Array.isArray(storage.storageByType)) {
    errors.push('storageByType must be an object');
  }

  // Validate storageByType values
  if (storage.storageByType && typeof storage.storageByType === 'object') {
    for (const [type, size] of Object.entries(storage.storageByType)) {
      if (typeof size !== 'number' || size < 0 || !Number.isFinite(size)) {
        errors.push(`storageByType['${type}'] must be a non-negative number`);
      }
    }

    // 2.6.3: Ensure storage by type sum does not exceed used storage
    const storageByTypeSum = Object.values(storage.storageByType).reduce((sum, val) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);

    if (typeof storage.usedStorage === 'number' && storageByTypeSum > storage.usedStorage) {
      errors.push('Sum of storageByType cannot exceed usedStorage');
    }
  }

  // 4.1.5: lastUpdated must be Date object representing last data fetch timestamp
  if (!(storage.lastUpdated instanceof Date) || isNaN(storage.lastUpdated.getTime())) {
    errors.push('lastUpdated must be a valid Date object');
  }

  // If there are critical errors, return early
  if (errors.length > 0) {
    return { isValid: false, data: null, errors };
  }

  // 2.6.4: Filter out invalid file items
  const validFiles: FileItem[] = [];
  const invalidFileCount = storage.files!.length;

  for (const file of storage.files!) {
    if (validateFileItem(file)) {
      validFiles.push(file as FileItem);
    }
  }

  const filteredCount = invalidFileCount - validFiles.length;
  if (filteredCount > 0) {
    errors.push(`Filtered out ${filteredCount} invalid file item(s)`);
  }

  // Return validated data with filtered files
  const validatedData: StorageData = {
    totalStorage: storage.totalStorage!,
    usedStorage: storage.usedStorage!,
    files: validFiles,
    storageByType: storage.storageByType!,
    lastUpdated: storage.lastUpdated!,
  };

  return {
    isValid: true,
    data: validatedData,
    errors: filteredCount > 0 ? errors : [],
  };
}

/**
 * Validates a TabDefinition object
 * 
 * Requirements: 4.3.1, 4.3.2, 4.3.3, 4.3.4, 4.3.5
 * 
 * @param tab - The tab definition to validate
 * @returns true if valid, false otherwise
 */
export function validateTabDefinition(tab: unknown): tab is TabDefinition {
  if (!tab || typeof tab !== 'object') {
    return false;
  }

  const tabDef = tab as Partial<TabDefinition>;

  // 4.3.1: id must be unique non-empty string identifier
  if (typeof tabDef.id !== 'string' || tabDef.id.trim() === '') {
    return false;
  }

  // 4.3.2: label must be non-empty string for display
  if (typeof tabDef.label !== 'string' || tabDef.label.trim() === '') {
    return false;
  }

  // 4.3.3: icon is optional string for icon name or SVG
  if (tabDef.icon !== undefined && typeof tabDef.icon !== 'string') {
    return false;
  }

  // 4.3.4: component must be valid Svelte component
  // We check if it's a function or object (Svelte components can be either)
  if (!tabDef.component || (typeof tabDef.component !== 'function' && typeof tabDef.component !== 'object')) {
    return false;
  }

  // 4.3.5: order is optional non-negative integer (default: 100)
  if (tabDef.order !== undefined) {
    if (typeof tabDef.order !== 'number' || tabDef.order < 0 || !Number.isInteger(tabDef.order)) {
      return false;
    }
  }

  return true;
}
