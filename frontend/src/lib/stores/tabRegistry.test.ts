/**
 * Unit tests for Tab Registry Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { tabRegistry } from './tabRegistry';
import type { TabDefinition } from '../types';

// Mock Svelte component
const MockComponent = {} as any;

describe('tabRegistry', () => {
  beforeEach(() => {
    // Clear the registry before each test
    tabRegistry.clear();
  });

  describe('registerTab', () => {
    it('should register a new tab successfully', () => {
      const tab: TabDefinition = {
        id: 'test-tab',
        label: 'Test Tab',
        component: MockComponent,
      };

      const result = tabRegistry.registerTab(tab);
      const tabs = get(tabRegistry);

      expect(result).toBe(true);
      expect(tabs).toHaveLength(1);
      expect(tabs[0].id).toBe('test-tab');
      expect(tabs[0].label).toBe('Test Tab');
    });

    it('should assign default order of 100 when not provided', () => {
      const tab: TabDefinition = {
        id: 'test-tab',
        label: 'Test Tab',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab);
      const tabs = get(tabRegistry);

      expect(tabs[0].order).toBe(100);
    });

    it('should preserve custom order when provided', () => {
      const tab: TabDefinition = {
        id: 'test-tab',
        label: 'Test Tab',
        component: MockComponent,
        order: 50,
      };

      tabRegistry.registerTab(tab);
      const tabs = get(tabRegistry);

      expect(tabs[0].order).toBe(50);
    });

    it('should reject registration of duplicate tab IDs', () => {
      const tab1: TabDefinition = {
        id: 'duplicate-tab',
        label: 'First Tab',
        component: MockComponent,
      };

      const tab2: TabDefinition = {
        id: 'duplicate-tab',
        label: 'Second Tab',
        component: MockComponent,
      };

      const result1 = tabRegistry.registerTab(tab1);
      const result2 = tabRegistry.registerTab(tab2);
      const tabs = get(tabRegistry);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(tabs).toHaveLength(1);
      expect(tabs[0].label).toBe('First Tab');
    });

    it('should maintain tabs sorted by order property', () => {
      const tab1: TabDefinition = {
        id: 'tab-3',
        label: 'Tab 3',
        component: MockComponent,
        order: 30,
      };

      const tab2: TabDefinition = {
        id: 'tab-1',
        label: 'Tab 1',
        component: MockComponent,
        order: 10,
      };

      const tab3: TabDefinition = {
        id: 'tab-2',
        label: 'Tab 2',
        component: MockComponent,
        order: 20,
      };

      tabRegistry.registerTab(tab1);
      tabRegistry.registerTab(tab2);
      tabRegistry.registerTab(tab3);

      const tabs = get(tabRegistry);

      expect(tabs).toHaveLength(3);
      expect(tabs[0].id).toBe('tab-1');
      expect(tabs[1].id).toBe('tab-2');
      expect(tabs[2].id).toBe('tab-3');
    });

    it('should sort tabs with default order correctly', () => {
      const tab1: TabDefinition = {
        id: 'tab-default',
        label: 'Default Tab',
        component: MockComponent,
        // No order specified, should default to 100
      };

      const tab2: TabDefinition = {
        id: 'tab-early',
        label: 'Early Tab',
        component: MockComponent,
        order: 50,
      };

      const tab3: TabDefinition = {
        id: 'tab-late',
        label: 'Late Tab',
        component: MockComponent,
        order: 150,
      };

      tabRegistry.registerTab(tab1);
      tabRegistry.registerTab(tab2);
      tabRegistry.registerTab(tab3);

      const tabs = get(tabRegistry);

      expect(tabs[0].id).toBe('tab-early');
      expect(tabs[1].id).toBe('tab-default');
      expect(tabs[2].id).toBe('tab-late');
    });

    it('should preserve icon when provided', () => {
      const tab: TabDefinition = {
        id: 'icon-tab',
        label: 'Icon Tab',
        icon: 'star',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab);
      const tabs = get(tabRegistry);

      expect(tabs[0].icon).toBe('star');
    });
  });

  describe('unregisterTab', () => {
    it('should remove a tab by ID', () => {
      const tab: TabDefinition = {
        id: 'remove-me',
        label: 'Remove Me',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab);
      expect(get(tabRegistry)).toHaveLength(1);

      const result = tabRegistry.unregisterTab('remove-me');
      const tabs = get(tabRegistry);

      expect(result).toBe(true);
      expect(tabs).toHaveLength(0);
    });

    it('should return false when removing non-existent tab', () => {
      const result = tabRegistry.unregisterTab('non-existent');

      expect(result).toBe(false);
    });

    it('should only remove the specified tab', () => {
      const tab1: TabDefinition = {
        id: 'tab-1',
        label: 'Tab 1',
        component: MockComponent,
      };

      const tab2: TabDefinition = {
        id: 'tab-2',
        label: 'Tab 2',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab1);
      tabRegistry.registerTab(tab2);

      tabRegistry.unregisterTab('tab-1');
      const tabs = get(tabRegistry);

      expect(tabs).toHaveLength(1);
      expect(tabs[0].id).toBe('tab-2');
    });
  });

  describe('getTab', () => {
    it('should retrieve a tab by ID', () => {
      const tab: TabDefinition = {
        id: 'find-me',
        label: 'Find Me',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab);
      const foundTab = tabRegistry.getTab('find-me');

      expect(foundTab).toBeDefined();
      expect(foundTab?.id).toBe('find-me');
      expect(foundTab?.label).toBe('Find Me');
    });

    it('should return undefined for non-existent tab', () => {
      const foundTab = tabRegistry.getTab('non-existent');

      expect(foundTab).toBeUndefined();
    });
  });

  describe('hasTab', () => {
    it('should return true for existing tab', () => {
      const tab: TabDefinition = {
        id: 'exists',
        label: 'Exists',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab);
      const exists = tabRegistry.hasTab('exists');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent tab', () => {
      const exists = tabRegistry.hasTab('non-existent');

      expect(exists).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all tabs', () => {
      const tab1: TabDefinition = {
        id: 'tab-1',
        label: 'Tab 1',
        component: MockComponent,
      };

      const tab2: TabDefinition = {
        id: 'tab-2',
        label: 'Tab 2',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab1);
      tabRegistry.registerTab(tab2);
      expect(get(tabRegistry)).toHaveLength(2);

      tabRegistry.clear();
      const tabs = get(tabRegistry);

      expect(tabs).toHaveLength(0);
    });
  });

  describe('set', () => {
    it('should set tabs and sort them by order', () => {
      const tabs: TabDefinition[] = [
        {
          id: 'tab-3',
          label: 'Tab 3',
          component: MockComponent,
          order: 30,
        },
        {
          id: 'tab-1',
          label: 'Tab 1',
          component: MockComponent,
          order: 10,
        },
        {
          id: 'tab-2',
          label: 'Tab 2',
          component: MockComponent,
          order: 20,
        },
      ];

      tabRegistry.set(tabs);
      const sortedTabs = get(tabRegistry);

      expect(sortedTabs).toHaveLength(3);
      expect(sortedTabs[0].id).toBe('tab-1');
      expect(sortedTabs[1].id).toBe('tab-2');
      expect(sortedTabs[2].id).toBe('tab-3');
    });

    it('should replace existing tabs', () => {
      const tab1: TabDefinition = {
        id: 'old-tab',
        label: 'Old Tab',
        component: MockComponent,
      };

      tabRegistry.registerTab(tab1);

      const newTabs: TabDefinition[] = [
        {
          id: 'new-tab',
          label: 'New Tab',
          component: MockComponent,
        },
      ];

      tabRegistry.set(newTabs);
      const tabs = get(tabRegistry);

      expect(tabs).toHaveLength(1);
      expect(tabs[0].id).toBe('new-tab');
    });
  });

  describe('edge cases', () => {
    it('should handle tabs with same order value', () => {
      const tab1: TabDefinition = {
        id: 'tab-1',
        label: 'Tab 1',
        component: MockComponent,
        order: 50,
      };

      const tab2: TabDefinition = {
        id: 'tab-2',
        label: 'Tab 2',
        component: MockComponent,
        order: 50,
      };

      tabRegistry.registerTab(tab1);
      tabRegistry.registerTab(tab2);

      const tabs = get(tabRegistry);

      expect(tabs).toHaveLength(2);
      // Both should have order 50, order between them is stable
      expect(tabs[0].order).toBe(50);
      expect(tabs[1].order).toBe(50);
    });

    it('should handle order value of 0', () => {
      const tab: TabDefinition = {
        id: 'zero-order',
        label: 'Zero Order',
        component: MockComponent,
        order: 0,
      };

      tabRegistry.registerTab(tab);
      const tabs = get(tabRegistry);

      expect(tabs[0].order).toBe(0);
    });

    it('should handle negative order values', () => {
      const tab1: TabDefinition = {
        id: 'negative',
        label: 'Negative',
        component: MockComponent,
        order: -10,
      };

      const tab2: TabDefinition = {
        id: 'positive',
        label: 'Positive',
        component: MockComponent,
        order: 10,
      };

      tabRegistry.registerTab(tab1);
      tabRegistry.registerTab(tab2);

      const tabs = get(tabRegistry);

      expect(tabs[0].id).toBe('negative');
      expect(tabs[1].id).toBe('positive');
    });
  });
});
