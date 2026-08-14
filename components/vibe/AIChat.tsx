/**
 * AI Chat Component
 * Conversation interface with AI assistant
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { VibeProject } from '@/lib/models/VibeProject';
import { VibeMessage } from '@/lib/models/VibeConversation';
import { useSendVibeMessage } from '@/lib/hooks/useVibeProjects';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIChatProps {
  projectId: string;
  project: VibeProject;
  messages: VibeMessage[];
}

export default function AIChat({ projectId, project, messages }: AIChatProps) {
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendVibeMessage(projectId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || sendMessage.isPending) return;

    setIsThinking(true);
    try {
      await sendMessage.mutateAsync(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500">Ask me anything</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-green-600/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">
              Let's Build Something Amazing
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              I'm here to help you code. Try:
            </p>
            <div className="space-y-2 text-sm text-left max-w-xs mx-auto">
              <div className="p-3 bg-gray-800 rounded-lg text-gray-300">
                "Create a homepage component"
              </div>
              <div className="p-3 bg-gray-800 rounded-lg text-gray-300">
                "Add styling to the navbar"
              </div>
              <div className="p-3 bg-gray-800 rounded-lg text-gray-300">
                "Explain this code to me"
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            projectId={projectId}
          />
        ))}

        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800">
        <ChatInput
          onSend={handleSendMessage}
          disabled={sendMessage.isPending}
          placeholder="Ask AI to build, modify, or explain..."
        />
      </div>
    </div>
  );
}
