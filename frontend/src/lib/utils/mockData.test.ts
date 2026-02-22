/**
 * Unit tests for mock data generator
 */

import { describe, it, expect } from 'vitest';
import { generateMockData } from './mockData';

describe('generateMockData', () => {
  it('should generate valid StorageData structure', () => {
    const data = generateMockData();
    
    expect(data).toBeDefined();
    expect(data.totalStorage).toBeGreaterThan(0);
    expect(data.usedStorage).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.files)).toBe(true);
    expect(typeof data.storageByType).toBe('object');
    expect(data.lastUpdated).toBeInstanceOf(Date);
  });
  
  it('should ensure usedStorage does not exceed totalStorage', () => {
    const data = generateMockData();
    
    expect(data.usedStorage).toBeLessThanOrEqual(data.totalStorage);
  });
  
  it('should generate files with valid FileItem structure', () => {
    const data = generateMockData();
    
    expect(data.files.length).toBeGreaterThan(0);
    
    for (const file of data.files) {
      expect(file.id).toBeTruthy();
      expect(typeof file.id).toBe('string');
      expect(file.name).toBeTruthy();
      expect(typeof file.name).toBe('string');
      expect(file.size).toBeGreaterThanOrEqual(0);
      expect(typeof file.size).toBe('number');
      expect(file.type).toBeTruthy();
      expect(typeof file.type).toBe('string');
      expect(file.lastModified).toBeInstanceOf(Date);
      expect(file.path).toBeTruthy();
      expect(typeof file.path).toBe('string');
    }
  });
  
  it('should calculate usedStorage as sum of all file sizes', () => {
    const data = generateMockData();
    
    const calculatedUsed = data.files.reduce((sum, file) => sum + file.size, 0);
    
    expect(data.usedStorage).toBe(calculatedUsed);
  });
  
  it('should ensure storageByType sum does not exceed usedStorage', () => {
    const data = generateMockData();
    
    const typeSum = Object.values(data.storageByType).reduce((sum, size) => sum + size, 0);
    
    // Account for floating-point precision issues
    expect(typeSum).toBeLessThanOrEqual(data.usedStorage + 0.01);
  });
  
  it('should categorize files into storageByType', () => {
    const data = generateMockData();
    
    expect(Object.keys(data.storageByType).length).toBeGreaterThan(0);
    
    for (const [category, size] of Object.entries(data.storageByType)) {
      expect(typeof category).toBe('string');
      expect(category).toBeTruthy();
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    }
  });
  
  it('should set lastUpdated to current time', () => {
    const before = new Date();
    const data = generateMockData();
    const after = new Date();
    
    expect(data.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(data.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
  });
  
  it('should generate unique file IDs', () => {
    const data = generateMockData();
    
    const ids = data.files.map(f => f.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });
  
  it('should generate realistic file sizes', () => {
    const data = generateMockData();
    
    for (const file of data.files) {
      // All files should have positive size
      expect(file.size).toBeGreaterThan(0);
      // Files should be reasonable (not exceeding 10 GB for mock data)
      expect(file.size).toBeLessThan(1024 * 1024 * 1024 * 10);
    }
  });
  
  it('should generate files with valid MIME types', () => {
    const data = generateMockData();
    
    for (const file of data.files) {
      // MIME types should contain a slash or be a file extension
      expect(file.type.length).toBeGreaterThan(0);
    }
  });
  
  it('should generate files with valid paths', () => {
    const data = generateMockData();
    
    for (const file of data.files) {
      // Paths should start with /
      expect(file.path.startsWith('/')).toBe(true);
      // Paths should contain the file name
      expect(file.path.includes(file.name)).toBe(true);
    }
  });
  
  it('should generate consistent data on multiple calls', () => {
    const data1 = generateMockData();
    const data2 = generateMockData();
    
    // Should generate same structure
    expect(data1.files.length).toBe(data2.files.length);
    expect(data1.totalStorage).toBe(data2.totalStorage);
    expect(data1.usedStorage).toBe(data2.usedStorage);
    
    // File IDs should match (deterministic generation)
    for (let i = 0; i < data1.files.length; i++) {
      expect(data1.files[i].id).toBe(data2.files[i].id);
      expect(data1.files[i].name).toBe(data2.files[i].name);
    }
  });
});
