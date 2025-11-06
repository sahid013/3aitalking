'use client';

export default function LoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading Avatar System...</p>
      </div>
    </div>
  );
}
