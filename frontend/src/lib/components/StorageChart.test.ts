/**
 * Unit tests for StorageChart component
 * 
 * **Validates: Requirements 2.5.1, 2.5.2, 2.5.3**
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StorageChart from './StorageChart.svelte';

describe('StorageChart', () => {
  const mockStorageByType = {
    'Video': 1024 * 1024 * 1024 * 8.1, // 8.1 GB
    'Documents': 1024 * 1024 * 198.5, // 198.5 MB
    'Archives': 1024 * 1024 * 1024 * 9.2, // 9.2 GB
    'Images': 1024 * 1024 * 320, // 320 MB
    'Databases': 1024 * 1024 * 850, // 850 MB
  };

  describe('Rendering', () => {
    it('should render bar chart by default', () => {
      const { container } = render(StorageChart, {
        props: { storageByType: mockStorageByType }
      });

      const barChart = container.querySelector('.bar-chart');
      expect(barChart).toBeTruthy();
    });

    it('should render pie chart when chartType is pie', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'pie'
        }
      });

      const pieChart = container.querySelector('.pie-chart');
      expect(pieChart).toBeTruthy();
    });

    it('should render donut chart when chartType is donut', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'donut'
        }
      });

      const pieChart = container.querySelector('.pie-chart');
      const donutCenter = container.querySelector('.donut-center');
      expect(pieChart).toBeTruthy();
      expect(donutCenter).toBeTruthy();
    });

    it('should render bar chart when chartType is bar', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'bar'
        }
      });

      const barChart = container.querySelector('.bar-chart');
      expect(barChart).toBeTruthy();
    });

    it('should display empty state when no data provided', () => {
      render(StorageChart, {
        props: { storageByType: {} }
      });

      expect(screen.getByText('No storage data available')).toBeTruthy();
    });
  });

  describe('Legend', () => {
    it('should render legend with all storage types', () => {
      const { container } = render(StorageChart, {
        props: { storageByType: mockStorageByType }
      });

      const legend = container.querySelector('.legend');
      expect(legend).toBeTruthy();

      const legendItems = container.querySelectorAll('.legend-item');
      expect(legendItems.length).toBe(Object.keys(mockStorageByType).length);
    });

    it('should display type names in legend', () => {
      render(StorageChart, {
        props: { storageByType: mockStorageByType }
      });

      expect(screen.getByText('Video')).toBeTruthy();
      expect(screen.getByText('Documents')).toBeTruthy();
      expect(screen.getByText('Archives')).toBeTruthy();
      expect(screen.getByText('Images')).toBeTruthy();
      expect(screen.getByText('Databases')).toBeTruthy();
    });

    it('should not render legend when no data', () => {
      const { container } = render(StorageChart, {
        props: { storageByType: {} }
      });

      const legend = container.querySelector('.legend');
      expect(legend).toBeFalsy();
    });
  });

  describe('Bar Chart', () => {
    it('should render correct number of bars', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'bar'
        }
      });

      const barItems = container.querySelectorAll('.bar-item');
      expect(barItems.length).toBe(Object.keys(mockStorageByType).length);
    });

    it('should display type names and sizes', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'bar'
        }
      });

      const typeNames = container.querySelectorAll('.type-name');
      expect(typeNames.length).toBeGreaterThan(0);
      
      const typeSizes = container.querySelectorAll('.type-size');
      expect(typeSizes.length).toBeGreaterThan(0);
    });

    it('should display percentages', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'bar'
        }
      });

      const percentages = container.querySelectorAll('.bar-percentage');
      expect(percentages.length).toBe(Object.keys(mockStorageByType).length);
      
      // Check that percentages are formatted correctly
      percentages.forEach(p => {
        expect(p.textContent).toMatch(/\d+\.\d+%/);
      });
    });
  });

  describe('Pie/Donut Chart', () => {
    it('should render correct number of slices for pie chart', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'pie'
        }
      });

      const slices = container.querySelectorAll('.slice');
      expect(slices.length).toBe(Object.keys(mockStorageByType).length);
    });

    it('should render correct number of slices for donut chart', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'donut'
        }
      });

      const slices = container.querySelectorAll('.slice');
      expect(slices.length).toBe(Object.keys(mockStorageByType).length);
    });

    it('should display center text in donut chart', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'donut'
        }
      });

      const centerText = container.querySelector('.donut-center');
      expect(centerText).toBeTruthy();
      expect(centerText?.textContent).toBe(String(Object.keys(mockStorageByType).length));
    });

    it('should not display center text in pie chart', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: mockStorageByType,
          chartType: 'pie'
        }
      });

      const centerText = container.querySelector('.donut-center');
      expect(centerText).toBeFalsy();
    });
  });

  describe('Data Handling', () => {
    it('should handle single storage type', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: { 'Video': 1024 * 1024 * 1024 }
        }
      });

      const legendItems = container.querySelectorAll('.legend-item');
      expect(legendItems.length).toBe(1);
    });

    it('should handle many storage types', () => {
      const manyTypes: Record<string, number> = {};
      for (let i = 0; i < 10; i++) {
        manyTypes[`Type${i}`] = 1024 * 1024 * (i + 1);
      }

      const { container } = render(StorageChart, {
        props: { storageByType: manyTypes }
      });

      const legendItems = container.querySelectorAll('.legend-item');
      expect(legendItems.length).toBe(10);
    });

    it('should sort entries by size in descending order', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: {
            'Small': 1024,
            'Large': 1024 * 1024 * 1024,
            'Medium': 1024 * 1024
          },
          chartType: 'bar'
        }
      });

      const typeNames = Array.from(container.querySelectorAll('.type-name'))
        .map(el => el.textContent);
      
      expect(typeNames[0]).toBe('Large');
      expect(typeNames[1]).toBe('Medium');
      expect(typeNames[2]).toBe('Small');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      const { container } = render(StorageChart, {
        props: { storageByType: mockStorageByType }
      });

      const chart = container.querySelector('[role="img"]');
      expect(chart).toBeTruthy();
      expect(chart?.getAttribute('aria-label')).toBe('Storage usage chart');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero total storage', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: {
            'Type1': 0,
            'Type2': 0
          }
        }
      });

      // Should still render but with 0% for all
      const legend = container.querySelector('.legend');
      expect(legend).toBeTruthy();
    });

    it('should handle very small values', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: {
            'Tiny': 1,
            'Small': 10
          }
        }
      });

      const legendItems = container.querySelectorAll('.legend-item');
      expect(legendItems.length).toBe(2);
    });

    it('should handle very large values', () => {
      const { container } = render(StorageChart, {
        props: { 
          storageByType: {
            'Huge': 1024 * 1024 * 1024 * 1024 * 5 // 5 TB
          }
        }
      });

      const legendItems = container.querySelectorAll('.legend-item');
      expect(legendItems.length).toBe(1);
    });
  });
});
