/**
 * VettCode Vibe Security Service
 * Integrates CLI security scanning into Vibe Coder
 * Runs scans programmatically using CLI Orchestrator
 */

import { AIRouter } from '../ai-router';
import { VibeProjectFileModel } from '../models/VibeProjectFile';
import { ScanModel } from '../models/Scan';
import type { NormalizedFinding, ScanResult as CLIScanResult } from '../types';
// @ts-ignore - CLI types not exported properly
import { Orchestrator } from '../../../../CLI/dist/orchestrator/orchestrator';
import { getUserPlan } from '../subscription';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const aiRouter = new AIRouter();

export interface SecurityFix {
  explanation: string;
  fixedCode: string;
  whySecure: string;
}

export interface ScanResultSummary {
  scanId: string;
  findings: NormalizedFinding[];
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
}

/**
 * Run security scan on Vibe project
 * Exports files to temp directory, runs CLI orchestrator, saves results
 */
export async function runSecurityScan(
  projectId: string,
  userId: string
): Promise<ScanResultSummary> {
  // Get project files from database
  const files = await VibeProjectFileModel.getProjectFiles(projectId, userId);
  
  if (files.length === 0) {
    throw new Error('No files to scan. Create some files first.');
  }
  
  // Create temp directory for scan
  const tempDir = path.join(os.tmpdir(), `vibe-scan-${projectId}-${uuidv4()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    // Write files to temp directory
    for (const file of files) {
      const filePath = path.join(tempDir, file.path.replace(/^\//, ''));
      const fileDir = path.dirname(filePath);
      
      // Create parent directories
      fs.mkdirSync(fileDir, { recursive: true });
      
      // Write file content
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
    
    // Run CLI Orchestrator
    const orchestrator = new Orchestrator();
    const scanResult = await orchestrator.scan(tempDir);
    
    // Convert to format expected by ScanModel
    const scanData: CLIScanResult = {
      scan: {
        path: `vibe-project:${projectId}`,
        timestamp: new Date().toISOString(),
        sensorsUsed: scanResult.sensorsUsed,
        sensorsSkipped: scanResult.sensorsSkipped,
      },
      summary: {
        total: scanResult.totalFindings,
        critical: scanResult.criticalCount,
        high: scanResult.highCount,
        medium: scanResult.mediumCount,
        low: scanResult.lowCount,
        info: scanResult.infoCount,
      },
      findings: scanResult.findings,
    };
    
    // Save scan to database using existing scan system
    const scan = await ScanModel.create(userId, scanData);
    
    return {
      scanId: scan._id!.toString(),
      findings: scanResult.findings,
      totalFindings: scanResult.totalFindings,
      criticalCount: scanResult.criticalCount,
      highCount: scanResult.highCount,
      mediumCount: scanResult.mediumCount,
      lowCount: scanResult.lowCount,
      infoCount: scanResult.infoCount,
    };
  } finally {
    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }
}

/**
 * Generate AI-powered security fix for a finding
 */
export async function generateSecurityFix(
  userId: string,
  finding: NormalizedFinding,
  fileContent: string
): Promise<SecurityFix> {
  // Build comprehensive prompt
  const prompt = buildSecurityFixPrompt(finding, fileContent);
  
  // Get user plan
  const plan = await getUserPlan(userId);
  
  // Use AI router
  const response = await aiRouter.generateChat(
    [{ role: 'user', content: prompt }],
    {
      userId,
      plan,
      feature: 'vibe_security_fix',
      requestId: `security-fix-${finding.id}`,
    }
  );
  
  // Parse structured fix from response
  const fix = parseFixResponse(response.message, finding, fileContent);
  
  return fix;
}

/**
 * Build prompt for security fix generation
 */
function buildSecurityFixPrompt(
  finding: NormalizedFinding,
  fileContent: string
): string {
  let prompt = `You are a security expert helping fix a vulnerability.

**Vulnerability Details**:
- Title: ${finding.title}
- Severity: ${finding.severity}
- Message: ${finding.message}
- Category: ${finding.category || 'Unknown'}
`;

  if (finding.cwe && finding.cwe.length > 0) {
    prompt += `- CWE: ${finding.cwe.join(', ')}\n`;
  }
  
  if (finding.references && finding.references.length > 0) {
    prompt += `- References:\n${finding.references.map(r => `  - ${r}`).join('\n')}\n`;
  }

  prompt += `\n**File**: ${finding.filePath || 'Unknown'}`;
  
  if (finding.lineNumber) {
    prompt += `\n**Line**: ${finding.lineNumber}`;
  }
  
  if (finding.codeSnippet) {
    prompt += `\n\n**Vulnerable Code**:\n\`\`\`\n${finding.codeSnippet}\n\`\`\``;
  }

  prompt += `\n\n**Full File Content**:\n\`\`\`\n${fileContent}\n\`\`\`

Your task:
1. Explain what makes this code vulnerable
2. Provide the COMPLETE fixed version of the file
3. Explain why the fix is secure

Respond in EXACTLY this format:

EXPLANATION:
[Clear explanation of the vulnerability - what's wrong and why it's dangerous]

FIXED_CODE:
\`\`\`
[Complete fixed file content here - include ALL code from the file, not just the changed part]
\`\`\`

WHY_SECURE:
[Explanation of why your fix is secure and what security principles it follows]

IMPORTANT:
- Provide the COMPLETE file content in FIXED_CODE (not just the changed lines)
- Keep all existing functionality intact
- Follow best security practices
- Use secure patterns specific to the language/framework
- Add comments explaining the security fix
`;

  return prompt;
}

/**
 * Parse security fix from AI response
 */
function parseFixResponse(
  content: string,
  finding: NormalizedFinding,
  originalContent: string
): SecurityFix {
  try {
    // Extract sections using regex
    const explanationMatch = content.match(/EXPLANATION:\s*([\s\S]*?)(?=FIXED_CODE:|$)/i);
    const fixedCodeMatch = content.match(/FIXED_CODE:\s*```[^\n]*\n([\s\S]*?)```/i);
    const whySecureMatch = content.match(/WHY_SECURE:\s*([\s\S]*?)$/i);
    
    const explanation = explanationMatch?.[1]?.trim() || 'Security vulnerability detected.';
    const fixedCode = fixedCodeMatch?.[1]?.trim() || originalContent;
    const whySecure = whySecureMatch?.[1]?.trim() || 'Fix applied using security best practices.';
    
    return {
      explanation,
      fixedCode,
      whySecure,
    };
  } catch (error) {
    console.error('Failed to parse fix response:', error);
    
    // Fallback - return safe defaults
    return {
      explanation: `This code has a ${finding.severity} severity ${finding.category} vulnerability: ${finding.message}`,
      fixedCode: originalContent,
      whySecure: 'Please review the code manually and apply security best practices.',
    };
  }
}

/**
 * Link scan to Vibe project
 */
export async function linkScanToProject(
  projectId: string,
  userId: string,
  scanId: string
): Promise<void> {
  // Import model dynamically to avoid circular dependencies
  const { VibeProjectModel } = await import('../models/VibeProject');
  await VibeProjectModel.linkScan(projectId, userId, scanId);
}
