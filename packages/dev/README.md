# @userscript-x/dev

[![npm version](https://img.shields.io/npm/v/@userscript-x/dev.svg)](https://www.npmjs.com/package/@userscript-x/dev)

Development tooling for userscripts with hot reload and build capabilities.

## Features

- 🔥 **Hot Reload** - Instant updates during development
- 📦 **Smart Bundling** - TypeScript compilation with automatic userscript header generation
- ⚡ **Fast Dev Server** - WebSocket-based development server
- 🎯 **Zero Config** - Works out of the box with sensible defaults
- 🔧 **Configurable** - Customize via `userscript.config.ts`

## Installation

```bash
npm install -D @userscript-x/dev
```

Or with other package managers:

```bash
# yarn
yarn add -D @userscript-x/dev

# pnpm
pnpm add -D @userscript-x/dev

# bun
bun add -D @userscript-x/dev
```

## Usage

### Development

Start the development server with hot reload:

```bash
npx usx dev
```

This will:
- Start a development server (default port: 3000)
- Watch for file changes
- Automatically reload your userscript in the browser

### Production Build

Build your userscript for production:

```bash
npx usx build
```

This generates a production-ready `.user.js` file in your `dist` directory with:
- Minified and bundled code
- Auto-generated userscript metadata header
- All dependencies included

### CLI Options

```bash
# Specify a custom config file
usx dev --config my-config.ts

# Use a custom port for dev server
usx dev --port 8080

# Show help
usx --help
```

## Configuration

Create a `userscript.config.ts` file in your project root:

```typescript
import { defineConfig } from '@userscript-x/dev';

export default defineConfig({
  metadata: {
    name: 'My Userscript',
    namespace: 'https://example.com',
    version: '1.0.0',
    description: 'My awesome userscript',
    author: 'Your Name',
    match: ['https://example.com/*'],
    grant: ['GM_getValue', 'GM_setValue'],
  },
  build: {
    entry: 'src/main.ts',
    outDir: 'dist',
    fileName: 'script.user.js',
  },
});
```

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "usx dev",
    "build": "usx build"
  }
}
```

## License

MIT
