import { describe, it, expect } from 'vitest';
import { filterFiles } from './filterFiles';
import type { FileItem } from '../types';

describe('filterFiles', () => {
  // Helper to create test file items
  const createFile = (
    id: string,
    name: string,
    path: string
  ): FileItem => ({
    id,
    name,
    size: 1024,
    type: 'text',
    lastModified: new Date('2024-01-01'),
    path
  });

  const testFiles: FileItem[] = [
    createFile('1', 'document.pdf', '/docs/document.pdf'),
    createFile('2', 'image.jpg', '/images/vacation/image.jpg'),
    createFile('3', 'report.pdf', '/reports/2024/report.pdf'),
    createFile('4', 'photo.png', '/images/photo.png'),
    createFile('5', 'README.md', '/projects/myapp/README.md')
  ];

  describe('filtering by name', () => {
    it('should filter files by name match', () => {
      const result = filterFiles(testFiles, 'image');
      // Matches both 'image.jpg' (name) and 'photo.png' (path contains 'images')
      expect(result.map(f => f.name)).toEqual(['image.jpg', 'photo.png']);
    });

    it('should filter files with partial name match', () => {
      const result = filterFiles(testFiles, 'doc');
      expect(result.map(f => f.name)).toEqual(['document.pdf']);
    });

    it('should filter files by extension', () => {
      const result = filterFiles(testFiles, 'pdf');
      expect(result.map(f => f.name)).toEqual(['document.pdf', 'report.pdf']);
    });
  });

  describe('filtering by path', () => {
    it('should filter files by path match', () => {
      const result = filterFiles(testFiles, 'images');
      expect(result.map(f => f.name)).toEqual(['image.jpg', 'photo.png']);
    });

    it('should filter files by subdirectory in path', () => {
      const result = filterFiles(testFiles, 'vacation');
      expect(result.map(f => f.name)).toEqual(['image.jpg']);
    });

    it('should filter files by year in path', () => {
      const result = filterFiles(testFiles, '2024');
      expect(result.map(f => f.name)).toEqual(['report.pdf']);
    });
  });

  describe('case insensitivity', () => {
    it('should match regardless of case in filter text', () => {
      const result1 = filterFiles(testFiles, 'IMAGE');
      const result2 = filterFiles(testFiles, 'image');
      const result3 = filterFiles(testFiles, 'ImAgE');
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should match regardless of case in file name', () => {
      const result = filterFiles(testFiles, 'readme');
      expect(result.map(f => f.name)).toEqual(['README.md']);
    });

    it('should match regardless of case in path', () => {
      const result = filterFiles(testFiles, 'REPORTS');
      expect(result.map(f => f.name)).toEqual(['report.pdf']);
    });
  });

  describe('combined name and path matching', () => {
    it('should return file if either name or path matches', () => {
      const result = filterFiles(testFiles, 'photo');
      // Matches both name (photo.png) and path (/images/photo.png)
      expect(result.map(f => f.name)).toEqual(['photo.png']);
    });

    it('should return files when filter matches name or path', () => {
      const result = filterFiles(testFiles, 'image');
      // 'image' appears in name of image.jpg and in path of both image.jpg and photo.png
      expect(result.length).toBe(2);
      expect(result.map(f => f.name)).toContain('image.jpg');
      expect(result.map(f => f.name)).toContain('photo.png');
    });
  });

  describe('empty and whitespace filters', () => {
    it('should return all files for empty string', () => {
      const result = filterFiles(testFiles, '');
      expect(result.length).toBe(testFiles.length);
      expect(result).toEqual(testFiles);
    });

    it('should return all files for whitespace-only string', () => {
      const result = filterFiles(testFiles, '   ');
      expect(result.length).toBe(testFiles.length);
    });

    it('should trim whitespace from filter text', () => {
      const result1 = filterFiles(testFiles, '  image  ');
      const result2 = filterFiles(testFiles, 'image');
      expect(result1).toEqual(result2);
    });
  });

  describe('no matches', () => {
    it('should return empty array when no files match', () => {
      const result = filterFiles(testFiles, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array for filter not in any name or path', () => {
      const result = filterFiles(testFiles, 'xyz123');
      expect(result).toEqual([]);
    });
  });

  describe('immutability', () => {
    it('should not modify the original array', () => {
      const original = [...testFiles];
      filterFiles(testFiles, 'pdf');
      expect(testFiles).toEqual(original);
    });

    it('should return a new array', () => {
      const result = filterFiles(testFiles, 'pdf');
      expect(result).not.toBe(testFiles);
    });

    it('should return a new array even for empty filter', () => {
      const result = filterFiles(testFiles, '');
      expect(result).not.toBe(testFiles);
      expect(result).toEqual(testFiles);
    });
  });

  describe('edge cases', () => {
    it('should handle empty file array', () => {
      const result = filterFiles([], 'test');
      expect(result).toEqual([]);
    });

    it('should handle single file array', () => {
      const singleFile = [testFiles[0]];
      const result = filterFiles(singleFile, 'document');
      expect(result).toEqual(singleFile);
      expect(result).not.toBe(singleFile);
    });

    it('should handle special characters in filter', () => {
      const filesWithSpecial = [
        createFile('1', 'file-name.txt', '/path/file-name.txt'),
        createFile('2', 'file_name.txt', '/path/file_name.txt')
      ];
      const result = filterFiles(filesWithSpecial, 'file-');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('file-name.txt');
    });

    it('should preserve all file properties', () => {
      const result = filterFiles(testFiles, 'pdf');
      result.forEach(file => {
        expect(file).toHaveProperty('id');
        expect(file).toHaveProperty('name');
        expect(file).toHaveProperty('size');
        expect(file).toHaveProperty('type');
        expect(file).toHaveProperty('lastModified');
        expect(file).toHaveProperty('path');
      });
    });
  });

  describe('input validation', () => {
    it('should throw error for non-array input', () => {
      expect(() => filterFiles(null as any, 'test')).toThrow(
        'Files must be an array'
      );
    });

    it('should throw error for non-string filter text', () => {
      expect(() => filterFiles(testFiles, 123 as any)).toThrow(
        'Filter text must be a string'
      );
    });

    it('should throw error for undefined filter text', () => {
      expect(() => filterFiles(testFiles, undefined as any)).toThrow(
        'Filter text must be a string'
      );
    });
  });
});
