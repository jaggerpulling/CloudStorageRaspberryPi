/**
 * Core TypeScript interfaces for Cloud Storage Dashboard
 */

import type { SvelteComponent } from 'svelte';

/**
 * Represents a file item in the storage system
 */
export interface FileItem {
  /** Unique file identifier */
  id: string;
  /** File name with extension */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type or file extension */
  type: string;
  /** Last modification timestamp */
  lastModified: Date;
  /** Full file path */
  path: string;
}

/**
 * Represents the complete storage data model
 */
export interface StorageData {
  /** Total storage capacity in bytes */
  totalStorage: number;
  /** Used storage in bytes */
  usedStorage: number;
  /** Array of file items */
  files: FileItem[];
  /** Storage used per file type (in bytes) */
  storageByType: Record<string, number>;
  /** Timestamp of last data fetch */
  lastUpdated: Date;
}

/**
 * Defines a custom tab for the dashboard
 */
export interface TabDefinition {
  /** Unique tab identifier */
  id: string;
  /** Display label for tab */
  label: string;
  /** Optional icon name or SVG */
  icon?: string;
  /** Svelte component to render */
  component: typeof SvelteComponent;
  /** Optional display order (default: 100) */
  order?: number;
}

/**
 * Represents the UI state of the dashboard
 */
export interface UIState {
  /** Currently active tab ID */
  activeTabId: string;
  /** Current theme */
  theme: 'light' | 'dark' | 'auto';
  /** Global loading state */
  isLoading: boolean;
  /** Global error message */
  error: string | null;
}

/**
 * Configuration props for the Dashboard component
 */
export interface DashboardProps {
  /** Optional API endpoint for fetching storage data */
  apiEndpoint?: string;
  /** Theme preference */
  theme?: 'light' | 'dark' | 'auto';
  /** Initial tab to display */
  initialTab?: string;
  /** Custom tabs to register */
  customTabs?: TabDefinition[];
}

/**
 * Sort field options for file list
 */
export type SortField = 'name' | 'size' | 'date' | 'type';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Chart type options for storage visualization
 */
export type ChartType = 'pie' | 'bar' | 'donut';

/**
 * Props for StorageStats component
 */
export interface StorageStatsProps {
  totalStorage: number;
  usedStorage: number;
  fileCount: number;
}

/**
 * Props for FileList component
 */
export interface FileListProps {
  files: FileItem[];
  onFileSelect?: (file: FileItem) => void;
  onFileAction?: (action: string, file: FileItem) => void;
}

/**
 * Props for StorageChart component
 */
export interface StorageChartProps {
  storageByType: Record<string, number>;
  chartType?: ChartType;
}

/**
 * Props for TabNavigation component
 */
export interface TabNavigationProps {
  tabs: TabDefinition[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}
