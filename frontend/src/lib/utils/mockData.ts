/**
 * Mock data generator for demo mode
 * Generates realistic StorageData when no API endpoint is provided
 */

import type { StorageData, FileItem } from '../types';

/**
 * Generates realistic mock storage data for testing and demo purposes
 * 
 * @returns StorageData object with realistic file data
 * 
 * **Validates: Requirements 2.1.4**
 */
export function generateMockData(): StorageData {
  const totalStorage = 1024 * 1024 * 1024 * 100; // 100 GB
  
  // Generate mock files
  const files: FileItem[] = [
    {
      id: '1',
      name: 'vacation-photos.zip',
      size: 1024 * 1024 * 1024 * 5.2, // 5.2 GB
      type: 'application/zip',
      lastModified: new Date('2024-01-15T10:30:00'),
      path: '/documents/vacation-photos.zip'
    },
    {
      id: '2',
      name: 'presentation.pptx',
      size: 1024 * 1024 * 45, // 45 MB
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      lastModified: new Date('2024-02-20T14:15:00'),
      path: '/work/presentation.pptx'
    },
    {
      id: '3',
      name: 'project-video.mp4',
      size: 1024 * 1024 * 1024 * 2.8, // 2.8 GB
      type: 'video/mp4',
      lastModified: new Date('2024-01-10T09:00:00'),
      path: '/media/project-video.mp4'
    },
    {
      id: '4',
      name: 'database-backup.sql',
      size: 1024 * 1024 * 850, // 850 MB
      type: 'application/sql',
      lastModified: new Date('2024-03-01T02:00:00'),
      path: '/backups/database-backup.sql'
    },
    {
      id: '5',
      name: 'family-album.pdf',
      size: 1024 * 1024 * 120, // 120 MB
      type: 'application/pdf',
      lastModified: new Date('2023-12-25T18:30:00'),
      path: '/documents/family-album.pdf'
    },
    {
      id: '6',
      name: 'music-collection.zip',
      size: 1024 * 1024 * 1024 * 3.5, // 3.5 GB
      type: 'application/zip',
      lastModified: new Date('2024-02-14T16:45:00'),
      path: '/media/music-collection.zip'
    },
    {
      id: '7',
      name: 'report-2024.docx',
      size: 1024 * 1024 * 8.5, // 8.5 MB
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      lastModified: new Date('2024-03-10T11:20:00'),
      path: '/work/report-2024.docx'
    },
    {
      id: '8',
      name: 'website-images.tar.gz',
      size: 1024 * 1024 * 450, // 450 MB
      type: 'application/gzip',
      lastModified: new Date('2024-01-28T13:00:00'),
      path: '/projects/website-images.tar.gz'
    },
    {
      id: '9',
      name: 'training-video.mov',
      size: 1024 * 1024 * 1024 * 1.2, // 1.2 GB
      type: 'video/quicktime',
      lastModified: new Date('2024-02-05T10:10:00'),
      path: '/media/training-video.mov'
    },
    {
      id: '10',
      name: 'spreadsheet-data.xlsx',
      size: 1024 * 1024 * 25, // 25 MB
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      lastModified: new Date('2024-03-08T15:30:00'),
      path: '/work/spreadsheet-data.xlsx'
    },
    {
      id: '11',
      name: 'code-repository.zip',
      size: 1024 * 1024 * 180, // 180 MB
      type: 'application/zip',
      lastModified: new Date('2024-02-28T09:45:00'),
      path: '/projects/code-repository.zip'
    },
    {
      id: '12',
      name: 'conference-recording.mp4',
      size: 1024 * 1024 * 1024 * 4.1, // 4.1 GB
      type: 'video/mp4',
      lastModified: new Date('2024-01-20T14:00:00'),
      path: '/media/conference-recording.mp4'
    },
    {
      id: '13',
      name: 'design-assets.psd',
      size: 1024 * 1024 * 320, // 320 MB
      type: 'image/vnd.adobe.photoshop',
      lastModified: new Date('2024-02-18T12:30:00'),
      path: '/projects/design-assets.psd'
    },
    {
      id: '14',
      name: 'notes.txt',
      size: 1024 * 45, // 45 KB
      type: 'text/plain',
      lastModified: new Date('2024-03-12T08:15:00'),
      path: '/documents/notes.txt'
    },
    {
      id: '15',
      name: 'archive-2023.tar',
      size: 1024 * 1024 * 1024 * 6.8, // 6.8 GB
      type: 'application/x-tar',
      lastModified: new Date('2023-12-31T23:59:00'),
      path: '/backups/archive-2023.tar'
    }
  ];
  
  // Calculate used storage from files
  const usedStorage = files.reduce((sum, file) => sum + file.size, 0);
  
  // Calculate storage by type
  const storageByType: Record<string, number> = {};
  
  for (const file of files) {
    // Simplify type to main category
    let category: string;
    if (file.type.startsWith('video/')) {
      category = 'Video';
    } else if (file.type.startsWith('image/')) {
      category = 'Images';
    } else if (file.type.includes('zip') || file.type.includes('tar') || file.type.includes('gzip')) {
      category = 'Archives';
    } else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('presentation') || file.type.includes('spreadsheet')) {
      category = 'Documents';
    } else if (file.type.includes('sql')) {
      category = 'Databases';
    } else {
      category = 'Other';
    }
    
    storageByType[category] = (storageByType[category] || 0) + file.size;
  }
  
  return {
    totalStorage,
    usedStorage,
    files,
    storageByType,
    lastUpdated: new Date()
  };
}
