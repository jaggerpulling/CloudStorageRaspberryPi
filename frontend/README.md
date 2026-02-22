# Cloud Storage Dashboard

A modular Svelte dashboard component for cloud storage visualization.

## Features

- 📊 Storage usage statistics and visualization
- 📁 File list with sorting and filtering
- 🎨 Light and dark theme support
- 🔌 Extensible tab system for custom features
- 📦 Lightweight and tree-shakeable
- 🎯 TypeScript support with full type definitions

## Installation

```bash
npm install cloud-storage-dashboard
```

## Usage

```typescript
import Dashboard from 'cloud-storage-dashboard';
import 'cloud-storage-dashboard/style.css';

const app = new Dashboard({
  target: document.getElementById('app'),
  props: {
    apiEndpoint: 'https://api.example.com/storage',
    theme: 'auto',
    initialTab: 'storage-overview'
  }
});
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build library
npm run build
```

## License

MIT
