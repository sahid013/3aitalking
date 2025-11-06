'use client';

import { Suspense, useState, useEffect } from 'react';
import AvatarScene from '@/components/AvatarScene';
import ControlPanel from '@/components/ControlPanel';
import ConversationPanel from '@/components/ConversationPanel';
import MorphDebugPanel from '@/components/MorphDebugPanel';
import Header from '@/components/Header';
import LoadingFallback from '@/components/LoadingFallback';
import { ConversationMessage } from '@/types';
import { ConversationManager } from '@/lib/managers/ConversationManager';
import { SpeechService } from '@/lib/services/SpeechService_v2';
import { validateConfig } from '@/lib/config';

export default function Home() {
  const [conversationManager, setConversationManager] = useState<ConversationManager | null>(null);
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Initialize conversation manager
  useEffect(() => {
    // Validate configuration
    const validation = validateConfig();
    if (!validation.valid) {
      setConfigError(validation.errors.join('. '));
      console.error('Configuration errors:', validation.errors);
      return;
    }

    const speechService = new SpeechService();
    const manager = new ConversationManager(speechService);

    manager.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    manager.onStateChange((state) => {
      setConversationState(state);
    });

    setConversationManager(manager);

    // Make available globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).conversationManager = manager;
    }
  }, []);

  const handleStartSession = async () => {
    if (!conversationManager) return;

    try {
      setIsActive(true);
      await conversationManager.startSession();
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start conversation. Please check console for details.');
      setIsActive(false);
    }
  };

  const handleEndSession = () => {
    if (!conversationManager) return;

    conversationManager.endSession();
    setIsActive(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!conversationManager) return;

    try {
      await conversationManager.processTextInput(text);
    } catch (error) {
      console.error('Error processing message:', error);
      alert('Failed to process message. Please check your API key and try again.');
    }
  };

  const handleStartVoiceInput = async () => {
    if (!conversationManager) return;

    try {
      await conversationManager.processStudentVoiceInput();
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Failed to process voice input. Please check microphone permissions.');
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Configuration Error Warning */}
      {configError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-bold">Configuration Required</p>
          <p className="text-sm">{configError}</p>
          <p className="text-sm mt-2">
            Please create a <code className="bg-yellow-200 px-1">.env.local</code> file with your API keys.
            See <code className="bg-yellow-200 px-1">.env.local.example</code> for reference.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Control Panel */}
        <ControlPanel />

        {/* 3D Scene */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-800 to-slate-900">
          <Suspense fallback={<LoadingFallback />}>
            <AvatarScene />
          </Suspense>
        </div>

        {/* Conversation Panel */}
        <div className="w-96 p-4">
          <ConversationPanel
            conversationState={conversationState}
            messages={messages}
            onSendMessage={handleSendMessage}
            onStartVoiceInput={handleStartVoiceInput}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            isActive={isActive}
          />
        </div>
      </div>

      {/* Debug Panel - Remove this in production */}
      <MorphDebugPanel />
    </main>
  );
}
