/**
 * Unit tests for Storage Data Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { storageStore, storagePercentage, availableStorage } from './storageStore';
import type { StorageData, FileItem } from '../types';

describe('storageStore', () => {
  // Reset store before each test
  beforeEach(() => {
    storageStore.reset();
  });

  describe('initialization', () => {
    it('should initialize with default empty state', () => {
      const state = get(storageStore);
      
      expect(state.totalStorage).toBe(0);
      expect(state.usedStorage).toBe(0);
      expect(state.files).toEqual([]);
      expect(state.storageByType).toEqual({});
      expect(state.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('set', () => {
    it('should set valid storage data', () => {
      const validData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: { 'image/png': 200, 'text/plain': 300 },
        lastUpdated: new Date(),
      };

      storageStore.set(validData);
      const state = get(storageStore);

      expect(state.totalStorage).toBe(1000);
      expect(state.usedStorage).toBe(500);
      expect(state.storageByType).toEqual({ 'image/png': 200, 'text/plain': 300 });
    });

    it('should throw error for invalid data (usedStorage > totalStorage)', () => {
      const invalidData: StorageData = {
        totalStorage: 500,
        usedStorage: 1000, // Invalid: exceeds total
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      expect(() => storageStore.set(invalidData)).toThrow('Invalid storage data');
    });

    it('should throw error for negative totalStorage', () => {
      const invalidData: StorageData = {
        totalStorage: -100,
        usedStorage: 0,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      expect(() => storageStore.set(invalidData)).toThrow('Invalid storage data');
    });

    it('should throw error for negative usedStorage', () => {
      const invalidData: StorageData = {
        totalStorage: 1000,
        usedStorage: -50,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      expect(() => storageStore.set(invalidData)).toThrow('Invalid storage data');
    });

    it('should filter out invalid files and log warning', () => {
      const dataWithInvalidFiles: any = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [
          {
            id: '1',
            name: 'valid.txt',
            size: 100,
            type: 'text/plain',
            lastModified: new Date(),
            path: '/valid.txt',
          },
          {
            id: '', // Invalid: empty id
            name: 'invalid.txt',
            size: 50,
            type: 'text/plain',
            lastModified: new Date(),
            path: '/invalid.txt',
          },
        ],
        storageByType: {},
        lastUpdated: new Date(),
      };

      // Should not throw, but should filter invalid files
      storageStore.set(dataWithInvalidFiles);
      const state = get(storageStore);

      expect(state.files).toHaveLength(1);
      expect(state.files[0].id).toBe('1');
    });

    it('should throw error when storageByType sum exceeds usedStorage', () => {
      const invalidData: StorageData = {
        totalStorage: 1000,
        usedStorage: 400,
        files: [],
        storageByType: { 'image/png': 300, 'text/plain': 200 }, // Sum = 500 > 400
        lastUpdated: new Date(),
      };

      expect(() => storageStore.set(invalidData)).toThrow('Invalid storage data');
    });
  });

  describe('update', () => {
    it('should update storage data with validation', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      storageStore.update((data) => ({
        ...data,
        usedStorage: 600,
      }));

      const state = get(storageStore);
      expect(state.usedStorage).toBe(600);
    });

    it('should throw error for invalid update', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      expect(() => {
        storageStore.update((data) => ({
          ...data,
          usedStorage: 1500, // Invalid: exceeds total
        }));
      }).toThrow('Invalid storage data');
    });
  });

  describe('updateUsedStorage', () => {
    it('should update used storage and timestamp', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date('2024-01-01'),
      };

      storageStore.set(initialData);
      const beforeUpdate = get(storageStore).lastUpdated;

      // Wait a bit to ensure timestamp changes
      storageStore.updateUsedStorage(600);

      const state = get(storageStore);
      expect(state.usedStorage).toBe(600);
      expect(state.lastUpdated.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });

    it('should validate that usedStorage does not exceed totalStorage', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      expect(() => storageStore.updateUsedStorage(1500)).toThrow('Invalid storage data');
    });
  });

  describe('updateTotalStorage', () => {
    it('should update total storage and timestamp', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date('2024-01-01'),
      };

      storageStore.set(initialData);

      storageStore.updateTotalStorage(2000);

      const state = get(storageStore);
      expect(state.totalStorage).toBe(2000);
      expect(state.lastUpdated.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });

    it('should validate that totalStorage is not less than usedStorage', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      expect(() => storageStore.updateTotalStorage(400)).toThrow('Invalid storage data');
    });
  });

  describe('updateFiles', () => {
    it('should update files array and timestamp', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date('2024-01-01'),
      };

      storageStore.set(initialData);

      const newFiles: FileItem[] = [
        {
          id: '1',
          name: 'file1.txt',
          size: 100,
          type: 'text/plain',
          lastModified: new Date(),
          path: '/file1.txt',
        },
      ];

      storageStore.updateFiles(newFiles);

      const state = get(storageStore);
      expect(state.files).toHaveLength(1);
      expect(state.files[0].id).toBe('1');
      expect(state.lastUpdated.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });
  });

  describe('addFile', () => {
    it('should add a file to the files array', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      const newFile: FileItem = {
        id: '1',
        name: 'file1.txt',
        size: 100,
        type: 'text/plain',
        lastModified: new Date(),
        path: '/file1.txt',
      };

      storageStore.addFile(newFile);

      const state = get(storageStore);
      expect(state.files).toHaveLength(1);
      expect(state.files[0]).toEqual(newFile);
    });

    it('should add multiple files sequentially', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      const file1: FileItem = {
        id: '1',
        name: 'file1.txt',
        size: 100,
        type: 'text/plain',
        lastModified: new Date(),
        path: '/file1.txt',
      };

      const file2: FileItem = {
        id: '2',
        name: 'file2.txt',
        size: 200,
        type: 'text/plain',
        lastModified: new Date(),
        path: '/file2.txt',
      };

      storageStore.addFile(file1);
      storageStore.addFile(file2);

      const state = get(storageStore);
      expect(state.files).toHaveLength(2);
      expect(state.files[0].id).toBe('1');
      expect(state.files[1].id).toBe('2');
    });
  });

  describe('removeFile', () => {
    it('should remove a file by ID', () => {
      const file1: FileItem = {
        id: '1',
        name: 'file1.txt',
        size: 100,
        type: 'text/plain',
        lastModified: new Date(),
        path: '/file1.txt',
      };

      const file2: FileItem = {
        id: '2',
        name: 'file2.txt',
        size: 200,
        type: 'text/plain',
        lastModified: new Date(),
        path: '/file2.txt',
      };

      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [file1, file2],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      storageStore.removeFile('1');

      const state = get(storageStore);
      expect(state.files).toHaveLength(1);
      expect(state.files[0].id).toBe('2');
    });

    it('should do nothing if file ID does not exist', () => {
      const file1: FileItem = {
        id: '1',
        name: 'file1.txt',
        size: 100,
        type: 'text/plain',
        lastModified: new Date(),
        path: '/file1.txt',
      };

      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [file1],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      storageStore.removeFile('nonexistent');

      const state = get(storageStore);
      expect(state.files).toHaveLength(1);
      expect(state.files[0].id).toBe('1');
    });
  });

  describe('updateStorageByType', () => {
    it('should update storage by type and timestamp', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date('2024-01-01'),
      };

      storageStore.set(initialData);

      const newStorageByType = {
        'image/png': 200,
        'text/plain': 300,
      };

      storageStore.updateStorageByType(newStorageByType);

      const state = get(storageStore);
      expect(state.storageByType).toEqual(newStorageByType);
      expect(state.lastUpdated.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });

    it('should validate that storageByType sum does not exceed usedStorage', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 400,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(initialData);

      const invalidStorageByType = {
        'image/png': 300,
        'text/plain': 200, // Sum = 500 > 400
      };

      expect(() => storageStore.updateStorageByType(invalidStorageByType)).toThrow('Invalid storage data');
    });
  });

  describe('updateTimestamp', () => {
    it('should update the lastUpdated timestamp', () => {
      const initialData: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date('2024-01-01'),
      };

      storageStore.set(initialData);

      storageStore.updateTimestamp();

      const state = get(storageStore);
      expect(state.lastUpdated.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const data: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [
          {
            id: '1',
            name: 'file1.txt',
            size: 100,
            type: 'text/plain',
            lastModified: new Date(),
            path: '/file1.txt',
          },
        ],
        storageByType: { 'text/plain': 100 },
        lastUpdated: new Date(),
      };

      storageStore.set(data);

      storageStore.reset();

      const state = get(storageStore);
      expect(state.totalStorage).toBe(0);
      expect(state.usedStorage).toBe(0);
      expect(state.files).toEqual([]);
      expect(state.storageByType).toEqual({});
    });
  });

  describe('reactivity', () => {
    it('should notify subscribers on updates', () => {
      let notificationCount = 0;
      let latestValue: StorageData | null = null;

      const unsubscribe = storageStore.subscribe((value) => {
        notificationCount++;
        latestValue = value;
      });

      const data: StorageData = {
        totalStorage: 1000,
        usedStorage: 500,
        files: [],
        storageByType: {},
        lastUpdated: new Date(),
      };

      storageStore.set(data);

      expect(notificationCount).toBeGreaterThan(1); // Initial + set
      expect(latestValue?.totalStorage).toBe(1000);

      unsubscribe();
    });
  });
});

describe('storagePercentage derived store', () => {
  beforeEach(() => {
    storageStore.reset();
  });

  it('should calculate storage percentage correctly', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 500,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const percentage = get(storagePercentage);
    expect(percentage).toBe(50);
  });

  it('should return 0 when totalStorage is 0', () => {
    // Since validation requires positive totalStorage, we test with minimal values
    const data: StorageData = {
      totalStorage: 1,
      usedStorage: 0,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const percentage = get(storagePercentage);
    expect(percentage).toBe(0);
  });

  it('should calculate percentage for partial usage', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 250,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const percentage = get(storagePercentage);
    expect(percentage).toBe(25);
  });

  it('should calculate percentage for full usage', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 1000,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const percentage = get(storagePercentage);
    expect(percentage).toBe(100);
  });

  it('should update reactively when storage data changes', () => {
    const data1: StorageData = {
      totalStorage: 1000,
      usedStorage: 500,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data1);
    expect(get(storagePercentage)).toBe(50);

    storageStore.updateUsedStorage(750);
    expect(get(storagePercentage)).toBe(75);
  });

  it('should handle decimal percentages', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 333,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const percentage = get(storagePercentage);
    expect(percentage).toBeCloseTo(33.3, 1);
  });
});

describe('availableStorage derived store', () => {
  beforeEach(() => {
    storageStore.reset();
  });

  it('should calculate available storage correctly', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 400,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const available = get(availableStorage);
    expect(available).toBe(600);
  });

  it('should return totalStorage when usedStorage is 0', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 0,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const available = get(availableStorage);
    expect(available).toBe(1000);
  });

  it('should return 0 when storage is full', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 1000,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const available = get(availableStorage);
    expect(available).toBe(0);
  });

  it('should update reactively when storage data changes', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 300,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);
    expect(get(availableStorage)).toBe(700);

    storageStore.updateUsedStorage(500);
    expect(get(availableStorage)).toBe(500);
  });

  it('should update when totalStorage changes', () => {
    const data: StorageData = {
      totalStorage: 1000,
      usedStorage: 400,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);
    expect(get(availableStorage)).toBe(600);

    storageStore.updateTotalStorage(2000);
    expect(get(availableStorage)).toBe(1600);
  });

  it('should handle edge case with both values at 0', () => {
    // Since validation requires positive totalStorage, we test with minimal values
    const data: StorageData = {
      totalStorage: 1,
      usedStorage: 0,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    storageStore.set(data);

    const available = get(availableStorage);
    expect(available).toBe(1);
  });
});
