/**
 * Tab Registry Store
 * 
 * Custom store for managing tab registration with uniqueness enforcement
 * and automatic sorting by order property.
 * 
 * Requirements: 2.1.5, 2.2.5, 2.2.6, 2.7.1, 2.7.2, 2.7.3, 2.7.4
 */

import { writable } from 'svelte/store';
import type { TabDefinition } from '../types';

/**
 * Creates a tab registry store with custom registration logic
 */
function createTabRegistry() {
  const { subscribe, set, update } = writable<TabDefinition[]>([]);

  /**
   * Sorts tabs by their order property in ascending order
   * 
   * Requirements: 2.2.5, 2.7.4
   * 
   * @param tabs - Array of tab definitions to sort
   * @returns Sorted array of tabs
   */
  const sortTabs = (tabs: TabDefinition[]): TabDefinition[] => {
    return [...tabs].sort((a, b) => {
      const orderA = a.order ?? 100;
      const orderB = b.order ?? 100;
      return orderA - orderB;
    });
  };

  return {
    subscribe,

    /**
     * Registers a new tab in the registry
     * 
     * Requirements: 2.7.1, 2.7.2, 2.7.3, 2.7.4
     * 
     * Enforces tab uniqueness by ID and maintains tabs sorted by order property.
     * Assigns default order value (100) if not provided.
     * 
     * @param tabDef - The tab definition to register
     * @returns true if registration successful, false if tab with same ID already exists
     */
    registerTab: (tabDef: TabDefinition): boolean => {
      let registrationSuccessful = false;

      update((tabs) => {
        // Check for duplicate ID (Requirement 2.2.6, 2.7.2)
        const isDuplicate = tabs.some((tab) => tab.id === tabDef.id);
        
        if (isDuplicate) {
          console.warn(`Tab with ID "${tabDef.id}" already exists. Registration rejected.`);
          registrationSuccessful = false;
          return tabs;
        }

        // Assign default order if not provided (Requirement 2.7.3)
        const tabWithOrder: TabDefinition = {
          ...tabDef,
          order: tabDef.order ?? 100,
        };

        // Add tab and sort by order (Requirements 2.2.5, 2.7.4)
        const newTabs = [...tabs, tabWithOrder];
        registrationSuccessful = true;
        return sortTabs(newTabs);
      });

      return registrationSuccessful;
    },

    /**
     * Unregisters a tab from the registry
     * 
     * @param tabId - The ID of the tab to unregister
     * @returns true if tab was found and removed, false otherwise
     */
    unregisterTab: (tabId: string): boolean => {
      let removalSuccessful = false;

      update((tabs) => {
        const initialLength = tabs.length;
        const newTabs = tabs.filter((tab) => tab.id !== tabId);
        removalSuccessful = newTabs.length < initialLength;
        
        if (!removalSuccessful) {
          console.warn(`Tab with ID "${tabId}" not found. Removal failed.`);
        }
        
        return newTabs;
      });

      return removalSuccessful;
    },

    /**
     * Gets a tab by its ID
     * 
     * @param tabId - The ID of the tab to retrieve
     * @returns The tab definition if found, undefined otherwise
     */
    getTab: (tabId: string): TabDefinition | undefined => {
      let foundTab: TabDefinition | undefined;
      
      subscribe((tabs) => {
        foundTab = tabs.find((tab) => tab.id === tabId);
      })();

      return foundTab;
    },

    /**
     * Checks if a tab with the given ID exists
     * 
     * @param tabId - The ID to check
     * @returns true if tab exists, false otherwise
     */
    hasTab: (tabId: string): boolean => {
      let exists = false;
      
      subscribe((tabs) => {
        exists = tabs.some((tab) => tab.id === tabId);
      })();

      return exists;
    },

    /**
     * Clears all tabs from the registry
     */
    clear: () => {
      set([]);
    },

    /**
     * Sets the entire tab registry (with sorting)
     * 
     * Requirements: 2.2.5
     * 
     * @param tabs - Array of tab definitions
     */
    set: (tabs: TabDefinition[]) => {
      set(sortTabs(tabs));
    },
  };
}

/**
 * Tab registry store instance
 */
export const tabRegistry = createTabRegistry();
