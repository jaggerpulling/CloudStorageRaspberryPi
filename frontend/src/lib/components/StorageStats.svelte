<script lang="ts">
  /**
   * StorageStats Component
   * 
   * Displays key storage metrics in card format:
   * - Total, used, and available storage with human-readable formatting
   * - Storage usage percentage
   * - Total file count
   * 
   * Requirements: 2.3.1, 2.3.2, 2.3.3, 2.3.4, 2.3.5, 2.3.6
   */
  
  import { storageStore, storagePercentage, availableStorage } from '../stores/storageStore';
  import { formatBytes } from '../utils/formatBytes';

  // Subscribe to storage store for reactive updates
  $: totalStorage = $storageStore.totalStorage;
  $: usedStorage = $storageStore.usedStorage;
  $: available = $availableStorage;
  $: percentage = $storagePercentage;
  $: fileCount = $storageStore.files.length;
</script>

<div class="storage-stats">
  <div class="stat-card">
    <div class="stat-label">Total Storage</div>
    <div class="stat-value">{formatBytes(totalStorage)}</div>
  </div>

  <div class="stat-card">
    <div class="stat-label">Used Storage</div>
    <div class="stat-value">{formatBytes(usedStorage)}</div>
  </div>

  <div class="stat-card">
    <div class="stat-label">Available Storage</div>
    <div class="stat-value">{formatBytes(available)}</div>
  </div>

  <div class="stat-card">
    <div class="stat-label">Storage Used</div>
    <div class="stat-value">{percentage.toFixed(1)}%</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {percentage}%"></div>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-label">Total Files</div>
    <div class="stat-value">{fileCount.toLocaleString()}</div>
  </div>
</div>

<style>
  .storage-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .stat-card {
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--card-border, #e5e7eb);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .progress-bar {
    margin-top: 0.75rem;
    height: 0.5rem;
    background: var(--progress-bg, #e5e7eb);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--progress-fill, #3b82f6);
    transition: width 0.3s ease;
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .stat-card {
      --card-bg: #1f2937;
      --card-border: #374151;
    }

    .stat-label {
      --text-secondary: #9ca3af;
    }

    .stat-value {
      --text-primary: #f9fafb;
    }

    .progress-bar {
      --progress-bg: #374151;
    }
  }
</style>
