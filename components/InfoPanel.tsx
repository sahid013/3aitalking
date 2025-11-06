'use client';

import { useEffect, useState } from 'react';

export default function InfoPanel() {
  const [conversationState, setConversationState] = useState<string>('idle');

  useEffect(() => {
    // Listen for global conversation state changes
    const checkState = () => {
      if (typeof window !== 'undefined' && (window as any).conversationManager) {
        // We'll update this through a global event
      }
    };

    const interval = setInterval(checkState, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 max-w-sm">
        <h3 className="text-lg font-semibold text-primary-600 mb-4">
          Quick Guide
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong className="text-gray-900">🎤 Voice:</strong> Click &quot;Press to Speak&quot; to talk
          </li>
          <li>
            <strong className="text-gray-900">🖱️ Rotate:</strong> Left mouse + drag
          </li>
          <li>
            <strong className="text-gray-900">🔍 Zoom:</strong> Scroll wheel
          </li>
          <li>
            <strong className="text-gray-900">📱 Pan:</strong> Right mouse + drag
          </li>
          <li>
            <strong className="text-gray-900">⚙️ Adjust:</strong> Use camera sliders
          </li>
        </ul>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-medium">
            💡 <strong>Tip:</strong> Make sure to allow microphone access when prompted!
          </p>
        </div>
      </div>
    </>
  );
}
