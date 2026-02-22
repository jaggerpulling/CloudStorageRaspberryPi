import { describe, it, expect } from 'vitest';
import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  describe('basic functionality', () => {
    it('should format 0 bytes as "0 B"', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format bytes (< 1024) with B unit', () => {
      expect(formatBytes(100)).toBe('100.00 B');
      expect(formatBytes(512)).toBe('512.00 B');
      expect(formatBytes(1023)).toBe('1023.00 B');
    });

    it('should format kilobytes with KB unit', () => {
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1536)).toBe('1.50 KB');
      expect(formatBytes(10240)).toBe('10.00 KB');
    });

    it('should format megabytes with MB unit', () => {
      expect(formatBytes(1048576)).toBe('1.00 MB'); // 1024^2
      expect(formatBytes(5242880)).toBe('5.00 MB'); // 5 * 1024^2
      expect(formatBytes(1572864)).toBe('1.50 MB'); // 1.5 * 1024^2
    });

    it('should format gigabytes with GB unit', () => {
      expect(formatBytes(1073741824)).toBe('1.00 GB'); // 1024^3
      expect(formatBytes(5368709120)).toBe('5.00 GB'); // 5 * 1024^3
      expect(formatBytes(1610612736)).toBe('1.50 GB'); // 1.5 * 1024^3
    });

    it('should format terabytes with TB unit', () => {
      expect(formatBytes(1099511627776)).toBe('1.00 TB'); // 1024^4
      expect(formatBytes(5497558138880)).toBe('5.00 TB'); // 5 * 1024^4
    });

    it('should format petabytes with PB unit', () => {
      expect(formatBytes(1125899906842624)).toBe('1.00 PB'); // 1024^5
      expect(formatBytes(5629499534213120)).toBe('5.00 PB'); // 5 * 1024^5
    });
  });

  describe('decimal precision', () => {
    it('should use 2 decimal places by default', () => {
      expect(formatBytes(1536)).toBe('1.50 KB');
      expect(formatBytes(1234567)).toBe('1.18 MB');
    });

    it('should support 0 decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1234567, 0)).toBe('1 MB');
    });

    it('should support 1 decimal place', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1234567, 1)).toBe('1.2 MB');
    });

    it('should support 3 decimal places', () => {
      expect(formatBytes(1536, 3)).toBe('1.500 KB');
      expect(formatBytes(1234567, 3)).toBe('1.177 MB');
    });

    it('should support up to 10 decimal places', () => {
      expect(formatBytes(1536, 10)).toBe('1.5000000000 KB');
    });
  });

  describe('edge cases', () => {
    it('should handle very small values', () => {
      expect(formatBytes(1)).toBe('1.00 B');
      expect(formatBytes(0.5)).toBe('0.50 B');
    });

    it('should handle values just below unit boundaries', () => {
      expect(formatBytes(1023)).toBe('1023.00 B');
      expect(formatBytes(1048575)).toBe('1024.00 KB'); // Just below 1 MB
    });

    it('should handle very large values (beyond PB)', () => {
      const hugeByte = 1125899906842624 * 1024; // 1024 PB
      const result = formatBytes(hugeByte);
      expect(result).toContain('PB'); // Should still use PB as max unit
      expect(parseFloat(result)).toBeGreaterThan(1000);
    });
  });

  describe('error handling', () => {
    it('should throw error for negative bytes', () => {
      expect(() => formatBytes(-1)).toThrow('Bytes must be non-negative');
      expect(() => formatBytes(-1024)).toThrow('Bytes must be non-negative');
    });

    it('should throw error for invalid decimal values', () => {
      expect(() => formatBytes(1024, -1)).toThrow('Decimals must be between 0 and 10');
      expect(() => formatBytes(1024, 11)).toThrow('Decimals must be between 0 and 10');
    });
  });

  describe('real-world scenarios', () => {
    it('should format typical file sizes', () => {
      expect(formatBytes(2048)).toBe('2.00 KB'); // Small document
      expect(formatBytes(5242880)).toBe('5.00 MB'); // Photo
      expect(formatBytes(1073741824)).toBe('1.00 GB'); // Video file
    });

    it('should format storage capacity values', () => {
      expect(formatBytes(256 * 1024 * 1024 * 1024)).toBe('256.00 GB'); // 256 GB drive
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB'); // 1 TB drive
    });
  });
});
