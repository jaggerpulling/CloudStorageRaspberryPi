/**
 * API integration utilities for fetching storage data
 * 
 * Requirements: 2.1.3, 2.6.1, 2.6.5
 */

import type { StorageData } from '../types';
import { validateStorageData } from './validation';
import { storageStore } from '../stores/storageStore';
import { uiStore } from '../stores/uiStore';

/**
 * Fetches storage data from the API endpoint
 * 
 * Requirements: 2.1.3, 2.6.1, 2.6.5
 * 
 * Preconditions:
 * - apiEndpoint is valid URL string
 * - Network connection is available
 * - API endpoint is accessible
 * 
 * Postconditions:
 * - Returns Promise resolving to valid StorageData
 * - If successful: storage store is updated with new data
 * - If error: error state is set with descriptive message
 * - lastUpdated timestamp is set to current time
 * - Loading state is set to false
 * 
 * @param apiEndpoint - The API endpoint URL to fetch data from
 * @returns Promise resolving to validated StorageData
 * @throws Error if fetch fails or data is invalid
 */
export async function fetchStorageData(apiEndpoint: string): Promise<StorageData> {
  // Set loading state
  uiStore.setLoading(true);
  uiStore.clearError();

  try {
    // Perform HTTP fetch
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const rawData = await response.json();

    // Convert date strings to Date objects if needed
    const dataWithDates = {
      ...rawData,
      lastUpdated: rawData.lastUpdated ? new Date(rawData.lastUpdated) : new Date(),
      files: Array.isArray(rawData.files)
        ? rawData.files.map((file: any) => ({
            ...file,
            lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
          }))
        : [],
    };

    // Validate response data structure
    const validation = validateStorageData(dataWithDates);

    if (!validation.isValid || !validation.data) {
      throw new Error(`Invalid storage data received: ${validation.errors.join(', ')}`);
    }

    // Log warnings if files were filtered
    if (validation.errors.length > 0) {
      console.warn('Storage data validation warnings:', validation.errors);
    }

    // Update lastUpdated timestamp to current time
    const validatedData: StorageData = {
      ...validation.data,
      lastUpdated: new Date(),
    };

    // Update storage store on success
    storageStore.set(validatedData);

    // Clear loading state
    uiStore.setLoading(false);

    return validatedData;
  } catch (error) {
    // Update error state with descriptive message
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch storage data';
    uiStore.setError(errorMessage);
    uiStore.setLoading(false);

    throw error;
  }
}
