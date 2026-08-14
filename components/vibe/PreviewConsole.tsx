/**
 * Preview Console Component
 * Display console output from preview
 */

'use client';

import { AlertCircle, Info, AlertTriangle, X, Trash2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

interface PreviewConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  onClose: () => void;
}

const messageIcons = {
  log: Info,
  warn: AlertTriangle,
  error: AlertCircle,
};

const messageColors = {
  log: 'text-gray-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
};

export default function PreviewConsole({ messages, onClear, onClose }: PreviewConsoleProps) {
  const handleCopy = () => {
    const text = messages
      .map(m => `[${m.type.toUpperCase()}] ${m.message}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    toast.success('Console output copied');
  };

  return (
    <div className="h-64 bg-gray-950 border-t border-gray-800 flex flex-col">
      {/* Header */}
      <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-300">Console</h3>
          {messages.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
              {messages.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={messages.length === 0}
            className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent rounded transition-colors"
            title="Copy output"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={messages.length === 0}
            className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded transition-colors"
            title="Close console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Console output will appear here</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const Icon = messageIcons[msg.type];
          const color = messageColors[msg.type];
          const time = msg.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={index}
              className="flex items-start gap-2 p-2 hover:bg-gray-900 rounded"
            >
              <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium ${color}`}>
                    {msg.type.toUpperCase()}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {time}
                  </span>
                </div>
                <pre className="text-gray-300 whitespace-pre-wrap break-words">
                  {msg.message}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
