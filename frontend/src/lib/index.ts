/**
 * Cloud Storage Dashboard - Main Library Entry Point
 * 
 * A modular Svelte dashboard component for cloud storage visualization
 */

// Export all types
export type {
  FileItem,
  StorageData,
  TabDefinition,
  UIState,
  DashboardProps,
  SortField,
  SortOrder,
  ChartType,
  StorageStatsProps,
  FileListProps,
  StorageChartProps,
  TabNavigationProps
} from './types';

// Components
export { default as Dashboard } from './Dashboard.svelte';
export { default as StorageStats } from './components/StorageStats.svelte';
export { default as FileList } from './components/FileList.svelte';
// export { default as StorageChart } from './components/StorageChart.svelte';

// Stores
export { storageStore, storagePercentage, availableStorage } from './stores/storageStore';
export { uiStore } from './stores/uiStore';
export { tabRegistry } from './stores/tabRegistry';

// Utils
export { formatBytes } from './utils/formatBytes';
export { sortFiles } from './utils/sortFiles';
export { filterFiles } from './utils/filterFiles';
export { generateMockData } from './utils/mockData';
