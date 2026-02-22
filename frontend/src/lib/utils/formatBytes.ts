/**
 * Formats a byte value into a human-readable string with appropriate units
 * 
 * @param bytes - The number of bytes to format (must be non-negative)
 * @param decimals - Number of decimal places to display (default: 2, max: 10)
 * @returns Formatted string with unit (e.g., "1.5 GB", "256 MB", "0 B")
 * 
 * @example
 * formatBytes(0) // "0 B"
 * formatBytes(1024) // "1.00 KB"
 * formatBytes(1536, 1) // "1.5 KB"
 * formatBytes(1073741824) // "1.00 GB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  // Handle zero case
  if (bytes === 0) return '0 B';

  // Validate inputs
  if (bytes < 0) {
    throw new Error('Bytes must be non-negative');
  }
  
  if (decimals < 0 || decimals > 10) {
    throw new Error('Decimals must be between 0 and 10');
  }

  // Define units in order
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;

  // Calculate the appropriate unit index
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Ensure we don't exceed available units and handle values < 1
  const unitIndex = Math.max(0, Math.min(i, units.length - 1));
  
  // Calculate the value in the appropriate unit
  const value = bytes / Math.pow(k, unitIndex);
  
  // Format with specified decimal places
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}
