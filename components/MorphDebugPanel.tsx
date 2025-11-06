'use client';

import { useState, useEffect } from 'react';

/**
 * Debug panel to test morph targets and diagnose issues
 * Open browser console to see available morph targets
 */
export default function MorphDebugPanel() {
  const [availableMorphs, setAvailableMorphs] = useState<string[]>([]);
  const [selectedMorph, setSelectedMorph] = useState('mouthOpen');
  const [testValue, setTestValue] = useState(0.1);

  useEffect(() => {
    // Check for available morphs when avatar is loaded
    const checkMorphs = () => {
      if (typeof window !== 'undefined' && (window as any).avatarManager) {
        const manager = (window as any).avatarManager;
        const morphs = manager.getMorphTargetNames();
        setAvailableMorphs(morphs);
        console.log('🔍 Available morph targets:', morphs);
      }
    };

    // Check immediately and then every second
    checkMorphs();
    const interval = setInterval(checkMorphs, 1000);

    return () => clearInterval(interval);
  }, []);

  const testMorph = () => {
    if (typeof window !== 'undefined' && (window as any).avatarManager) {
      const manager = (window as any).avatarManager;
      console.log(`🧪 Testing ${selectedMorph} = ${testValue}`);
      manager.setMorphTargetValue(selectedMorph, testValue);

      // Reset after 1 second
      setTimeout(() => {
        manager.setMorphTargetValue(selectedMorph, 0);
        console.log('🧪 Reset to 0');
      }, 1000);
    }
  };

  const resetAll = () => {
    if (typeof window !== 'undefined' && (window as any).avatarManager) {
      const manager = (window as any).avatarManager;
      availableMorphs.forEach(morph => {
        manager.setMorphTargetValue(morph, 0);
      });
      console.log('🔄 All morphs reset to 0');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 z-50">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>🔧</span>
        <span>Morph Debug Panel</span>
      </h3>

      {availableMorphs.length === 0 ? (
        <p className="text-sm text-gray-500">
          Load an avatar to see available morphs
        </p>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Morph Target ({availableMorphs.length} available)
            </label>
            <select
              value={selectedMorph}
              onChange={(e) => setSelectedMorph(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {availableMorphs.map((morph) => (
                <option key={morph} value={morph}>
                  {morph}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Test Value: {testValue.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="0.3"
              step="0.01"
              value={testValue}
              onChange={(e) => setTestValue(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={testMorph}
              className="flex-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm font-medium transition-colors"
            >
              Test Morph
            </button>
            <button
              onClick={resetAll}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="text-xs text-gray-500 border-t pt-2">
            Open browser console (F12) to see detailed logs
          </div>
        </div>
      )}
    </div>
  );
}
