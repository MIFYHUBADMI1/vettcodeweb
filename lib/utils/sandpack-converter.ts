/**
 * Sandpack Converter Utilities
 * Convert VettCode project files to Sandpack format
 */

import { VibeProjectFile } from '@/lib/models/VibeProjectFile';

export type SandpackTemplate = 
  | 'react' 
  | 'react-ts' 
  | 'vanilla' 
  | 'vanilla-ts' 
  | 'vue' 
  | 'vue-ts'
  | 'nextjs'
  | 'svelte';

export interface SandpackFiles {
  [key: string]: {
    code: string;
    hidden?: boolean;
    active?: boolean;
    readOnly?: boolean;
  };
}

/**
 * Convert VettCode files to Sandpack format
 */
export function convertFilesToSandpack(files: VibeProjectFile[]): SandpackFiles {
  const sandpackFiles: SandpackFiles = {};
  
  files.forEach(file => {
    // Ensure path starts with /
    const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
    
    sandpackFiles[path] = {
      code: file.content,
      hidden: false,
      readOnly: false,
    };
  });
  
  return sandpackFiles;
}

/**
 * Detect appropriate Sandpack template from files
 */
export function detectTemplate(files: VibeProjectFile[]): SandpackTemplate {
  const hasFile = (name: string) => 
    files.some(f => f.path.toLowerCase().includes(name.toLowerCase()));
  
  const getFile = (name: string) =>
    files.find(f => f.path.toLowerCase().includes(name.toLowerCase()));
  
  // Check package.json for dependencies
  if (hasFile('package.json')) {
    const pkgFile = getFile('package.json');
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        // Check for frameworks
        if (deps.next || deps['next']) return 'nextjs';
        if (deps.vue || deps['vue']) return 'vue-ts';
        if (deps.svelte || deps['svelte']) return 'svelte';
        if (deps.react || deps['react']) {
          // Check if TypeScript
          if (deps.typescript || hasFile('.tsx')) return 'react-ts';
          return 'react';
        }
      } catch (error) {
        console.error('Failed to parse package.json:', error);
      }
    }
  }
  
  // Check for TypeScript
  const hasTypeScript = files.some(f => 
    f.path.endsWith('.ts') || f.path.endsWith('.tsx')
  );
  
  // Check for React
  const hasReact = files.some(f => 
    f.content.includes('import React') || 
    f.content.includes('from "react"') ||
    f.content.includes("from 'react'")
  );
  
  // Check for Vue
  const hasVue = files.some(f => 
    f.path.endsWith('.vue') ||
    f.content.includes('import Vue') ||
    f.content.includes('from "vue"')
  );
  
  // Decision tree
  if (hasReact && hasTypeScript) return 'react-ts';
  if (hasReact) return 'react';
  if (hasVue && hasTypeScript) return 'vue-ts';
  if (hasVue) return 'vue';
  if (hasTypeScript) return 'vanilla-ts';
  if (hasFile('index.html')) return 'vanilla';
  
  // Default
  return 'react-ts';
}

/**
 * Find entry point file
 */
export function findEntryPoint(files: VibeProjectFile[]): string | null {
  const candidates = [
    'index.html',
    'public/index.html',
    'index.tsx',
    'index.jsx',
    'index.ts',
    'index.js',
    'src/index.tsx',
    'src/index.jsx',
    'src/index.ts',
    'src/index.js',
    'App.tsx',
    'App.jsx',
    'src/App.tsx',
    'src/App.jsx',
    'main.tsx',
    'main.ts',
    'main.js',
  ];
  
  for (const candidate of candidates) {
    const found = files.find(f => 
      f.path === candidate || 
      f.path === `/${candidate}` ||
      f.path.endsWith(`/${candidate}`)
    );
    if (found) {
      return found.path.startsWith('/') ? found.path : `/${found.path}`;
    }
  }
  
  return null;
}

/**
 * Check if project is previewable
 */
export function isPreviewable(files: VibeProjectFile[]): {
  canPreview: boolean;
  reason?: string;
} {
  if (files.length === 0) {
    return { canPreview: false, reason: 'No files in project' };
  }
  
  const template = detectTemplate(files);
  const entryPoint = findEntryPoint(files);
  
  if (!entryPoint) {
    return { 
      canPreview: false, 
      reason: 'No entry point found (index.html, index.tsx, etc.)' 
    };
  }
  
  // Check for backend-only projects
  const hasOnlyBackend = files.every(f => 
    f.path.includes('server') || 
    f.path.includes('api') ||
    f.path.endsWith('.py') ||
    f.path.endsWith('.go') ||
    f.path.endsWith('.java')
  );
  
  if (hasOnlyBackend) {
    return {
      canPreview: false,
      reason: 'Backend-only projects cannot be previewed in browser'
    };
  }
  
  return { canPreview: true };
}

/**
 * Generate default files for a template if missing
 */
export function getDefaultFiles(template: SandpackTemplate): SandpackFiles {
  const defaults: Record<SandpackTemplate, SandpackFiles> = {
    'react-ts': {
      '/App.tsx': {
        code: `export default function App() {
  return (
    <div className="App">
      <h1>Hello VettCode!</h1>
      <p>Start building your app.</p>
    </div>
  );
}`,
      },
      '/index.tsx': {
        code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      },
    },
    'react': {
      '/App.js': {
        code: `export default function App() {
  return (
    <div className="App">
      <h1>Hello VettCode!</h1>
      <p>Start building your app.</p>
    </div>
  );
}`,
      },
    },
    'vanilla': {
      '/index.html': {
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VettCode Project</title>
</head>
<body>
  <h1>Hello VettCode!</h1>
  <script src="./index.js"></script>
</body>
</html>`,
      },
      '/index.js': {
        code: `console.log('Hello from VettCode!');`,
      },
    },
    'vanilla-ts': {
      '/index.html': {
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VettCode Project</title>
</head>
<body>
  <h1>Hello VettCode!</h1>
  <script src="./index.ts"></script>
</body>
</html>`,
      },
      '/index.ts': {
        code: `console.log('Hello from VettCode!');`,
      },
    },
    'vue-ts': {},
    'vue': {},
    'nextjs': {},
    'svelte': {},
  };
  
  return defaults[template] || defaults['react-ts'];
}
