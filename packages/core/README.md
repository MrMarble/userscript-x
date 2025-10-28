# @userscript-x/core

[![npm version](https://img.shields.io/npm/v/@userscript-x/core.svg)](https://www.npmjs.com/package/@userscript-x/core)

Runtime utilities for userscripts with type-safe wrappers and modern APIs.

## Features

- 🎯 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🔍 **DOM Helpers** - Easy element selection and observation
- 💾 **Storage API** - Type-safe wrapper around GM storage
- 🌐 **HTTP Utilities** - Fetch-like API for cross-origin requests
- 🎨 **Style Injection** - Add custom CSS to pages
- 📦 **Zero Dependencies** - Minimal, lightweight runtime
- 🔄 **Graceful Fallbacks** - Works with or without GM APIs

## Installation

```bash
npm install @userscript-x/core
```

Or with other package managers:

```bash
# yarn
yarn add @userscript-x/core

# pnpm
pnpm add @userscript-x/core

# bun
bun add @userscript-x/core
```

## Usage

### DOM Helpers

#### waitFor

Wait for an element to appear in the DOM:

```typescript
import { waitFor } from '@userscript-x/core';

// Wait for an element
const button = await waitFor<HTMLButtonElement>('.submit-button');
button.click();

// With options
const element = await waitFor('.dynamic-content', {
  timeout: 5000,        // Wait up to 5 seconds
  parent: document.body // Search within specific parent
});
```

#### onElement

Execute a callback when elements matching a selector appear:

```typescript
import { onElement } from '@userscript-x/core';

// Watch for new elements
const stop = onElement<HTMLDivElement>('.post', (element) => {
  console.log('New post:', element);
  element.style.border = '2px solid red';
});

// Stop observing later
stop();
```

#### onDOMLoaded

Execute code when DOM is ready:

```typescript
import { onDOMLoaded } from '@userscript-x/core';

onDOMLoaded(() => {
  console.log('DOM is ready!');
  // Your initialization code here
});
```

### Storage

Type-safe wrapper around GM storage APIs:

```typescript
import { storage } from '@userscript-x/core';

// Store values
await storage.set('count', 42);
await storage.set('user', { name: 'John', age: 30 });

// Retrieve values with type safety
const count = await storage.get<number>('count', 0);
const user = await storage.get<User>('user');

// Delete values
await storage.delete('count');

// List all keys
const keys = await storage.listKeys();
```

### GM API Wrappers

#### fetch

Make cross-origin HTTP requests with a fetch-like API:

```typescript
import { fetch } from '@userscript-x/core';

interface ApiResponse {
  data: string;
}

const response = await fetch<ApiResponse>('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
  timeout: 5000,
  responseType: 'json'
});

console.log(response.data);
console.log(response.status);
console.log(response.headers);
```

#### addStyle

Inject CSS styles into the page:

```typescript
import { addStyle } from '@userscript-x/core';

addStyle(`
  .custom-class {
    color: red;
    font-weight: bold;
  }
`);
```

#### openInTab

Open URLs in new tabs:

```typescript
import { openInTab } from '@userscript-x/core';

// Open in foreground
openInTab('https://example.com');

// Open in background
openInTab('https://example.com', true);
```

#### setClipboard

Copy text to clipboard:

```typescript
import { setClipboard } from '@userscript-x/core';

await setClipboard('Hello, world!');
```

#### notification

Show desktop notifications:

```typescript
import { notification } from '@userscript-x/core';

notification('Task completed!', 'Success', {
  image: 'https://example.com/icon.png',
  onclick: () => console.log('Notification clicked')
});
```

## Complete Example

```typescript
import {
  onDOMLoaded,
  waitFor,
  onElement,
  storage,
  addStyle
} from '@userscript-x/core';

onDOMLoaded(async () => {
  // Add custom styles
  addStyle(`
    .highlight {
      background-color: yellow;
    }
  `);

  // Wait for main content
  const main = await waitFor('.main-content');
  console.log('Main content loaded:', main);

  // Track view count
  const views = await storage.get<number>('views', 0);
  await storage.set('views', views + 1);

  // Watch for new items
  onElement('.item', (item) => {
    item.classList.add('highlight');
  });
});
```

## TypeScript Support

All utilities include full TypeScript definitions. Import types as needed:

```typescript
import type {
  WaitForOptions,
  OnElementOptions,
  FetchOptions,
  FetchResponse
} from '@userscript-x/core';
```

## License

MIT
