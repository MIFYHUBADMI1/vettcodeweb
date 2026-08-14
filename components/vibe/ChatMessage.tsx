/**
 * Chat Message Component
 * Display individual message in conversation
 */

'use client';

import { VibeMessage } from '@/lib/models/VibeConversation';
import AIActionCard from './AIActionCard';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: VibeMessage;
  projectId: string;
}

export default function ChatMessage({ message, projectId }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gray-700'
            : 'bg-gradient-to-br from-purple-600 to-green-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-gray-300" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-300">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-gray-600">{timestamp}</span>
          {message.model && (
            <span className="text-xs text-gray-600">• {message.model}</span>
          )}
        </div>

        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-gray-800 text-gray-200'
              : 'bg-gray-800/50 text-gray-100'
          }`}
        >
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code: ({ inline, children, ...props }: any) => {
                  if (inline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 bg-gray-900 rounded text-purple-400"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-900 rounded p-3 overflow-x-auto">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.actions.map((action) => (
              <AIActionCard
                key={action.id}
                action={action}
                projectId={projectId}
                messageId={message.id}
              />
            ))}
          </div>
        )}

        {/* Token Usage (for debugging) */}
        {message.tokens && (
          <div className="mt-2 text-xs text-gray-600">
            {message.tokens.input + message.tokens.output} tokens
            {message.tokens.cost > 0 && ` • $${message.tokens.cost.toFixed(4)}`}
          </div>
        )}
      </div>
    </div>
  );
}
