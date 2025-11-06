'use client';

import { useState, useEffect, useRef } from 'react';
import { ConversationMessage } from '@/types';
import { useConversationStore } from '@/store/useConversationStore';

interface ConversationPanelProps {
  conversationState: 'idle' | 'listening' | 'thinking' | 'speaking';
  messages: ConversationMessage[];
  onSendMessage: (message: string) => void;
  onStartVoiceInput: () => void;
  onStartSession: () => void;
  onEndSession: () => void;
  isActive: boolean;
}

export default function ConversationPanel({
  conversationState,
  messages,
  onSendMessage,
  onStartVoiceInput,
  onStartSession,
  onEndSession,
  isActive,
}: ConversationPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() && conversationState === 'idle') {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const getStateDisplay = () => {
    switch (conversationState) {
      case 'listening':
        return { text: 'Listening...', color: 'text-blue-500', icon: '🎤' };
      case 'thinking':
        return { text: 'Thinking...', color: 'text-yellow-500', icon: '🤔' };
      case 'speaking':
        return { text: 'Speaking...', color: 'text-green-500', icon: '💬' };
      default:
        return { text: 'Ready', color: 'text-gray-500', icon: '✓' };
    }
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Conversation</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm">{stateDisplay.icon}</span>
            <span className={`text-sm font-medium ${stateDisplay.color}`}>
              {stateDisplay.text}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isActive && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">No conversation yet</p>
            <p className="text-sm">Start a session to begin talking with the AI patient</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'student'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="text-xs font-semibold mb-1">
                {message.role === 'student' ? 'You (Doctor)' : 'Patient'}
              </div>
              <div className="text-sm">{message.text}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isActive ? (
        <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          {/* Main Voice Button */}
          <button
            onClick={onStartVoiceInput}
            disabled={conversationState !== 'idle'}
            className={`w-full py-8 px-6 rounded-2xl font-bold text-xl
                       transition-all duration-300 transform
                       ${conversationState === 'idle'
                         ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 cursor-pointer'
                         : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                       }
                       flex items-center justify-center gap-4 mb-4`}
          >
            {conversationState === 'listening' ? (
              <>
                <span className="text-4xl animate-pulse">🎤</span>
                <span>Listening...</span>
              </>
            ) : conversationState === 'thinking' ? (
              <>
                <span className="text-4xl animate-spin">🤔</span>
                <span>Thinking...</span>
              </>
            ) : conversationState === 'speaking' ? (
              <>
                <span className="text-4xl">💬</span>
                <span>Speaking...</span>
              </>
            ) : (
              <>
                <span className="text-4xl">🎤</span>
                <span>Press to Speak</span>
              </>
            )}
          </button>

          {/* Voice Instructions */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>How to talk:</span>
            </h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Click the &quot;Press to Speak&quot; button above</li>
              <li>Speak your question clearly into the microphone</li>
              <li>Wait for the AI patient to respond</li>
              <li>The avatar will speak and show lip movements</li>
            </ol>
          </div>

          {/* Secondary Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const showTextInput = document.getElementById('textInputToggle');
                if (showTextInput) {
                  showTextInput.style.display =
                    showTextInput.style.display === 'none' ? 'flex' : 'none';
                }
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium
                       hover:bg-gray-300 transition-all duration-200"
            >
              Type Instead
            </button>

            <button
              onClick={onEndSession}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold
                       hover:bg-red-600 transition-all duration-200"
            >
              End Session
            </button>
          </div>

          {/* Hidden Text Input (Toggle) */}
          <div id="textInputToggle" className="mt-3" style={{ display: 'none' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question (optional)..."
                disabled={conversationState !== 'idle'}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-sm
                         focus:border-primary-500 focus:outline-none transition-colors
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || conversationState !== 'idle'}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold
                         hover:bg-primary-600 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>

          {conversationState === 'idle' && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              🎤 Voice is the primary way to interact • Type is optional
            </p>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onStartSession}
            className="w-full bg-gradient-primary text-white py-4 px-4 rounded-lg font-semibold
                     text-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Start Conversation
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Begin a medical consultation simulation
          </p>
        </div>
      )}
    </div>
  );
}
