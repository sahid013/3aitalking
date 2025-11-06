'use client';

import { useAvatarStore } from '@/store/useAvatarStore';

export default function CameraControls() {
  const { cameraConfig, setCameraConfig } = useAvatarStore();

  const handleSave = () => {
    console.log('=== Camera Settings ===');
    console.log(`Distance: ${cameraConfig.distance}`);
    console.log(`Height: ${cameraConfig.height}`);
    console.log(`Target Height: ${cameraConfig.targetHeight}`);
    console.log(`FOV: ${cameraConfig.fov}°`);
    alert('Camera settings saved to console! Press F12 to view.');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-600 border-b-2 border-primary-500 pb-2">
        Camera Position
      </h3>

      {/* Distance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distance: <span className="text-primary-600 font-semibold">{cameraConfig.distance.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={cameraConfig.distance}
          onChange={(e) =>
            setCameraConfig({ distance: parseFloat(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                   slider-thumb:bg-primary-500 hover:slider-thumb:bg-primary-600"
        />
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Height: <span className="text-primary-600 font-semibold">{cameraConfig.height.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={cameraConfig.height}
          onChange={(e) =>
            setCameraConfig({ height: parseFloat(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Target Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Look At: <span className="text-primary-600 font-semibold">{cameraConfig.targetHeight.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={cameraConfig.targetHeight}
          onChange={(e) =>
            setCameraConfig({ targetHeight: parseFloat(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* FOV */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FOV: <span className="text-primary-600 font-semibold">{cameraConfig.fov}°</span>
        </label>
        <input
          type="range"
          min="30"
          max="75"
          step="1"
          value={cameraConfig.fov}
          onChange={(e) =>
            setCameraConfig({ fov: parseFloat(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-semibold
                 hover:bg-gray-300 transition-all duration-200"
      >
        Save as Default
      </button>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          transition: transform 0.2s;
        }

        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
