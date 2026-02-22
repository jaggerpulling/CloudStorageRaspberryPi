import { describe, it, expect } from 'vitest';
import type { FileItem, StorageData, TabDefinition, UIState } from './index';

describe('Type definitions', () => {
  it('should allow valid FileItem objects', () => {
    const fileItem: FileItem = {
      id: '1',
      name: 'test.txt',
      size: 1024,
      type: 'text/plain',
      lastModified: new Date(),
      path: '/test.txt'
    };
    
    expect(fileItem.id).toBe('1');
    expect(fileItem.name).toBe('test.txt');
  });

  it('should allow valid StorageData objects', () => {
    const storageData: StorageData = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [],
      storageByType: { 'text/plain': 1024 },
      lastUpdated: new Date()
    };
    
    expect(storageData.totalStorage).toBe(1000000);
    expect(storageData.usedStorage).toBe(500000);
  });
});
