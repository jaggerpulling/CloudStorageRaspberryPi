/**
 * Tests for fetchStorageData function
 * 
 * Requirements: 2.1.3, 2.6.1, 2.6.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchStorageData } from './fetchStorageData';
import { storageStore } from '../stores/storageStore';
import { uiStore } from '../stores/uiStore';
import { get } from 'svelte/store';

// Mock fetch globally
global.fetch = vi.fn();

describe('fetchStorageData', () => {
  beforeEach(() => {
    // Reset stores before each test
    storageStore.reset();
    uiStore.reset();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should fetch and update storage store on success', async () => {
    // Arrange
    const mockData = {
      totalStorage: 1000000000,
      usedStorage: 500000000,
      files: [
        {
          id: '1',
          name: 'test.txt',
          size: 1024,
          type: 'text/plain',
          lastModified: '2024-01-01T00:00:00.000Z',
          path: '/test.txt',
        },
      ],
      storageByType: {
        'text/plain': 1024,
      },
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    // Act
    const result = await fetchStorageData('https://api.example.com/storage');

    // Assert
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/storage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check returned data
    expect(result.totalStorage).toBe(1000000000);
    expect(result.usedStorage).toBe(500000000);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].name).toBe('test.txt');
    expect(result.files[0].lastModified).toBeInstanceOf(Date);
    expect(result.lastUpdated).toBeInstanceOf(Date);

    // Check store was updated
    const storeData = get(storageStore);
    expect(storeData.totalStorage).toBe(1000000000);
    expect(storeData.usedStorage).toBe(500000000);
    expect(storeData.files).toHaveLength(1);

    // Check UI state
    const uiState = get(uiStore);
    expect(uiState.isLoading).toBe(false);
    expect(uiState.error).toBeNull();
  });

  it('should set loading state during fetch', async () => {
    // Arrange
    const mockData = {
      totalStorage: 1000000000,
      usedStorage: 500000000,
      files: [],
      storageByType: {},
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    let loadingDuringFetch = false;

    (global.fetch as any).mockImplementationOnce(async () => {
      // Check loading state during fetch
      const uiState = get(uiStore);
      loadingDuringFetch = uiState.isLoading;

      return {
        ok: true,
        status: 200,
        json: async () => mockData,
      };
    });

    // Act
    await fetchStorageData('https://api.example.com/storage');

    // Assert
    expect(loadingDuringFetch).toBe(true);
    expect(get(uiStore).isLoading).toBe(false);
  });

  it('should handle HTTP error responses', async () => {
    // Arrange
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // Act & Assert
    await expect(fetchStorageData('https://api.example.com/storage')).rejects.toThrow(
      'HTTP error! status: 404'
    );

    // Check error state was set
    const uiState = get(uiStore);
    expect(uiState.isLoading).toBe(false);
    expect(uiState.error).toBe('HTTP error! status: 404');
  });

  it('should handle network errors', async () => {
    // Arrange
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    // Act & Assert
    await expect(fetchStorageData('https://api.example.com/storage')).rejects.toThrow('Network error');

    // Check error state was set
    const uiState = get(uiStore);
    expect(uiState.isLoading).toBe(false);
    expect(uiState.error).toBe('Network error');
  });

  it('should handle invalid data structure', async () => {
    // Arrange
    const invalidData = {
      totalStorage: -1000, // Invalid: must be positive
      usedStorage: 500,
      files: [],
      storageByType: {},
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidData,
    });

    // Act & Assert
    await expect(fetchStorageData('https://api.example.com/storage')).rejects.toThrow(
      'Invalid storage data received'
    );

    // Check error state was set
    const uiState = get(uiStore);
    expect(uiState.isLoading).toBe(false);
    expect(uiState.error).toContain('Invalid storage data received');
  });

  it('should filter out invalid files and log warnings', async () => {
    // Arrange
    const mockData = {
      totalStorage: 1000000000,
      usedStorage: 500000000,
      files: [
        {
          id: '1',
          name: 'valid.txt',
          size: 1024,
          type: 'text/plain',
          lastModified: '2024-01-01T00:00:00.000Z',
          path: '/valid.txt',
        },
        {
          id: '2',
          name: '', // Invalid: empty name
          size: 2048,
          type: 'text/plain',
          lastModified: '2024-01-01T00:00:00.000Z',
          path: '/invalid.txt',
        },
        {
          id: '3',
          name: 'another-valid.txt',
          size: 512,
          type: 'text/plain',
          lastModified: '2024-01-01T00:00:00.000Z',
          path: '/another-valid.txt',
        },
      ],
      storageByType: {
        'text/plain': 3584,
      },
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    // Spy on console.warn
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    const result = await fetchStorageData('https://api.example.com/storage');

    // Assert
    expect(result.files).toHaveLength(2); // Only valid files
    expect(result.files[0].name).toBe('valid.txt');
    expect(result.files[1].name).toBe('another-valid.txt');

    // Check that warning was logged
    expect(warnSpy).toHaveBeenCalledWith(
      'Storage data validation warnings:',
      expect.arrayContaining([expect.stringContaining('Filtered out 1 invalid file item')])
    );

    warnSpy.mockRestore();
  });

  it('should convert date strings to Date objects', async () => {
    // Arrange
    const mockData = {
      totalStorage: 1000000000,
      usedStorage: 500000000,
      files: [
        {
          id: '1',
          name: 'test.txt',
          size: 1024,
          type: 'text/plain',
          lastModified: '2024-01-15T10:30:00.000Z',
          path: '/test.txt',
        },
      ],
      storageByType: {
        'text/plain': 1024,
      },
      lastUpdated: '2024-01-15T10:30:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    // Act
    const result = await fetchStorageData('https://api.example.com/storage');

    // Assert
    expect(result.lastUpdated).toBeInstanceOf(Date);
    expect(result.files[0].lastModified).toBeInstanceOf(Date);
  });

  it('should update lastUpdated timestamp to current time', async () => {
    // Arrange
    const mockData = {
      totalStorage: 1000000000,
      usedStorage: 500000000,
      files: [],
      storageByType: {},
      lastUpdated: '2024-01-01T00:00:00.000Z', // Old timestamp
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const beforeFetch = new Date();

    // Act
    const result = await fetchStorageData('https://api.example.com/storage');

    const afterFetch = new Date();

    // Assert
    expect(result.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeFetch.getTime());
    expect(result.lastUpdated.getTime()).toBeLessThanOrEqual(afterFetch.getTime());
  });

  it('should clear error state before fetching', async () => {
    // Arrange
    uiStore.setError('Previous error');

    const mockData = {
      totalStorage: 1000000000,
      usedStorage: 500000000,
      files: [],
      storageByType: {},
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    // Act
    await fetchStorageData('https://api.example.com/storage');

    // Assert
    const uiState = get(uiStore);
    expect(uiState.error).toBeNull();
  });

  it('should handle usedStorage exceeding totalStorage', async () => {
    // Arrange
    const invalidData = {
      totalStorage: 1000,
      usedStorage: 2000, // Invalid: exceeds total
      files: [],
      storageByType: {},
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidData,
    });

    // Act & Assert
    await expect(fetchStorageData('https://api.example.com/storage')).rejects.toThrow(
      'Invalid storage data received'
    );
  });

  it('should handle storageByType sum exceeding usedStorage', async () => {
    // Arrange
    const invalidData = {
      totalStorage: 1000000,
      usedStorage: 1000,
      files: [],
      storageByType: {
        'text/plain': 800,
        'image/png': 500, // Sum = 1300, exceeds usedStorage
      },
      lastUpdated: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidData,
    });

    // Act & Assert
    await expect(fetchStorageData('https://api.example.com/storage')).rejects.toThrow(
      'Invalid storage data received'
    );
  });
});
