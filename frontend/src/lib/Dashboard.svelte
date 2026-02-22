<script lang="ts">
  import { onMount } from 'svelte';
  import type { DashboardProps } from './types';
  import { storageStore } from './stores/storageStore';
  import { uiStore } from './stores/uiStore';
  import { tabRegistry } from './stores/tabRegistry';
  import { generateMockData } from './utils/mockData';
  import StorageStats from './components/StorageStats.svelte';
  import FileList from './components/FileList.svelte';

  export let apiEndpoint: DashboardProps['apiEndpoint'] = undefined;
  export let theme: DashboardProps['theme'] = 'auto';
  export let initialTab: DashboardProps['initialTab'] = 'storage-overview';
  export let customTabs: DashboardProps['customTabs'] = [];

  async function initializeDashboard() {
    try {
      uiStore.setTheme(theme);
      uiStore.setActiveTab(initialTab);
      uiStore.setLoading(true);
      
      const mockData = generateMockData();
      storageStore.set(mockData);

      uiStore.setLoading(false);
    } catch (error) {
      uiStore.setLoading(false);
    }
  }

  onMount(() => {
    initializeDashboard();
  });

  $: isLoading = $uiStore.isLoading;
  $: error = $uiStore.error;
  $: currentTheme = $uiStore.theme;
  $: themeClass = currentTheme === 'auto' ? '' : `theme-${currentTheme}`;
</script>

<div class="dashboard-wrapper {themeClass}" data-theme={currentTheme}>
  {#if isLoading}
    <div class="status-msg">Loading...</div>
  {:else if error}
    <div class="status-msg">Error: {error}</div>
  {:else}
    <header class="dashboard-header">
      <div class="header-container">
        <h1>Cloud Storage</h1>
        <p class="subtitle">Monitor and manage your storage</p>
      </div>
    </header>

    <main class="dashboard-content">
      <section class="stats-section">
        <StorageStats />
      </section>

      <section class="files-section">
        <div class="section-header">
          <h2>Files</h2>
        </div>
        <FileList files={$storageStore.files} />
      </section>
    </main>
  {/if}
</div>

<style>
  /* 1. THE FOUNDATION: FORCE THE ENTIRE BROWSER TO DARK MODE */
  :global(html, body, #app) {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-color: #111827 !important; /* Forces the white sides to stay dark */
    overflow-x: hidden;
  }

  /* 2. THE PARENT KILLER: Forces the Svelte-generated parent to vanish */
  :global(main.s-_lt6Cdtrjdys) {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    display: block !important;
  }

  /* 3. THE TITLE KILLER: Keeps that duplicate header gone */
  :global(h1.s-_lt6Cdtrjdys) {
    display: none !important;
  }

  .dashboard-wrapper {
    min-height: 100vh;
    width: 100%;
    background-color: var(--dashboard-bg);
    color: var(--text-primary);
    font-family: -apple-system, system-ui, sans-serif;
  }

  .dashboard-header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 1.5rem 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  /* 4. CONTAINERIZING THE CONTENT: 
     We keep the background full width, but cap the text inside */
  .dashboard-content {
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
  }

  /* This is where the magic happens for the big monitor */
  .stats-section, 
  .files-section {
    max-width: 1200px; /* Limits the table width so it's readable */
    margin: 0 auto 2rem auto; /* Centers the card, not the whole page */
  }

  /* This makes the file area look like a professional "App" container */
  .files-section {
    background-color: var(--header-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* THEMES */
  .theme-light {
    --dashboard-bg: #f3f4f6;
    --header-bg: #ffffff;
    --border-color: #e5e7eb;
    --text-primary: #111827;
  }

  .theme-dark, :global(.dashboard-wrapper) {
    --dashboard-bg: #111827; /* Dark background */
    --header-bg: #1f2937;    /* Lighter grey-blue for the cards */
    --border-color: #374151;
    --text-primary: #f9fafb;
  }
</style>