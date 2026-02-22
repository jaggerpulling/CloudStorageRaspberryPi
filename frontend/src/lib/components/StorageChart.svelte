<script lang="ts">
  import type { ChartType } from '../types';
  import { formatBytes } from '../utils';

  /**
   * StorageChart Component
   * 
   * Displays storage usage breakdown by file type with support for multiple chart types.
   * For MVP, uses CSS-based visualization without external chart libraries.
   * 
   * **Validates: Requirements 2.5.1, 2.5.2, 2.5.3, 2.5.4**
   */

  export let storageByType: Record<string, number> = {};
  export let chartType: ChartType = 'pie';

  // Color palette for different file types
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  // Calculate total and percentages
  $: total = Object.values(storageByType).reduce((sum, size) => sum + size, 0);
  $: entries = Object.entries(storageByType)
    .map(([type, size], index) => ({
      type,
      size,
      percentage: total > 0 ? (size / total) * 100 : 0,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.size - a.size);

  // For pie/donut charts, calculate cumulative percentages for positioning
  $: cumulativePercentages = entries.reduce((acc, entry, index) => {
    const previous = index > 0 ? acc[index - 1] : 0;
    acc.push(previous + entry.percentage);
    return acc;
  }, [] as number[]);

  // Tooltip state
  let hoveredIndex: number | null = null;
  let tooltipX = 0;
  let tooltipY = 0;

  function handleMouseEnter(index: number, event: MouseEvent) {
    hoveredIndex = index;
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function handleMouseLeave() {
    hoveredIndex = null;
  }

  function handleMouseMove(event: MouseEvent) {
    if (hoveredIndex !== null) {
      tooltipX = event.clientX;
      tooltipY = event.clientY;
    }
  }

  // Generate SVG path for pie/donut slice
  function getSlicePath(startPercent: number, endPercent: number, isDonut: boolean): string {
    const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (endPercent / 100) * 2 * Math.PI - Math.PI / 2;
    
    const outerRadius = 90;
    const innerRadius = isDonut ? 50 : 0;
    
    const x1 = 100 + outerRadius * Math.cos(startAngle);
    const y1 = 100 + outerRadius * Math.sin(startAngle);
    const x2 = 100 + outerRadius * Math.cos(endAngle);
    const y2 = 100 + outerRadius * Math.sin(endAngle);
    
    const largeArc = endPercent - startPercent > 50 ? 1 : 0;
    
    if (isDonut) {
      const x3 = 100 + innerRadius * Math.cos(endAngle);
      const y3 = 100 + innerRadius * Math.sin(endAngle);
      const x4 = 100 + innerRadius * Math.cos(startAngle);
      const y4 = 100 + innerRadius * Math.sin(startAngle);
      
      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    } else {
      return `M 100 100 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }
  }
</script>

<div class="storage-chart" on:mousemove={handleMouseMove} role="img" aria-label="Storage usage chart">
  {#if entries.length === 0}
    <div class="empty-state">
      <p>No storage data available</p>
    </div>
  {:else if chartType === 'bar'}
    <div class="bar-chart">
      {#each entries as entry, index}
        <div class="bar-item">
          <div class="bar-label">
            <span class="type-name">{entry.type}</span>
            <span class="type-size">{formatBytes(entry.size)}</span>
          </div>
          <div class="bar-container">
            <div 
              class="bar-fill"
              style="width: {entry.percentage}%; background-color: {entry.color};"
              on:mouseenter={(e) => handleMouseEnter(index, e)}
              on:mouseleave={handleMouseLeave}
              role="presentation"
            />
          </div>
          <span class="bar-percentage">{entry.percentage.toFixed(1)}%</span>
        </div>
      {/each}
    </div>
  {:else}
    <svg viewBox="0 0 200 200" class="pie-chart">
      {#each entries as entry, index}
        {@const startPercent = index > 0 ? cumulativePercentages[index - 1] : 0}
        {@const endPercent = cumulativePercentages[index]}
        <path
          d={getSlicePath(startPercent, endPercent, chartType === 'donut')}
          fill={entry.color}
          stroke="white"
          stroke-width="2"
          class="slice"
          on:mouseenter={(e) => handleMouseEnter(index, e)}
          on:mouseleave={handleMouseLeave}
          role="presentation"
        />
      {/each}
      
      {#if chartType === 'donut'}
        <circle cx="100" cy="100" r="48" fill="var(--chart-bg, white)" />
        <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" class="donut-center">
          {entries.length}
        </text>
        <text x="100" y="115" text-anchor="middle" dominant-baseline="middle" class="donut-label">
          types
        </text>
      {/if}
    </svg>
  {/if}

  <!-- Legend -->
  {#if entries.length > 0}
    <div class="legend">
      {#each entries as entry, index}
        <div 
          class="legend-item"
          class:hovered={hoveredIndex === index}
          on:mouseenter={(e) => handleMouseEnter(index, e)}
          on:mouseleave={handleMouseLeave}
        >
          <span class="legend-color" style="background-color: {entry.color};" />
          <span class="legend-text">
            <span class="legend-type">{entry.type}</span>
            <span class="legend-details">
              {formatBytes(entry.size)} ({entry.percentage.toFixed(1)}%)
            </span>
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Tooltip -->
  {#if hoveredIndex !== null}
    {@const entry = entries[hoveredIndex]}
    <div 
      class="tooltip"
      style="left: {tooltipX + 10}px; top: {tooltipY + 10}px;"
    >
      <div class="tooltip-header" style="background-color: {entry.color};">
        {entry.type}
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span>Size:</span>
          <strong>{formatBytes(entry.size)}</strong>
        </div>
        <div class="tooltip-row">
          <span>Percentage:</span>
          <strong>{entry.percentage.toFixed(2)}%</strong>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .storage-chart {
    position: relative;
    width: 100%;
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* Bar Chart Styles */
  .bar-chart {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .bar-item {
    display: grid;
    grid-template-columns: 150px 1fr 60px;
    gap: 0.75rem;
    align-items: center;
  }

  .bar-label {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .type-name {
    font-weight: 500;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .type-size {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .bar-container {
    height: 24px;
    background-color: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    transition: opacity 0.2s;
    cursor: pointer;
  }

  .bar-fill:hover {
    opacity: 0.8;
  }

  .bar-percentage {
    text-align: right;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
  }

  /* Pie/Donut Chart Styles */
  .pie-chart {
    max-width: 300px;
    margin: 0 auto;
  }

  .slice {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .slice:hover {
    opacity: 0.8;
  }

  .donut-center {
    font-size: 24px;
    font-weight: 600;
    fill: #1f2937;
  }

  .donut-label {
    font-size: 12px;
    fill: #6b7280;
  }

  /* Legend Styles */
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .legend-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    flex: 1 1 200px;
  }

  .legend-item:hover,
  .legend-item.hovered {
    background-color: #f9fafb;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .legend-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .legend-type {
    font-weight: 500;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .legend-details {
    font-size: 0.75rem;
    color: #6b7280;
  }

  /* Tooltip Styles */
  .tooltip {
    position: fixed;
    z-index: 1000;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    pointer-events: none;
    min-width: 200px;
    overflow: hidden;
  }

  .tooltip-header {
    padding: 0.5rem 0.75rem;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .tooltip-body {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .tooltip-row span {
    color: #6b7280;
  }

  .tooltip-row strong {
    color: #1f2937;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .type-name,
    .legend-type,
    .donut-center,
    .tooltip-row strong {
      color: #f9fafb;
    }

    .type-size,
    .legend-details,
    .donut-label,
    .tooltip-row span {
      color: #9ca3af;
    }

    .bar-container {
      background-color: #374151;
    }

    .bar-percentage {
      color: #d1d5db;
    }

    .legend {
      border-top-color: #374151;
    }

    .legend-item:hover,
    .legend-item.hovered {
      background-color: #1f2937;
    }

    .tooltip {
      background: #1f2937;
    }

    .empty-state {
      color: #9ca3af;
    }
  }
</style>
