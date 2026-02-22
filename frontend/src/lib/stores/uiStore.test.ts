/**
 * Unit tests for UI State Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { uiStore } from './uiStore';
import type { UIState } from '../types';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store before each test
    uiStore.reset();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const state = get(uiStore);
      
      expect(state.activeTabId).toBe('storage-overview');
      expect(state.theme).toBe('auto');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('set', () => {
    it('should set entire UI state', () => {
      const newState: UIState = {
        activeTabId: 'custom-tab',
        theme: 'dark',
        isLoading: true,
        error: 'Test error',
      };

      uiStore.set(newState);
      const state = get(uiStore);

      expect(state).toEqual(newState);
    });
  });

  describe('update', () => {
    it('should update UI state using updater function', () => {
      uiStore.update((state) => ({
        ...state,
        activeTabId: 'new-tab',
        isLoading: true,
      }));

      const state = get(uiStore);
      expect(state.activeTabId).toBe('new-tab');
      expect(state.isLoading).toBe(true);
      expect(state.theme).toBe('auto'); // unchanged
      expect(state.error).toBe(null); // unchanged
    });
  });

  describe('setActiveTab', () => {
    it('should update active tab ID', () => {
      uiStore.setActiveTab('context-search');
      
      const state = get(uiStore);
      expect(state.activeTabId).toBe('context-search');
    });

    it('should preserve other state properties', () => {
      uiStore.setTheme('dark');
      uiStore.setLoading(true);
      uiStore.setActiveTab('map-view');

      const state = get(uiStore);
      expect(state.activeTabId).toBe('map-view');
      expect(state.theme).toBe('dark');
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should update theme to light', () => {
      uiStore.setTheme('light');
      
      const state = get(uiStore);
      expect(state.theme).toBe('light');
    });

    it('should update theme to dark', () => {
      uiStore.setTheme('dark');
      
      const state = get(uiStore);
      expect(state.theme).toBe('dark');
    });

    it('should update theme to auto', () => {
      uiStore.setTheme('light');
      uiStore.setTheme('auto');
      
      const state = get(uiStore);
      expect(state.theme).toBe('auto');
    });

    it('should preserve other state properties', () => {
      uiStore.setActiveTab('custom-tab');
      uiStore.setTheme('dark');

      const state = get(uiStore);
      expect(state.theme).toBe('dark');
      expect(state.activeTabId).toBe('custom-tab');
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      uiStore.setLoading(true);
      
      const state = get(uiStore);
      expect(state.isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      uiStore.setLoading(true);
      uiStore.setLoading(false);
      
      const state = get(uiStore);
      expect(state.isLoading).toBe(false);
    });

    it('should preserve other state properties', () => {
      uiStore.setError('Test error');
      uiStore.setLoading(true);

      const state = get(uiStore);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('Test error');
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      uiStore.setError('Something went wrong');
      
      const state = get(uiStore);
      expect(state.error).toBe('Something went wrong');
    });

    it('should set error to null', () => {
      uiStore.setError('Error');
      uiStore.setError(null);
      
      const state = get(uiStore);
      expect(state.error).toBe(null);
    });

    it('should preserve other state properties', () => {
      uiStore.setLoading(true);
      uiStore.setError('API error');

      const state = get(uiStore);
      expect(state.error).toBe('API error');
      expect(state.isLoading).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      uiStore.setError('Test error');
      uiStore.clearError();
      
      const state = get(uiStore);
      expect(state.error).toBe(null);
    });

    it('should work when error is already null', () => {
      uiStore.clearError();
      
      const state = get(uiStore);
      expect(state.error).toBe(null);
    });

    it('should preserve other state properties', () => {
      uiStore.setActiveTab('custom-tab');
      uiStore.setError('Error');
      uiStore.clearError();

      const state = get(uiStore);
      expect(state.error).toBe(null);
      expect(state.activeTabId).toBe('custom-tab');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      uiStore.setActiveTab('custom-tab');
      uiStore.setTheme('dark');
      uiStore.setLoading(true);
      uiStore.setError('Error');

      uiStore.reset();

      const state = get(uiStore);
      expect(state.activeTabId).toBe('storage-overview');
      expect(state.theme).toBe('auto');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('reactivity', () => {
    it('should notify subscribers on state changes', () => {
      const states: UIState[] = [];
      
      const unsubscribe = uiStore.subscribe((state) => {
        states.push(state);
      });

      uiStore.setActiveTab('tab1');
      uiStore.setTheme('dark');
      uiStore.setLoading(true);

      unsubscribe();

      // Initial state + 3 updates
      expect(states.length).toBe(4);
      expect(states[1].activeTabId).toBe('tab1');
      expect(states[2].theme).toBe('dark');
      expect(states[3].isLoading).toBe(true);
    });
  });

  describe('multiple updates', () => {
    it('should handle multiple rapid updates correctly', () => {
      uiStore.setActiveTab('tab1');
      uiStore.setActiveTab('tab2');
      uiStore.setActiveTab('tab3');

      const state = get(uiStore);
      expect(state.activeTabId).toBe('tab3');
    });

    it('should handle complex state transitions', () => {
      // Simulate loading data
      uiStore.setLoading(true);
      uiStore.clearError();

      let state = get(uiStore);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);

      // Simulate error
      uiStore.setLoading(false);
      uiStore.setError('Failed to load');

      state = get(uiStore);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load');

      // Simulate retry
      uiStore.setLoading(true);
      uiStore.clearError();

      state = get(uiStore);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);

      // Simulate success
      uiStore.setLoading(false);

      state = get(uiStore);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });
  });
});
