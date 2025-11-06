# Medical AI Avatar System

> Professional Next.js + TypeScript application for medical student training with AI-powered 3D avatar interactions and lip-sync capabilities.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **React Three Fiber** for performant 3D rendering
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Professional architecture** following software engineering best practices
- **Modular design** for easy integration and scalability
- **Ready Player Me** avatar support
- **Real-time lip sync** system with viseme-based animations
- **Interactive camera controls** with live adjustments

## 📁 Project Structure

```
medical-ai-avatar-system/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── AvatarScene.tsx          # Main 3D scene
│   ├── ControlPanel.tsx         # Control sidebar
│   ├── CameraControls.tsx       # Camera adjustment UI
│   ├── Header.tsx               # App header
│   ├── InfoPanel.tsx            # Info overlay
│   └── LoadingFallback.tsx      # Loading state
├── lib/                         # Core business logic
│   ├── managers/
│   │   ├── AvatarManager.ts    # Avatar loading & management
│   │   └── LipSyncManager.ts   # Lip sync system
│   └── utils/                   # Utility functions
├── store/                       # Zustand state management
│   ├── useAvatarStore.ts       # Avatar state
│   └── useConversationStore.ts  # Conversation state
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Global types
├── public/                      # Static assets
│   ├── models/                  # 3D model files
│   └── assets/                  # Images, icons, etc.
├── old_version/                 # Backup of vanilla JS version
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind configuration
└── package.json                 # Dependencies
```

## 🛠️ Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Run development server**:

```bash
npm run dev
```

3. **Open browser**:

Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Loading an Avatar

1. **Default Avatar**: Click "Load Avatar" without entering a URL
2. **Custom Avatar**:
   - Enter a Ready Player Me URL (`.glb` format)
   - Press Enter or click "Load Avatar"

### Camera Controls

Use the sliders in the control panel to adjust:
- **Distance**: How far the camera is from the avatar (0.5 - 5.0)
- **Height**: Vertical position of the camera (0.5 - 2.5)
- **Look At**: Where the camera focuses (0.5 - 2.5)
- **FOV**: Field of view / zoom level (30° - 75°)

Click "Save as Default" to log current settings to the console.

### Mouse Controls

- **Left Click + Drag**: Rotate around avatar
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out

## 🏗️ Architecture

### Component Hierarchy

```
App
└── Home (page.tsx)
    ├── Header
    ├── ControlPanel
    │   └── CameraControls
    ├── AvatarScene
    │   ├── Scene
    │   ├── CameraController
    │   └── Canvas (React Three Fiber)
    └── InfoPanel
```

### State Management

**Zustand stores**:

1. **useAvatarStore**: Manages avatar state and camera configuration
2. **useConversationStore**: Manages conversation flow and scoring

### Manager Classes

1. **AvatarManager**:
   - Loads and manages 3D avatars
   - Handles morph targets for facial animations
   - Manages animations and cleanup

2. **LipSyncManager**:
   - Viseme-based lip synchronization
   - Smooth morphing interpolation
   - External service integration ready

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Adding New Features

#### 1. Add a New Component

```typescript
// components/MyComponent.tsx
'use client';

export default function MyComponent() {
  return <div>My Component</div>;
}
```

#### 2. Add State Management

```typescript
// store/useMyStore.ts
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

#### 3. Add Types

```typescript
// types/index.ts
export interface MyType {
  id: string;
  name: string;
}
```

## 🎨 Styling

This project uses **Tailwind CSS** for styling.

### Custom Colors

```typescript
// Primary gradient: from-primary-500 to-secondary-500
// Background: bg-gradient-to-br from-slate-800 to-slate-900
```

### Customizing Styles

Edit `tailwind.config.ts` to modify the design system.

## 🔌 Integration Guide

### Adding AI Conversation

```typescript
// 1. Install OpenAI SDK
npm install openai

// 2. Create AI service
// lib/services/OpenAIService.ts
export class OpenAIService {
  async chat(message: string): Promise<string> {
    // Your implementation
  }
}

// 3. Use in component
import { OpenAIService } from '@/lib/services/OpenAIService';
const ai = new OpenAIService();
const response = await ai.chat('Hello');
```

### Adding Speech Recognition

```typescript
// Use Web Speech API or external service
const recognition = new (window as any).webkitSpeechRecognition();
recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  console.log(transcript);
};
recognition.start();
```

### Adding Lip Sync with Azure Speech

```typescript
// Install SDK
npm install microsoft-cognitiveservices-speech-sdk

// Use in component
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = sdk.SpeechConfig.fromSubscription('KEY', 'REGION');
const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

synthesizer.visemeReceived = (s, e) => {
  lipSyncManager.triggerViseme(e.visemeId, 50);
};

synthesizer.speakTextAsync('Hello');
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```bash
docker build -t medical-avatar .
docker run -p 3000:3000 medical-avatar
```

## 🧪 Testing

```bash
# Add testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

## 🐛 Troubleshooting

### Avatar not loading

- Check console for errors
- Verify URL is a direct `.glb` link
- Check CORS settings
- Try default avatar first

### TypeScript errors

```bash
npm run type-check
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://github.com/pmndrs/zustand)
- [Three.js](https://threejs.org/docs/)
- [Ready Player Me](https://readyplayer.me/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for medical education

---

## 🆚 Version History

### v2.0.0 (Current)
- Complete rewrite in Next.js + TypeScript
- Professional component architecture
- State management with Zustand
- React Three Fiber integration
- Tailwind CSS styling

### v1.0.0 (old_version/)
- Vanilla HTML/CSS/JavaScript
- Three.js direct integration
- Python HTTP server

---

**Need help?** Check the `/old_version/INTEGRATION_GUIDE.md` for additional integration examples.
