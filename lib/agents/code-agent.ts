/**
 * Code Agent
 * Generates actual code files based on architecture and design
 */

import { BaseAgent } from './base-agent';
import { BuildContext, AgentOutput, ValidationResult, FileOutput } from './types';
import { AgentType } from '../models/BuildTask';
import { createMultipleFiles } from '../services/vibe-file-service';

export interface CodeGenerationTask {
  type: 'component' | 'page' | 'utility' | 'config' | 'style';
  target: string;
  dependencies?: string[];
}

export interface CodeOutput {
  files: Array<{
    path: string;
    content: string;
    language: string;
    size: number;
  }>;
  documentation: string;
  nextSuggestions?: string[];
}

export class CodeAgent extends BaseAgent {
  readonly type: AgentType = 'code';
  readonly name = 'Code Agent';
  readonly description = 'Generates code files based on architecture and design';

  async execute(context: BuildContext): Promise<AgentOutput> {
    const validation = this.validateInput(context);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join(', ')}`);
    }

    // Generate files for the project
    const filesGenerated: FileOutput[] = [];
    
    // 1. Generate package.json
    const packageJson = await this.generatePackageJson(context);
    filesGenerated.push(packageJson);
    
    // 2. Generate main App component
    const appComponent = await this.generateAppComponent(context);
    filesGenerated.push(appComponent);
    
    // 3. Generate index files
    const indexFiles = await this.generateIndexFiles(context);
    filesGenerated.push(...indexFiles);
    
    // 4. Generate CSS/styling
    const styleFiles = await this.generateStyleFiles(context);
    filesGenerated.push(...styleFiles);
    
    // 5. Generate additional components based on plan
    const components = await this.generateComponents(context);
    filesGenerated.push(...components);

    // Save all files to database
    await this.saveFiles(context, filesGenerated);

    // Calculate total size
    const totalSize = filesGenerated.reduce((sum, f) => sum + f.content.length, 0);

    return {
      success: true,
      data: {
        files: filesGenerated.map(f => ({
          path: f.path,
          content: f.content,
          language: this.detectLanguage(f.path),
          size: f.content.length,
        })),
        documentation: `Generated ${filesGenerated.length} files (${Math.round(totalSize / 1024)}KB total)`,
      },
      filesGenerated,
      aiUsage: {
        provider: 'internal',
        model: 'template-based',
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      },
    };
  }

  validateInput(context: BuildContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    if (!context.plan) errors.push('Project plan is required');
    if (!context.architecture) errors.push('Architecture is required');
    if (!context.uiDesign) errors.push('UI design is required');

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Generate package.json
   */
  private async generatePackageJson(context: BuildContext): Promise<FileOutput> {
    const framework = context.project.framework || 'react';
    
    const packageJson = {
      name: context.project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...(framework === 'react-ts' ? { typescript: '^5.0.0' } : {}),
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
      },
    };

    return {
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
      reason: 'Project configuration and dependencies',
      requiresApproval: false,
    };
  }

  /**
   * Generate main App component
   */
  private async generateAppComponent(context: BuildContext): Promise<FileOutput> {
    const framework = context.project.framework || 'react';
    const isTypeScript = framework.includes('ts');
    const ext = isTypeScript ? 'tsx' : 'jsx';
    
    const theme = context.uiDesign?.theme;
    const primaryColor = theme?.colors?.primary || '#3B82F6';

    const content = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${context.project.name}</h1>
        <p>${context.project.description}</p>
        <div className="features">
          ${context.plan?.features?.slice(0, 3).map((f: any) => 
            `<div className="feature-card">
              <h3>${f.name}</h3>
              <p>${f.description}</p>
            </div>`
          ).join('\n          ')}
        </div>
      </header>
    </div>
  );
}

export default App;
`;

    return {
      path: `src/App.${ext}`,
      content,
      reason: 'Main application component',
      requiresApproval: false,
    };
  }

  /**
   * Generate index files
   */
  private async generateIndexFiles(context: BuildContext): Promise<FileOutput[]> {
    const framework = context.project.framework || 'react';
    const isTypeScript = framework.includes('ts');
    const ext = isTypeScript ? 'tsx' : 'jsx';
    
    const indexTsx = `import React from 'react';
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
`;

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${context.project.description}" />
    <title>${context.project.name}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;

    return [
      {
        path: `src/index.${ext}`,
        content: indexTsx,
        reason: 'Application entry point',
        requiresApproval: false,
      },
      {
        path: 'public/index.html',
        content: indexHtml,
        reason: 'HTML template',
        requiresApproval: false,
      },
    ];
  }

  /**
   * Generate style files
   */
  private async generateStyleFiles(context: BuildContext): Promise<FileOutput[]> {
    const theme = context.uiDesign?.theme;
    const colors = theme?.colors || {
      primary: '#3B82F6',
      secondary: '#10B981',
      background: '#FFFFFF',
      text: '#1F2937',
    };

    const appCss = `.App {
  text-align: center;
  min-height: 100vh;
  background-color: ${colors.background};
  color: ${colors.text};
}

.App-header {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.App-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${colors.primary};
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  max-width: 1200px;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  color: ${colors.primary};
  margin-bottom: 0.5rem;
}
`;

    const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`;

    return [
      {
        path: 'src/App.css',
        content: appCss,
        reason: 'App component styles',
        requiresApproval: false,
      },
      {
        path: 'src/index.css',
        content: indexCss,
        reason: 'Global styles',
        requiresApproval: false,
      },
    ];
  }

  /**
   * Generate additional components
   */
  private async generateComponents(context: BuildContext): Promise<FileOutput[]> {
    // For now, just generate a README
    const readme = `# ${context.project.name}

${context.project.description}

## Features

${context.plan?.features?.map((f: any) => `- **${f.name}**: ${f.description}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Tech Stack

${context.plan?.techStack?.frontend?.join(', ')}

---

Built with VettCode Vibe AI Build Team
`;

    return [
      {
        path: 'README.md',
        content: readme,
        reason: 'Project documentation',
        requiresApproval: false,
      },
    ];
  }

  /**
   * Save files to database
   */
  private async saveFiles(context: BuildContext, files: FileOutput[]): Promise<void> {
    const filesToCreate = files.map(f => ({
      path: f.path,
      content: f.content,
    }));

    await createMultipleFiles(
      context.project._id.toString(),
      context.user.email,
      filesToCreate,
      'ai'
    );
  }

  /**
   * Detect file language
   */
  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      tsx: 'typescript',
      ts: 'typescript',
      jsx: 'javascript',
      js: 'javascript',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  async estimateCost(context: BuildContext): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    // Code generation uses templates, very cheap
    return {
      estimatedTokens: 500,
      estimatedCost: 0.0005,
      estimatedDuration: 5,
    };
  }
}
