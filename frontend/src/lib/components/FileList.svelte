<script lang="ts">
  /**
   * FileList Component
   * 
   * Displays a sortable, filterable table of files with selection support.
   * Features:
   * - Table with columns: name, size, type, date
   * - Sort controls with state management
   * - Filter input with debouncing
   * - File selection (single and multiple)
   * - File action events
   * 
   * Requirements: 2.4.1, 2.4.2, 2.4.3, 2.4.4, 2.4.5, 2.4.6
   */
  
  import { createEventDispatcher } from 'svelte';
  import type { FileItem, SortField, SortOrder } from '../types';
  import { sortFiles } from '../utils/sortFiles';
  import { filterFiles } from '../utils/filterFiles';
  import { formatBytes } from '../utils/formatBytes';

  // Props
  export let files: FileItem[] = [];
  
  // Event dispatcher for file actions
  const dispatch = createEventDispatcher<{
    fileSelect: FileItem;
    fileAction: { action: string; file: FileItem };
  }>();

  // Component state
  let sortBy: SortField = 'name';
  let sortOrder: SortOrder = 'asc';
  let filterText: string = '';
  let selectedFiles: Set<string> = new Set();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let debouncedFilterText: string = '';
  let initialRender = true;

  // Debounce filter input (300ms delay)
  $: {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debouncedFilterText = filterText;
    }, 300);
  }

  // Apply sorting and filtering
  $: sortedFiles = sortFiles(files, sortBy, sortOrder);
  $: displayFiles = filterFiles(sortedFiles, debouncedFilterText);

  // Handle sort column click
  function handleSort(field: SortField) {
    if (sortBy === field) {
      // Toggle order if same field
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to ascending
      sortBy = field;
      sortOrder = 'asc';
    }
  }

  // Handle file selection
  function handleFileSelect(file: FileItem, event: MouseEvent) {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      if (selectedFiles.has(file.id)) {
        selectedFiles.delete(file.id);
      } else {
        selectedFiles.add(file.id);
      }
      selectedFiles = selectedFiles; // Trigger reactivity
    } else {
      // Single select
      selectedFiles = new Set([file.id]);
    }
    
    dispatch('fileSelect', file);
  }

  // Handle file action
  function handleFileAction(action: string, file: FileItem) {
    dispatch('fileAction', { action, file });
  }

  // Format date for display
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Get sort indicator
  function getSortIndicator(field: SortField): string {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? '↑' : '↓';
  }
</script>

<div class="file-list">
  <!-- Filter input -->
  <div class="filter-section">
    <input
      type="text"
      bind:value={filterText}
      placeholder="Filter files by name or path..."
      class="filter-input"
      aria-label="Filter files"
    />
    <div class="file-count">
      {displayFiles.length} of {files.length} files
    </div>
  </div>

  <!-- File table -->
  <div class="table-container">
    <table class="file-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={selectedFiles.size === displayFiles.length && displayFiles.length > 0}
              indeterminate={selectedFiles.size > 0 && selectedFiles.size < displayFiles.length}
              on:change={(e) => {
                if (e.currentTarget.checked) {
                  selectedFiles = new Set(displayFiles.map(f => f.id));
                } else {
                  selectedFiles = new Set();
                }
              }}
              aria-label="Select all files"
            />
          </th>
          <th class="sortable" on:click={() => handleSort('name')}>
            Name {getSortIndicator('name')}
          </th>
          <th class="sortable" on:click={() => handleSort('size')}>
            Size {getSortIndicator('size')}
          </th>
          <th class="sortable" on:click={() => handleSort('type')}>
            Type {getSortIndicator('type')}
          </th>
          <th class="sortable" on:click={() => handleSort('date')}>
            Last Modified {getSortIndicator('date')}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each displayFiles as file (file.id)}
          <tr
            class:selected={selectedFiles.has(file.id)}
            on:click={(e) => handleFileSelect(file, e)}
          >
            <td>
              <input
                type="checkbox"
                checked={selectedFiles.has(file.id)}
                on:click|stopPropagation
                on:change={() => {
                  if (selectedFiles.has(file.id)) {
                    selectedFiles.delete(file.id);
                  } else {
                    selectedFiles.add(file.id);
                  }
                  selectedFiles = selectedFiles;
                }}
                aria-label={`Select ${file.name}`}
              />
            </td>
            <td class="file-name" title={file.path}>
              {file.name}
            </td>
            <td>{formatBytes(file.size)}</td>
            <td>{file.type}</td>
            <td>{formatDate(file.lastModified)}</td>
            <td class="actions">
              <button
                class="action-btn"
                on:click|stopPropagation={() => handleFileAction('download', file)}
                aria-label={`Download ${file.name}`}
              >
                Download
              </button>
              <button
                class="action-btn danger"
                on:click|stopPropagation={() => handleFileAction('delete', file)}
                aria-label={`Delete ${file.name}`}
              >
                Delete
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="empty-state">
              {filterText ? 'No files match your filter' : 'No files to display'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .filter-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-input {
    flex: 1;
    min-width: 250px;
    padding: 0.5rem 1rem;
    border: 1px solid var(--input-border, #d1d5db);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: var(--input-bg, #ffffff);
    color: var(--text-primary, #111827);
  }

  .filter-input:focus {
    outline: none;
    border-color: var(--input-focus, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .file-count {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    font-weight: 500;
  }

  .table-container {
    overflow-x: auto;
    border: 1px solid var(--table-border, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--table-bg, #ffffff);
  }

  .file-table {
    width: 100%;
    border-collapse: collapse;
  }

  .file-table thead {
    background: var(--table-header-bg, #f9fafb);
    border-bottom: 2px solid var(--table-border, #e5e7eb);
  }

  .file-table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
    white-space: nowrap;
  }

  .file-table th.sortable {
    cursor: pointer;
    user-select: none;
  }

  .file-table th.sortable:hover {
    background: var(--table-header-hover, #f3f4f6);
  }

  .file-table tbody tr {
    border-bottom: 1px solid var(--table-border, #e5e7eb);
    transition: background-color 0.15s ease;
  }

  .file-table tbody tr:hover {
    background: var(--table-row-hover, #f9fafb);
  }

  .file-table tbody tr.selected {
    background: var(--table-row-selected, #eff6ff);
  }

  .file-table tbody tr:last-child {
    border-bottom: none;
  }

  .file-table td {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: var(--text-primary, #111827);
  }

  .file-name {
    font-weight: 500;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid var(--btn-border, #d1d5db);
    border-radius: 0.25rem;
    background: var(--btn-bg, #ffffff);
    color: var(--btn-text, #374151);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: var(--btn-hover-bg, #f3f4f6);
    border-color: var(--btn-hover-border, #9ca3af);
  }

  .action-btn.danger {
    color: var(--danger-text, #dc2626);
  }

  .action-btn.danger:hover {
    background: var(--danger-hover-bg, #fee2e2);
    border-color: var(--danger-hover-border, #fca5a5);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem !important;
    color: var(--text-secondary, #6b7280);
    font-style: italic;
  }

  input[type="checkbox"] {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .filter-input {
      --input-bg: #1f2937;
      --input-border: #374151;
      --text-primary: #f9fafb;
      --input-focus: #60a5fa;
    }

    .file-count {
      --text-secondary: #9ca3af;
    }

    .table-container {
      --table-bg: #1f2937;
      --table-border: #374151;
    }

    .file-table thead {
      --table-header-bg: #111827;
    }

    .file-table th {
      --text-primary: #f9fafb;
    }

    .file-table th.sortable:hover {
      --table-header-hover: #1f2937;
    }

    .file-table tbody tr:hover {
      --table-row-hover: #111827;
    }

    .file-table tbody tr.selected {
      --table-row-selected: #1e3a5f;
    }

    .file-table td {
      --text-primary: #f9fafb;
    }

    .action-btn {
      --btn-bg: #374151;
      --btn-border: #4b5563;
      --btn-text: #f9fafb;
      --btn-hover-bg: #4b5563;
      --btn-hover-border: #6b7280;
    }

    .action-btn.danger {
      --danger-text: #f87171;
      --danger-hover-bg: #7f1d1d;
      --danger-hover-border: #991b1b;
    }

    .empty-state {
      --text-secondary: #9ca3af;
    }
  }
</style>
