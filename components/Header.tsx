'use client';

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg px-8 py-6 z-10">
      <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        Medical AI Avatar System
      </h1>
      <p className="text-gray-600 mt-1">
        Interactive Patient Simulation for Medical Students
      </p>
    </header>
  );
}
