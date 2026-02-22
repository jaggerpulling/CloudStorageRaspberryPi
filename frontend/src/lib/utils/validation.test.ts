/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateFileItem, validateStorageData, validateTabDefinition } from './validation';
import type { FileItem, StorageData, TabDefinition } from '../types';

describe('validateFileItem', () => {
  it('should return true for valid file item', () => {
    const validFile: FileItem = {
      id: 'file-1',
      name: 'document.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: new Date('2024-01-01'),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(validFile)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(validateFileItem(null)).toBe(false);
    expect(validateFileItem(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(validateFileItem('string')).toBe(false);
    expect(validateFileItem(123)).toBe(false);
    expect(validateFileItem(true)).toBe(false);
  });

  it('should return false for empty id', () => {
    const file = {
      id: '',
      name: 'document.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: new Date(),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for whitespace-only id', () => {
    const file = {
      id: '   ',
      name: 'document.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: new Date(),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for empty name', () => {
    const file = {
      id: 'file-1',
      name: '',
      size: 1024,
      type: 'application/pdf',
      lastModified: new Date(),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for negative size', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      size: -100,
      type: 'application/pdf',
      lastModified: new Date(),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return true for zero size', () => {
    const file = {
      id: 'file-1',
      name: 'empty.txt',
      size: 0,
      type: 'text/plain',
      lastModified: new Date(),
      path: '/empty.txt',
    };

    expect(validateFileItem(file)).toBe(true);
  });

  it('should return false for non-finite size', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      size: Infinity,
      type: 'application/pdf',
      lastModified: new Date(),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for empty type', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      size: 1024,
      type: '',
      lastModified: new Date(),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for invalid Date', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: new Date('invalid'),
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for non-Date lastModified', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: '2024-01-01',
      path: '/documents/document.pdf',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for empty path', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: new Date(),
      path: '',
    };

    expect(validateFileItem(file)).toBe(false);
  });

  it('should return false for missing required fields', () => {
    const file = {
      id: 'file-1',
      name: 'document.pdf',
      // missing size, type, lastModified, path
    };

    expect(validateFileItem(file)).toBe(false);
  });
});

describe('validateStorageData', () => {
  it('should return valid for correct storage data', () => {
    const validData: StorageData = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [
        {
          id: 'file-1',
          name: 'document.pdf',
          size: 1024,
          type: 'application/pdf',
          lastModified: new Date('2024-01-01'),
          path: '/documents/document.pdf',
        },
      ],
      storageByType: {
        'application/pdf': 1024,
      },
      lastUpdated: new Date(),
    };

    const result = validateStorageData(validData);
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(validData);
    expect(result.errors).toHaveLength(0);
  });

  it('should return invalid for null or undefined', () => {
    const result1 = validateStorageData(null);
    expect(result1.isValid).toBe(false);
    expect(result1.data).toBe(null);
    expect(result1.errors.length).toBeGreaterThan(0);

    const result2 = validateStorageData(undefined);
    expect(result2.isValid).toBe(false);
    expect(result2.data).toBe(null);
  });

  it('should return invalid for non-positive totalStorage', () => {
    const data = {
      totalStorage: 0,
      usedStorage: 0,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('totalStorage must be a positive number');
  });

  it('should return invalid for negative totalStorage', () => {
    const data = {
      totalStorage: -1000,
      usedStorage: 0,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('totalStorage must be a positive number');
  });

  it('should return invalid for negative usedStorage', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: -100,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('usedStorage must be a non-negative number');
  });

  it('should return invalid when usedStorage exceeds totalStorage', () => {
    const data = {
      totalStorage: 1000,
      usedStorage: 2000,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('usedStorage cannot exceed totalStorage');
  });

  it('should return invalid for non-array files', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: 'not an array',
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('files must be an array');
  });

  it('should return invalid for non-object storageByType', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [],
      storageByType: 'not an object',
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('storageByType must be an object');
  });

  it('should return invalid for array storageByType', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [],
      storageByType: [],
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('storageByType must be an object');
  });

  it('should return invalid when storageByType sum exceeds usedStorage', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 1000,
      files: [],
      storageByType: {
        'application/pdf': 600,
        'image/jpeg': 500,
      },
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Sum of storageByType cannot exceed usedStorage');
  });

  it('should return invalid for negative storageByType values', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [],
      storageByType: {
        'application/pdf': -100,
      },
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("must be a non-negative number"))).toBe(true);
  });

  it('should return invalid for invalid Date', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [],
      storageByType: {},
      lastUpdated: new Date('invalid'),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('lastUpdated must be a valid Date object');
  });

  it('should filter out invalid file items', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 500000,
      files: [
        {
          id: 'file-1',
          name: 'valid.pdf',
          size: 1024,
          type: 'application/pdf',
          lastModified: new Date(),
          path: '/valid.pdf',
        },
        {
          id: '',
          name: 'invalid.pdf',
          size: 1024,
          type: 'application/pdf',
          lastModified: new Date(),
          path: '/invalid.pdf',
        },
        {
          id: 'file-3',
          name: 'another-valid.txt',
          size: 512,
          type: 'text/plain',
          lastModified: new Date(),
          path: '/another-valid.txt',
        },
      ],
      storageByType: {
        'application/pdf': 2048,
        'text/plain': 512,
      },
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(true);
    expect(result.data?.files).toHaveLength(2);
    expect(result.errors).toContain('Filtered out 1 invalid file item(s)');
  });

  it('should accept empty files array', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 0,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(true);
    expect(result.data?.files).toHaveLength(0);
  });

  it('should accept usedStorage equal to totalStorage', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 1000000,
      files: [],
      storageByType: {},
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(true);
  });

  it('should accept storageByType sum equal to usedStorage', () => {
    const data = {
      totalStorage: 1000000,
      usedStorage: 1000,
      files: [],
      storageByType: {
        'application/pdf': 600,
        'image/jpeg': 400,
      },
      lastUpdated: new Date(),
    };

    const result = validateStorageData(data);
    expect(result.isValid).toBe(true);
  });
});

describe('validateTabDefinition', () => {
  // Mock Svelte component
  const mockComponent = function() {};

  it('should return true for valid tab definition', () => {
    const validTab: TabDefinition = {
      id: 'storage-overview',
      label: 'Storage Overview',
      icon: 'database',
      component: mockComponent as any,
      order: 1,
    };

    expect(validateTabDefinition(validTab)).toBe(true);
  });

  it('should return true for tab without optional fields', () => {
    const validTab = {
      id: 'custom-tab',
      label: 'Custom Tab',
      component: mockComponent,
    };

    expect(validateTabDefinition(validTab)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(validateTabDefinition(null)).toBe(false);
    expect(validateTabDefinition(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(validateTabDefinition('string')).toBe(false);
    expect(validateTabDefinition(123)).toBe(false);
  });

  it('should return false for empty id', () => {
    const tab = {
      id: '',
      label: 'Tab',
      component: mockComponent,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for whitespace-only id', () => {
    const tab = {
      id: '   ',
      label: 'Tab',
      component: mockComponent,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for empty label', () => {
    const tab = {
      id: 'tab-1',
      label: '',
      component: mockComponent,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for whitespace-only label', () => {
    const tab = {
      id: 'tab-1',
      label: '   ',
      component: mockComponent,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for non-string icon', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      icon: 123,
      component: mockComponent,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return true for object component (Svelte component)', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      component: { render: () => {} },
    };

    expect(validateTabDefinition(tab)).toBe(true);
  });

  it('should return false for missing component', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for invalid component type', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      component: 'not a component',
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for negative order', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      component: mockComponent,
      order: -1,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return false for non-integer order', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      component: mockComponent,
      order: 1.5,
    };

    expect(validateTabDefinition(tab)).toBe(false);
  });

  it('should return true for zero order', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      component: mockComponent,
      order: 0,
    };

    expect(validateTabDefinition(tab)).toBe(true);
  });

  it('should return true for large order value', () => {
    const tab = {
      id: 'tab-1',
      label: 'Tab',
      component: mockComponent,
      order: 1000,
    };

    expect(validateTabDefinition(tab)).toBe(true);
  });
});
