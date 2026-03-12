<script lang="ts">
  import { onMount } from "svelte";
  import type { DashboardProps } from "./types";
  import { storageStore } from "./stores/storageStore";
  import { uiStore } from "./stores/uiStore";
  import { tabRegistry } from "./stores/tabRegistry";
  import { generateMockData } from "./utils/mockData";
  import StorageStats from "./components/StorageStats.svelte";
  import FileList from "./components/FileList.svelte";
  import type { FileItem } from "./types";
  import { fetchStorageData } from "./utils/fetchStorageData";

  export let apiEndpoint: DashboardProps["apiEndpoint"] = undefined;
  export let theme: DashboardProps["theme"] = "auto";
  export let initialTab: DashboardProps["initialTab"] = "storage-overview";
  export let customTabs: DashboardProps["customTabs"] = [];

  function getSystemTheme(): "dark" | "light" {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }
  console.log(getSystemTheme())

  async function initializeDashboard() {
    try {
      // If theme is auto, read system preference
      const finalTheme =
        theme = "dark";
      uiStore.setTheme(finalTheme);

      uiStore.setActiveTab(initialTab ?? "files");
      uiStore.setLoading(true);

      if (apiEndpoint) {
        await fetchStorageData(apiEndpoint);
      } else {
        const mockData = generateMockData();
        storageStore.set(mockData);
      }

      uiStore.setLoading(false);
    } catch (error) {
      uiStore.setLoading(false);
    }
  }

  function downloadFile(file: any) {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  /* Folder functionality */
  let currentPath = "";

  $: currentFolders =
    $storageStore.folders?.filter(
      (f) => f.path.split("/").slice(0, -1).join("/") === currentPath,
    ) ?? [];

  $: currentFiles = $storageStore.files.filter(
    (f) => f.path.split("/").slice(0, -1).join("/") === currentPath,
  );

  async function deleteFile(file: FileItem) {
    const res = await fetch(`http://localhost:8000/file/delete/${file.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      storageStore.update((store) => ({
        ...store,
        files: store.files.filter((f) => f.id !== file.id),
      }));
    }
  }

  let isUploading = false;
  async function uploadFile() {
    isUploading = true;

    const fileInput = document.createElement("input");
    fileInput.type = "file";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) {
        isUploading = false;
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/file/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

        const raw = await res.json();
        const newFile: FileItem = {
          ...raw,
          lastModified: new Date(raw.lastModified),
        };

        storageStore.update((store) => ({
          ...store,
          files: [newFile, ...store.files],
        }));
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        isUploading = false;
      }
    };

    fileInput.click();
  }

  onMount(() => {
    initializeDashboard();
  });

  $: isLoading = $uiStore.isLoading;
  $: error = $uiStore.error;
  $: currentTheme = $uiStore.theme;
  $: themeClass = currentTheme === "auto" ? "" : `theme-${currentTheme}`;
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
          <button class="upload-btn" on:click={uploadFile}
            >{isUploading ? "Uploading..." : "Upload"}</button
          >
        </div>
        <FileList
          files={currentFiles}
          folders={currentFolders}
          on:fileAction={(e) => {
            /* File button Functionality*/
            const { action, file } = e.detail;
            if (action === "download") downloadFile(file);
            if (action === "delete") deleteFile(file);
          }}
        />
      </section>
    </main>
  {/if}
</div>

<style>
  /* 1. FORCE THE ENTIRE BROWSER TO DARK MODE DEFAULT */
  :global(html, body, #app) {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-color: var(--dashboard-bg);
    color: var(--text-primary);
    overflow-x: hidden;
    font-family: -apple-system, system-ui, sans-serif;
  }

  /* 2. PARENT & TITLE FIXES (Svelte-generated) */
  :global(main.s-_lt6Cdtrjdys) {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    display: block !important;
  }

  :global(h1.s-_lt6Cdtrjdys) {
    display: none !important;
  }

  /* DASHBOARD WRAPPER */
  .dashboard-wrapper {
    min-height: 100vh;
    width: 100%;
    background-color: var(--dashboard-bg);
    color: var(--text-primary);
  }

  /* DASHBOARD HEADER */
  .dashboard-header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 1.5rem 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* MAIN CONTENT */
  .dashboard-content {
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
  }

  /* SECTION HEADER WITH BUTTONS */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  /* UPLOAD BUTTON */
  .upload-btn {
    background-color: var(--button-bg);
    color: var(--button-text);
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .upload-btn:hover {
    background-color: var(--button-hover-bg);
  }

  /* STATS AND FILES SECTION */
  .stats-section,
  .files-section {
    max-width: 1200px;
    margin: 0 auto 2rem auto;
  }

  /* FILES SECTION CARD */
  .files-section {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  }

  /* THEMES */
  .theme-light {
    --dashboard-bg: #f3f4f6;
    --header-bg: #ffffff;
    --card-bg: #f9fafb;
    --border-color: #e5e7eb;
    --text-primary: #111827;
    --button-bg: #b46a02;
    --button-hover-bg: #995900;
    --button-text: #ffffff;
  }

  .theme-dark {
    --dashboard-bg: #16181b;
    --header-bg: #141618;
    --card-bg: #1f2126;
    --border-color: #1f252e;
    --text-primary: #f9fafb;
    --button-bg: #c17f2a;
    --button-hover-bg: #b06d1f;
    --button-text: #ffffff;
  }
</style>
