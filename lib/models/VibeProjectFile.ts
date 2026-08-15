/**
 * VettCode Vibe Project File Model
 * Represents files within a Vibe project
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export interface VibeProjectFile {
  _id: ObjectId;
  projectId: string;
  userId: string;
  
  // File path (relative to project root)
  path: string;
  
  // File content
  content: string;
  
  // Language/type
  language: string;
  
  // Versioning
  version: number;
  previousVersionUrl?: string; // ImageKit URL to previous version
  
  // Metadata
  size: number; // bytes
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy: 'user' | 'ai';
}

export interface CreateVibeProjectFileInput {
  projectId: string;
  userId: string;
  path: string;
  content: string;
  language: string;
  editedBy: 'user' | 'ai';
}

export interface UpdateVibeProjectFileInput {
  content: string;
  editedBy: 'user' | 'ai';
  previousVersionUrl?: string;
}

/**
 * VibeProjectFile database operations
 */
export class VibeProjectFileModel {
  private static COLLECTION = 'vibe_project_files';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  /**
   * Create a new file
   */
  static async create(input: CreateVibeProjectFileInput): Promise<VibeProjectFile> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    // Validate file size
    const size = Buffer.byteLength(input.content, 'utf8');
    if (size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    // Check if file already exists
    const existing = await collection.findOne({
      projectId: input.projectId,
      userId: input.userId,
      path: input.path,
    });
    
    if (existing) {
      throw new Error(`File already exists at path: ${input.path}`);
    }
    
    const file: Omit<VibeProjectFile, '_id'> = {
      projectId: input.projectId,
      userId: input.userId,
      path: input.path,
      content: input.content,
      language: input.language,
      version: 1,
      size,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: input.editedBy,
    };
    
    const result = await collection.insertOne(file as VibeProjectFile);
    
    return {
      ...file,
      _id: result.insertedId,
    } as VibeProjectFile;
  }
  
  /**
   * Get file by path
   */
  static async getByPath(
    projectId: string,
    userId: string,
    path: string
  ): Promise<VibeProjectFile | null> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    return collection.findOne({
      projectId,
      userId,
      path,
    });
  }
  
  /**
   * Get all files for a project
   */
  static async getProjectFiles(
    projectId: string,
    userId: string
  ): Promise<VibeProjectFile[]> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    return collection
      .find({ projectId, userId })
      .sort({ path: 1 })
      .toArray();
  }
  
  /**
   * Update file content
   */
  static async update(
    projectId: string,
    userId: string,
    path: string,
    updates: UpdateVibeProjectFileInput
  ): Promise<VibeProjectFile | null> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    // Validate file size
    const size = Buffer.byteLength(updates.content, 'utf8');
    if (size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    const result = await collection.findOneAndUpdate(
      { projectId, userId, path },
      {
        $set: {
          content: updates.content,
          size,
          updatedAt: new Date(),
          lastEditedBy: updates.editedBy,
          ...(updates.previousVersionUrl && { previousVersionUrl: updates.previousVersionUrl }),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );
    
    return result;
  }
  
  /**
   * Delete file
   */
  static async delete(
    projectId: string,
    userId: string,
    path: string
  ): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    const result = await collection.deleteOne({
      projectId,
      userId,
      path,
    });
    
    return result.deletedCount > 0;
  }
  
  /**
   * Delete all files for a project
   */
  static async deleteProjectFiles(
    projectId: string,
    userId: string
  ): Promise<number> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    const result = await collection.deleteMany({
      projectId,
      userId,
    });
    
    return result.deletedCount;
  }
  
  /**
   * Get file tree structure
   */
  static async getFileTree(
    projectId: string,
    userId: string
  ): Promise<FileTreeNode> {
    const files = await this.getProjectFiles(projectId, userId);
    
    const root: FileTreeNode = {
      name: 'root',
      type: 'directory',
      children: [],
    };
    
    files.forEach(file => {
      const parts = file.path.split('/').filter(Boolean);
      let current = root;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        let child = current.children?.find(c => c.name === part);
        
        if (!child) {
          child = {
            name: part,
            type: isFile ? 'file' : 'directory',
            path: parts.slice(0, index + 1).join('/'),
            ...(isFile && {
              language: file.language,
              size: file.size,
            }),
            ...(!isFile && { children: [] }),
          };
          current.children!.push(child);
        }
        
        if (!isFile) {
          current = child;
        }
      });
    });
    
    return root;
  }
  
  /**
   * Validate file path
   */
  static validatePath(path: string): { valid: boolean; error?: string } {
    // Must not be empty
    if (!path || path.trim() === '') {
      return { valid: false, error: 'Path cannot be empty' };
    }
    
    // Must not start with /
    if (path.startsWith('/')) {
      return { valid: false, error: 'Path must be relative (no leading /)' };
    }
    
    // Must not contain ..
    if (path.includes('..')) {
      return { valid: false, error: 'Path cannot contain ..' };
    }
    
    // Must not contain dangerous patterns
    const dangerous = ['~/', '$', '\\', '<', '>', '|', '*', '?'];
    for (const pattern of dangerous) {
      if (path.includes(pattern)) {
        return { valid: false, error: `Path cannot contain: ${pattern}` };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Detect language from file path
   */
  static detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      sh: 'shell',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
    };
    
    return languageMap[ext || ''] || 'plaintext';
  }
  
  /**
   * Create indexes
   */
  static async createIndexes(): Promise<void> {
    const db = await getDb();
    const collection = db.collection<VibeProjectFile>(this.COLLECTION);
    
    await collection.createIndex({ projectId: 1, userId: 1 });
    await collection.createIndex({ projectId: 1, userId: 1, path: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
  }
}

// File tree types
export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path?: string;
  language?: string;
  size?: number;
  children?: FileTreeNode[];
}

