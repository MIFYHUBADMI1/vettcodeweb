/**
 * File Explorer Component
 * Tree view of project files
 */

'use client';

import { useState } from 'react';
import { FileTreeNode } from '@/lib/models/VibeProjectFile';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus } from 'lucide-react';

interface FileExplorerProps {
  projectId: string;
  tree?: FileTreeNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

export default function FileExplorer({ projectId, tree, selectedFile, onSelectFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    if (node.name === 'root') {
      // Render root's children directly
      return node.children?.map((child) => renderNode(child, depth));
    }

    const isExpanded = expandedFolders.has(node.path || '');
    const isSelected = node.type === 'file' && selectedFile === node.path;

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path!)}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-800 transition-colors text-left group"
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-purple-400" />
            ) : (
              <Folder className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-sm text-gray-300 group-hover:text-white">{node.name}</span>
          </button>

          {isExpanded && node.children && (
            <div>
              {node.children
                .sort((a, b) => {
                  // Folders first, then files
                  if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                  }
                  return a.name.localeCompare(b.name);
                })
                .map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File
    return (
      <button
        key={node.path}
        onClick={() => onSelectFile(node.path!)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left group ${
          isSelected
            ? 'bg-purple-600/20 text-purple-300'
            : 'hover:bg-gray-800 text-gray-400'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12 + 20}px` }}
      >
        <File className="w-4 h-4" />
        <span className="text-sm flex-1 truncate">{node.name}</span>
        {node.size && (
          <span className="text-xs text-gray-600">
            {formatFileSize(node.size)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Files</h3>
        <button
          className="w-6 h-6 rounded hover:bg-gray-800 flex items-center justify-center transition-colors"
          title="New file (coming soon)"
          disabled
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {!tree && (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            No files yet
          </div>
        )}
        
        {tree && tree.children && tree.children.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            <p className="mb-2">No files yet</p>
            <p className="text-xs">Chat with AI to generate files</p>
          </div>
        )}

        {tree && renderNode(tree)}
      </div>

      {/* Footer Stats */}
      {tree && tree.children && tree.children.length > 0 && (
        <div className="p-3 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            {countFiles(tree)} {countFiles(tree) === 1 ? 'file' : 'files'}
          </p>
        </div>
      )}
    </div>
  );
}

function countFiles(node: FileTreeNode): number {
  if (node.type === 'file') return 1;
  if (!node.children) return 0;
  return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
