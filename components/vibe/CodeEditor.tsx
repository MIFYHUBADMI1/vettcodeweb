/**
 * Code Editor Component
 * Monaco Editor integration for file editing
 */

'use client';

import { useState, useEffect } from 'react';
import { useVibeProjectFiles, useUpdateFile } from '@/lib/hooks/useVibeProjects';
import { Loader2, Save, FileCode } from 'lucide-react';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor (only on client side)
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  ),
});

interface CodeEditorProps {
  projectId: string;
  selectedFile: string | null;
}

export default function CodeEditor({ projectId, selectedFile }: CodeEditorProps) {
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: filesData } = useVibeProjectFiles(projectId);
  const updateFile = useUpdateFile(projectId);

  const files = filesData?.files || [];
  const currentFile = files.find((f) => f.path === selectedFile);

  // Load file content when selection changes
  useEffect(() => {
    if (currentFile) {
      setEditorContent(currentFile.content);
      setHasUnsavedChanges(false);
    } else {
      setEditorContent('');
      setHasUnsavedChanges(false);
    }
  }, [currentFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      setHasUnsavedChanges(value !== currentFile?.content);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !currentFile || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      await updateFile.mutateAsync({
        path: selectedFile,
        content: editorContent,
      });
      setHasUnsavedChanges(false);
      toast.success('File saved');
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, editorContent, selectedFile]);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="text-center">
          <FileCode className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No File Selected</h3>
          <p className="text-sm text-gray-600">
            Select a file from the explorer or ask AI to create files
          </p>
        </div>
      </div>
    );
  }

  if (!currentFile) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* File Header */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">{selectedFile}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-400">• Unsaved</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguageFromPath(selectedFile)}
          value={editorContent}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{getLanguageFromPath(selectedFile)}</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{editorContent.split('\n').length} lines</span>
          <span>•</span>
          <span>{editorContent.length} chars</span>
        </div>
      </div>
    </div>
  );
}

function getLanguageFromPath(path: string): string {
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
