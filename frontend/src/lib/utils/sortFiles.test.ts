import { describe, it, expect } from 'vitest';
import { sortFiles } from './sortFiles';
import type { FileItem } from '../types';

describe('sortFiles', () => {
  // Helper to create test file items
  const createFile = (
    id: string,
    name: string,
    size: number,
    type: string,
    lastModified: Date
  ): FileItem => ({
    id,
    name,
    size,
    type,
    lastModified,
    path: `/files/${name}`
  });

  const testFiles: FileItem[] = [
    createFile('1', 'zebra.txt', 1024, 'text', new Date('2024-01-03')),
    createFile('2', 'apple.pdf', 2048, 'pdf', new Date('2024-01-01')),
    createFile('3', 'banana.jpg', 512, 'image', new Date('2024-01-02')),
    createFile('4', 'cherry.txt', 4096, 'text', new Date('2024-01-04'))
  ];

  describe('sorting by name', () => {
    it('should sort files by name in ascending order', () => {
      const result = sortFiles(testFiles, 'name', 'asc');
      expect(result.map(f => f.name)).toEqual([
        'apple.pdf',
        'banana.jpg',
        'cherry.txt',
        'zebra.txt'
      ]);
    });

    it('should sort files by name in descending order', () => {
      const result = sortFiles(testFiles, 'name', 'desc');
      expect(result.map(f => f.name)).toEqual([
        'zebra.txt',
        'cherry.txt',
        'banana.jpg',
        'apple.pdf'
      ]);
    });
  });

  describe('sorting by size', () => {
    it('should sort files by size in ascending order', () => {
      const result = sortFiles(testFiles, 'size', 'asc');
      expect(result.map(f => f.size)).toEqual([512, 1024, 2048, 4096]);
    });

    it('should sort files by size in descending order', () => {
      const result = sortFiles(testFiles, 'size', 'desc');
      expect(result.map(f => f.size)).toEqual([4096, 2048, 1024, 512]);
    });
  });

  describe('sorting by date', () => {
    it('should sort files by date in ascending order', () => {
      const result = sortFiles(testFiles, 'date', 'asc');
      expect(result.map(f => f.id)).toEqual(['2', '3', '1', '4']);
    });

    it('should sort files by date in descending order', () => {
      const result = sortFiles(testFiles, 'date', 'desc');
      expect(result.map(f => f.id)).toEqual(['4', '1', '3', '2']);
    });
  });

  describe('sorting by type', () => {
    it('should sort files by type in ascending order', () => {
      const result = sortFiles(testFiles, 'type', 'asc');
      expect(result.map(f => f.type)).toEqual(['image', 'pdf', 'text', 'text']);
    });

    it('should sort files by type in descending order', () => {
      const result = sortFiles(testFiles, 'type', 'desc');
      expect(result.map(f => f.type)).toEqual(['text', 'text', 'pdf', 'image']);
    });
  });

  describe('immutability', () => {
    it('should not modify the original array', () => {
      const original = [...testFiles];
      sortFiles(testFiles, 'name', 'asc');
      expect(testFiles).toEqual(original);
    });

    it('should return a new array', () => {
      const result = sortFiles(testFiles, 'name', 'asc');
      expect(result).not.toBe(testFiles);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = sortFiles([], 'name', 'asc');
      expect(result).toEqual([]);
    });

    it('should handle single item array', () => {
      const singleFile = [testFiles[0]];
      const result = sortFiles(singleFile, 'name', 'asc');
      expect(result).toEqual(singleFile);
      expect(result).not.toBe(singleFile);
    });

    it('should preserve all elements', () => {
      const result = sortFiles(testFiles, 'name', 'asc');
      expect(result.length).toBe(testFiles.length);
      testFiles.forEach(file => {
        expect(result).toContainEqual(file);
      });
    });
  });

  describe('input validation', () => {
    it('should throw error for invalid sortBy field', () => {
      expect(() => sortFiles(testFiles, 'invalid' as any, 'asc')).toThrow(
        'Invalid sortBy field'
      );
    });

    it('should throw error for invalid order', () => {
      expect(() => sortFiles(testFiles, 'name', 'invalid' as any)).toThrow(
        'Invalid order'
      );
    });

    it('should throw error for non-array input', () => {
      expect(() => sortFiles(null as any, 'name', 'asc')).toThrow(
        'Files must be an array'
      );
    });
  });
});
