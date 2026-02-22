/**
 * UI State Store
 * 
 * Writable store for managing UIState with helper methods.
 * 
 * Requirements: 2.1.5, 4.4.1, 4.4.2, 4.4.3, 4.4.4
 */

import { writable } from 'svelte/store';
import type { UIState } from '../types';

/**
 * Initial UI state
 */
const initialUIState: UIState = {
  activeTabId: 'storage-overview',
  theme: 'auto',
  isLoading: false,
  error: null,
};

/**
 * Creates a UI state store with helper methods
 */
function createUIStore() {
  const { subscribe, set, update } = writable<UIState>(initialUIState);

  return {
    subscribe,

    /**
     * Sets the entire UI state
     * 
     * Requirements: 2.1.5
     * 
     * @param state - The UI state to set
     */
    set,

    /**
     * Updates UI state
     * 
     * Requirements: 2.1.5
     * 
     * @param updater - Function that receives current state and returns updated state
     */
    update,

    /**
     * Sets the active tab ID
     * 
     * Requirements: 4.4.1
     * 
     * @param tabId - The ID of the tab to activate
     */
    setActiveTab: (tabId: string) => {
      update((state) => ({
        ...state,
        activeTabId: tabId,
      }));
    },

    /**
     * Sets the theme
     * 
     * Requirements: 4.4.2
     * 
     * @param theme - The theme to apply ('light', 'dark', or 'auto')
     */
    setTheme: (theme: 'light' | 'dark' | 'auto') => {
      update((state) => ({
        ...state,
        theme,
      }));
    },

    /**
     * Sets the loading state
     * 
     * Requirements: 4.4.3
     * 
     * @param isLoading - Whether the app is in a loading state
     */
    setLoading: (isLoading: boolean) => {
      update((state) => ({
        ...state,
        isLoading,
      }));
    },

    /**
     * Sets an error message
     * 
     * Requirements: 4.4.4
     * 
     * @param error - The error message to display, or null to clear
     */
    setError: (error: string | null) => {
      update((state) => ({
        ...state,
        error,
      }));
    },

    /**
     * Clears the error message
     * 
     * Requirements: 4.4.4
     */
    clearError: () => {
      update((state) => ({
        ...state,
        error: null,
      }));
    },

    /**
     * Resets the store to initial state
     */
    reset: () => {
      set(initialUIState);
    },
  };
}

/**
 * UI state store instance
 */
export const uiStore = createUIStore();
