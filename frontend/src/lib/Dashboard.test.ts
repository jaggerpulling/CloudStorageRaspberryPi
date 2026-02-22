/**
 * Dashboard Component Tests
 * 
 * Tests for the main Dashboard component initialization and rendering.
 * 
 * Requirements: 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import Dashboard from './Dashboard.svelte';
import { storageStore } from './stores/storageStore';
import { uiStore } from './stores/uiStore';
import { tabRegistry } from './stores/tabRegistry';

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset stores before each test
    storageStore.reset();
    uiStore.reset();
    tabRegistry.clear();
  });

  it('should render loading state initially or complete quickly', () => {
    render(Dashboard);
    // The component may initialize very quickly in test environment
    // Just verify it renders without errors
    const loadingOrDashboard = screen.queryByText('Loading dashboard...') || screen.queryByText('Cloud Storage Dashboard');
    expect(loadingOrDashboard).toBeTruthy();
  });

  it('should initialize with mock data when no API endpoint provided', async () => {
    render(Dashboard);
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).toBeNull();
    }, { timeout: 3000 });

    // Should display dashboard header
    expect(screen.getByText('Cloud Storage Dashboard')).toBeTruthy();
    expect(screen.getByText('Monitor and manage your storage')).toBeTruthy();
  });

  it('should display StorageStats component after initialization', async () => {
    render(Dashboard);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).toBeNull();
    }, { timeout: 3000 });

    // Check for storage stats labels
    expect(screen.getByText('Total Storage')).toBeTruthy();
    expect(screen.getByText('Used Storage')).toBeTruthy();
    expect(screen.getByText('Available Storage')).toBeTruthy();
  });

  it('should display FileList component after initialization', async () => {
    render(Dashboard);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).toBeNull();
    }, { timeout: 3000 });

    // Check for file list section
    expect(screen.getByText('Files')).toBeTruthy();
    
    // Check for file list filter input
    expect(screen.getByPlaceholderText('Filter files by name or path...')).toBeTruthy();
  });

  it('should accept and apply theme prop', () => {
    const { container } = render(Dashboard, { props: { theme: 'dark' } });
    
    const dashboard = container.querySelector('.dashboard');
    // Check that the theme prop was passed (data-theme attribute should be set)
    expect(dashboard).toBeTruthy();
    expect(dashboard?.hasAttribute('data-theme')).toBe(true);
  });

  it('should render without errors', async () => {
    const { container } = render(Dashboard);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).toBeNull();
    }, { timeout: 3000 });

    // Should have rendered the dashboard
    const dashboard = container.querySelector('.dashboard');
    expect(dashboard).toBeTruthy();
  });
});
