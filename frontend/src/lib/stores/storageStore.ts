/**
 * Storage Data Store
 * 
 * Writable store for managing StorageData with validation and helper methods.
 * 
 * Requirements: 2.1.5, 2.6.1, 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5
 */

import { writable, derived } from 'svelte/store';
import type { StorageData, FileItem } from '../types';
import { validateStorageData } from '../utils/validation';

/**
 * Initial storage data state
 */
const initialStorageData: StorageData = {
  totalStorage: 15 * 1024 ** 3, // 15 GB
  usedStorage: 1024 ** 3,       // 1 GB used
  files: [],
  storageByType: {
    documents: 512 * 1024 ** 2, // 0.5 GB
    images: 256 * 1024 ** 2,    // 0.25 GB
    videos: 256 * 1024 ** 2,    // 0.25 GB
  },
  lastUpdated: new Date(),
};

/**
 * Creates a storage data store with validation and helper methods
 */
function createStorageStore() {
  const { subscribe, set: baseSet, update: baseUpdate } = writable<StorageData>(initialStorageData);

  // Custom set with validation
  const customSet = (data: StorageData) => {
  // Ensure storageByType sum does not exceed usedStorage
  let fixedData = { ...data };
  const sum = Object.values(fixedData.storageByType).reduce((a, b) => a + b, 0);

  if (sum > fixedData.usedStorage && sum > 0) {
    const scale = fixedData.usedStorage / sum;
    fixedData.storageByType = Object.fromEntries(
      Object.entries(fixedData.storageByType).map(([k, v]) => [k, Math.floor(v * scale)])
    );
  }

  const validation = validateStorageData(fixedData);

  if (!validation.isValid || !validation.data) {
    console.error('Invalid storage data after fix:', validation.errors);
    throw new Error(`Invalid storage data: ${validation.errors.join(', ')}`);
  }

  baseSet(validation.data);
};

  // Custom update with validation
  const customUpdate = (updater: (data: StorageData) => StorageData) => {
  baseUpdate((currentData) => {
    const newData = updater(currentData);

    // Clamp storageByType sum
    let fixedData = { ...newData };
    const sum = Object.values(fixedData.storageByType).reduce((a, b) => a + b, 0);
    if (sum > fixedData.usedStorage && sum > 0) {
      const scale = fixedData.usedStorage / sum;
      fixedData.storageByType = Object.fromEntries(
        Object.entries(fixedData.storageByType).map(([k, v]) => [k, Math.floor(v * scale)])
      );
    }

    const validation = validateStorageData(fixedData);

    if (!validation.isValid || !validation.data) {
      console.error('Invalid storage data update after fix:', validation.errors);
      throw new Error(`Invalid storage data: ${validation.errors.join(', ')}`);
    }

    return validation.data;
  });
};

  return {
    subscribe,

    /**
     * Sets storage data with validation
     * 
     * Requirements: 2.6.1, 2.6.2, 2.6.3, 2.6.4
     * 
     * @param data - The storage data to set
     * @throws Error if data is invalid
     */
    set: customSet,

    /**
     * Updates storage data with validation
     * 
     * Requirements: 2.6.1
     * 
     * @param updater - Function that receives current data and returns updated data
     * @throws Error if data is invalid
     */
    update: customUpdate,

    /**
     * Updates used storage amount
     * 
     * Requirements: 4.1.2, 2.6.2
     * 
     * @param usedStorage - New used storage value in bytes
     * @throws Error if validation fails
     */
    updateUsedStorage: (usedStorage: number) => {
      customUpdate((data) => ({
        ...data,
        usedStorage,
        lastUpdated: new Date(),
      }));
    },

    /**
     * Updates total storage capacity
     * 
     * Requirements: 4.1.1
     * 
     * @param totalStorage - New total storage value in bytes
     * @throws Error if validation fails
     */
    updateTotalStorage: (totalStorage: number) => {
      customUpdate((data) => ({
        ...data,
        totalStorage,
        lastUpdated: new Date(),
      }));
    },

    /**
     * Updates the files array
     * 
     * Requirements: 4.1.3, 2.6.4
     * 
     * @param files - New files array
     * @throws Error if validation fails
     */
    updateFiles: (files: FileItem[]) => {
      customUpdate((data) => ({
        ...data,
        files,
        lastUpdated: new Date(),
      }));
    },

    /**
     * Adds a file to the files array
     * 
     * Requirements: 4.1.3
     * 
     * @param file - File to add
     * @throws Error if validation fails
     */
    addFile: (file: FileItem) => {
      customUpdate((data) => ({
        ...data,
        files: [...data.files, file],
        lastUpdated: new Date(),
      }));
    },

    /**
     * Removes a file from the files array by ID
     * 
     * Requirements: 4.1.3
     * 
     * @param fileId - ID of file to remove
     */
    removeFile: (fileId: string) => {
      customUpdate((data) => ({
        ...data,
        files: data.files.filter((f) => f.id !== fileId),
        lastUpdated: new Date(),
      }));
    },

    /**
     * Updates storage by type breakdown
     * 
     * Requirements: 4.1.4, 2.6.3
     * 
     * @param storageByType - New storage by type mapping
     * @throws Error if validation fails
     */
    updateStorageByType: (storageByType: Record<string, number>) => {
  customUpdate((data) => {
    // Calculate the sum of new storageByType
    const sum = Object.values(storageByType).reduce((a, b) => a + b, 0);

    let fixedStorageByType = { ...storageByType };

    // If sum > usedStorage, scale it down proportionally
    if (sum > data.usedStorage && sum > 0) {
      const scale = data.usedStorage / sum;
      fixedStorageByType = Object.fromEntries(
        Object.entries(storageByType).map(([k, v]) => [k, Math.floor(v * scale)])
      );
    }

    return {
      ...data,
      storageByType: fixedStorageByType,
      lastUpdated: new Date(),
    };
  });
},

    /**
     * Updates the last updated timestamp
     * 
     * Requirements: 4.1.5, 2.6.5
     */
    updateTimestamp: () => {
      baseUpdate((data) => ({
        ...data,
        lastUpdated: new Date(),
      }));
    },

    /**
     * Resets the store to initial state
     */
    reset: () => {
      baseSet({
        ...initialStorageData,
        lastUpdated: new Date(),
      });
    },
  };
}

/**
 * Storage data store instance
 */
export const storageStore = createStorageStore();

/**
 * Derived store for storage usage percentage
 * 
 * Requirements: 2.3.4
 * 
 * @returns Percentage of storage used (0-100)
 */
export const storagePercentage = derived(storageStore, ($storageStore) => {
  if ($storageStore.totalStorage === 0) {
    return 0;
  }
  return ($storageStore.usedStorage / $storageStore.totalStorage) * 100;
});

/**
 * Derived store for available storage
 * 
 * Requirements: 2.3.3
 * 
 * @returns Available storage in bytes
 */
export const availableStorage = derived(storageStore, ($storageStore) => {
  return $storageStore.totalStorage - $storageStore.usedStorage;
});
