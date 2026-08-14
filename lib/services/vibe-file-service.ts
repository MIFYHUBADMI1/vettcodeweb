/**
 * VettCode Vibe File Service
 * Manages project files (storage, versioning, validation)
 */

import {
  VibeProjectFileModel,
  CreateVibeProjectFileInput,
  UpdateVibeProjectFileInput,
  VibeProjectFile,
  FileTreeNode,
} from '../models/VibeProjectFile';

export interface CreateFileRequest {
  projectId: string;
  userId: string;
  path: string;
  content: string;
  editedBy: 'user' | 'ai';
}

export interface UpdateFileRequest {
  projectId: string;
  userId: string;
  path: string;
  content: string;
  editedBy: 'user' | 'ai';
}

/**
 * Create a new file
 */
export async function createFile(request: CreateFileRequest): Promise<VibeProjectFile> {
  // Validate path
  const pathValidation = VibeProjectFileModel.validatePath(request.path);
  if (!pathValidation.valid) {
    throw new Error(pathValidation.error);
  }
  
  // Detect language
  const language = VibeProjectFileModel.detectLanguage(request.path);
  
  const input: CreateVibeProjectFileInput = {
    projectId: request.projectId,
    userId: request.userId,
    path: request.path,
    content: request.content,
    language,
    editedBy: request.editedBy,
  };
  
  return VibeProjectFileModel.create(input);
}

/**
 * Get file by path
 */
export async function getFile(
  projectId: string,
  userId: string,
  path: string
): Promise<VibeProjectFile | null> {
  return VibeProjectFileModel.getByPath(projectId, userId, path);
}

/**
 * Get all files for a project
 */
export async function getProjectFiles(
  projectId: string,
  userId: string
): Promise<VibeProjectFile[]> {
  return VibeProjectFileModel.getProjectFiles(projectId, userId);
}

/**
 * Get file tree structure
 */
export async function getFileTree(
  projectId: string,
  userId: string
): Promise<FileTreeNode> {
  return VibeProjectFileModel.getFileTree(projectId, userId);
}

/**
 * Update file content
 */
export async function updateFile(request: UpdateFileRequest): Promise<VibeProjectFile> {
  // Check if file exists
  const existing = await VibeProjectFileModel.getByPath(
    request.projectId,
    request.userId,
    request.path
  );
  
  if (!existing) {
    throw new Error(`File not found: ${request.path}`);
  }
  
  // TODO: Store previous version in ImageKit if needed
  // For now, just increment version
  
  const updates: UpdateVibeProjectFileInput = {
    content: request.content,
    editedBy: request.editedBy,
  };
  
  const updated = await VibeProjectFileModel.update(
    request.projectId,
    request.userId,
    request.path,
    updates
  );
  
  if (!updated) {
    throw new Error('Failed to update file');
  }
  
  return updated;
}

/**
 * Delete file
 */
export async function deleteFile(
  projectId: string,
  userId: string,
  path: string
): Promise<boolean> {
  return VibeProjectFileModel.delete(projectId, userId, path);
}

/**
 * Create multiple files at once (for initial project generation)
 */
export async function createMultipleFiles(
  projectId: string,
  userId: string,
  files: Array<{ path: string; content: string }>,
  editedBy: 'user' | 'ai' = 'ai'
): Promise<VibeProjectFile[]> {
  const created: VibeProjectFile[] = [];
  const errors: Array<{ path: string; error: string }> = [];
  
  for (const file of files) {
    try {
      const createdFile = await createFile({
        projectId,
        userId,
        path: file.path,
        content: file.content,
        editedBy,
      });
      created.push(createdFile);
    } catch (error) {
      errors.push({
        path: file.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  if (errors.length > 0) {
    console.error('Some files failed to create:', errors);
    // Continue anyway, return what we could create
  }
  
  return created;
}

/**
 * Get file statistics
 */
export async function getFileStats(
  projectId: string,
  userId: string
): Promise<{
  totalFiles: number;
  totalSize: number;
  byLanguage: Record<string, number>;
}> {
  const files = await VibeProjectFileModel.getProjectFiles(projectId, userId);
  
  const stats = {
    totalFiles: files.length,
    totalSize: 0,
    byLanguage: {} as Record<string, number>,
  };
  
  files.forEach(file => {
    stats.totalSize += file.size;
    stats.byLanguage[file.language] = (stats.byLanguage[file.language] || 0) + 1;
  });
  
  return stats;
}

/**
 * Search files by content
 */
export async function searchFiles(
  projectId: string,
  userId: string,
  query: string
): Promise<Array<{ file: VibeProjectFile; matches: number }>> {
  const files = await VibeProjectFileModel.getProjectFiles(projectId, userId);
  const results: Array<{ file: VibeProjectFile; matches: number }> = [];
  
  const searchTerm = query.toLowerCase();
  
  files.forEach(file => {
    const content = file.content.toLowerCase();
    const matches = (content.match(new RegExp(searchTerm, 'g')) || []).length;
    
    if (matches > 0) {
      results.push({ file, matches });
    }
  });
  
  // Sort by relevance (most matches first)
  results.sort((a, b) => b.matches - a.matches);
  
  return results;
}

/**
 * Validate file content
 */
export function validateFileContent(content: string, language: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for common security issues
  if (language === 'javascript' || language === 'typescript') {
    // Check for eval
    if (content.includes('eval(')) {
      errors.push('Use of eval() is dangerous and not allowed');
    }
    
    // Check for inline event handlers
    if (content.match(/on[A-Z][a-z]+\s*=\s*["']/)) {
      warnings.push('Inline event handlers detected - consider using addEventListener');
    }
  }
  
  // Check for hardcoded secrets (basic check)
  const secretPatterns = [
    /api[_-]?key\s*=\s*["'][^"']+["']/i,
    /password\s*=\s*["'][^"']+["']/i,
    /secret\s*=\s*["'][^"']+["']/i,
    /token\s*=\s*["'][^"']+["']/i,
  ];
  
  secretPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      warnings.push('Possible hardcoded credential detected - use environment variables');
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate initial project structure
 */
export async function generateInitialStructure(
  projectId: string,
  userId: string,
  type: string,
  framework?: string
): Promise<VibeProjectFile[]> {
  let files: Array<{ path: string; content: string }> = [];
  
  // Generate based on project type
  if (type === 'web' && framework === 'react') {
    files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'vettcode-project',
          version: '0.1.0',
          private: true,
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
          },
        }, null, 2),
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to VettCode</h1>
        <p>Start building your app!</p>
      </header>
    </div>
  );
}

export default App;
`,
      },
      {
        path: 'src/App.css',
        content: `.App {
  text-align: center;
}

.App-header {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}
`,
      },
      {
        path: 'src/index.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: 'src/index.css',
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`,
      },
      {
        path: 'public/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="VettCode Project" />
    <title>VettCode App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`,
      },
      {
        path: 'README.md',
        content: `# VettCode Project

Created with VettCode Vibe Coder

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production

## Learn More

Visit [VettCode](https://vettcode.dev) for more information.
`,
      },
    ];
  } else {
    // Basic structure for other types
    files = [
      {
        path: 'README.md',
        content: `# Project

Created with VettCode Vibe Coder
`,
      },
    ];
  }
  
  return createMultipleFiles(projectId, userId, files, 'ai');
}
