/**
 * Install VettCode CLI in serverless environment
 * This runs once per cold start
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

let cliInstalled = false;
let cliPath: string | null = null;

/**
 * Ensure VettCode CLI is available in serverless function
 */
export async function ensureCLI(): Promise<string> {
  // Check if already installed in this instance
  if (cliInstalled && cliPath) {
    return cliPath;
  }

  // Check if CLI is globally available
  try {
    execSync('vettcode --version', { stdio: 'ignore' });
    cliPath = 'vettcode';
    cliInstalled = true;
    console.log('[Scan] Using globally installed VettCode CLI');
    return cliPath;
  } catch (error) {
    // CLI not available globally
  }

  // Install CLI in /tmp directory (writable in serverless)
  const tmpDir = '/tmp/vettcode-cli';
  const cliExecutable = path.join(tmpDir, 'node_modules', '.bin', 'vettcode');

  if (existsSync(cliExecutable)) {
    cliPath = cliExecutable;
    cliInstalled = true;
    console.log('[Scan] Using cached VettCode CLI from /tmp');
    return cliPath;
  }

  try {
    console.log('[Scan] Installing VettCode CLI to /tmp...');
    
    // Create temp directory
    execSync(`mkdir -p ${tmpDir}`, { stdio: 'ignore' });
    
    // Install CLI
    execSync('npm init -y', { cwd: tmpDir, stdio: 'ignore' });
    execSync('npm install @vettcode/cli --no-save --production', {
      cwd: tmpDir,
      stdio: 'pipe',
      timeout: 120000, // 2 minute timeout
    });

    if (!existsSync(cliExecutable)) {
      throw new Error('CLI installation failed - executable not found');
    }

    cliPath = cliExecutable;
    cliInstalled = true;
    console.log('[Scan] VettCode CLI installed successfully');
    return cliPath;
  } catch (error) {
    console.error('[Scan] Failed to install CLI:', error);
    throw new Error(
      'Failed to initialize security scanning. Please try again or contact support.'
    );
  }
}

/**
 * Get CLI path (must call ensureCLI first)
 */
export function getCLIPath(): string {
  if (!cliPath) {
    throw new Error('CLI not initialized. Call ensureCLI() first.');
  }
  return cliPath;
}

/**
 * Check if CLI is ready
 */
export function isCLIReady(): boolean {
  return cliInstalled && cliPath !== null;
}
