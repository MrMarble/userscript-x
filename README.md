# Userscript-X

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Node Version](https://img.shields.io/badge/node-%5E20.19.0%20%7C%7C%20%3E%3D22.12.0-brightgreen)](https://nodejs.org)

> Modern development toolkit for userscripts with TypeScript, hot reload, and zero-config setup.

Build userscripts with the same developer experience as modern web applications. No more manual setup, no more copy-pasting boilerplate—just run one command and start coding.

## Features

- **Zero Config** - Works out of the box, no complex setup required
- **TypeScript First** - Full type safety and IntelliSense support
- **Hot Reload** - See changes instantly without manual refresh
- **Modern Tooling** - Import npm packages, use ES modules
- **Auto Header Generation** - Metadata from config → userscript header

## Packages

This monorepo contains three packages:

| Package | Version | Description |
|---------|---------|-------------|
| [create-usx](./packages/create-usx) | [![npm](https://img.shields.io/npm/v/create-usx.svg)](https://www.npmjs.com/package/create-usx) | Scaffolding CLI for new projects |
| [@userscript-x/dev](./packages/dev) | [![npm](https://img.shields.io/npm/v/@userscript-x/dev.svg)](https://www.npmjs.com/package/@userscript-x/dev) | Build system and dev server |
| [@userscript-x/core](./packages/core) | [![npm](https://img.shields.io/npm/v/@userscript-x/core.svg)](https://www.npmjs.com/package/@userscript-x/core) | Zero-dependency runtime utilities |

## Quick Start

```bash
# Create a new userscript project
npm create usx@latest

# Navigate to your project
cd my-script

# Start development server
npm run dev

# Build for production
npm run build
```

## Example

```typescript
// src/main.ts
import { waitFor, storage } from '@userscript-x/core';

// Wait for an element to appear
const button = await waitFor('#submit-button');

// Use typed storage
const count = await storage.get('click-count', 0);
await storage.set('click-count', count + 1);

button.addEventListener('click', () => {
  console.log('Button clicked!');
});
```

## Requirements

- Node.js ^20.19.0 || >=22.12.0
- npm, pnpm, or yarn

## Development

This monorepo uses [pnpm workspaces](https://pnpm.io/workspaces):

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all packages in dev mode
pnpm dev

# Run linter
pnpm lint

# Format code
pnpm format
```

## License

MIT © [Alvaro Tinoco](https://github.com/mrmarble)

## Links

- [GitHub Repository](https://github.com/mrmarble/userscript-x)
- [Report Issues](https://github.com/mrmarble/userscript-x/issues)
