# Integration Guide

This guide provides step-by-step instructions for integrating various services and features into your Medical AI Avatar System.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Integrating AI Services](#integrating-ai-services)
3. [Adding Lip Sync](#adding-lip-sync)
4. [Implementing Scoring](#implementing-scoring)
5. [Testing](#testing)

---

## Quick Start

### Running the Application

1. Start a local server:
   ```bash
   # Option 1: Using Node.js
   npm start

   # Option 2: Using Python
   python -m http.server 8000

   # Option 3: Using PHP
   php -S localhost:8000
   ```

2. Open http://localhost:8000 in your browser

3. Click "Load Avatar" to load the default avatar

4. Use mouse controls to interact with the 3D scene

---

## Integrating AI Services

### Option 1: OpenAI GPT (Recommended for Beginners)

#### Step 1: Get API Key
- Sign up at https://platform.openai.com/
- Create an API key

#### Step 2: Create Configuration File

Create `js/config.js`:

```javascript
export const CONFIG = {
    openai: {
        apiKey: 'YOUR_OPENAI_API_KEY', // IMPORTANT: In production, use environment variables
        model: 'gpt-4',
        maxTokens: 150,
        temperature: 0.8
    }
};
```

#### Step 3: Update ConversationManager

In `js/ConversationManager.js`, modify the `getAIResponse` method:

```javascript
import { CONFIG } from './config.js';

async getAIResponse(input) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.openai.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a ${this.currentScenario.patientProfile.age}-year-old ${this.currentScenario.patientProfile.gender} patient with ${this.currentScenario.condition}.

                        Patient Profile:
                        - Chief Complaint: ${this.currentScenario.patientProfile.chiefComplaint}
                        - Medical History: ${this.currentScenario.patientProfile.medicalHistory.join(', ')}
                        - Medications: ${this.currentScenario.patientProfile.medications.join(', ')}

                        Respond naturally and realistically to the doctor's questions. Show appropriate emotion and concern. Do not provide medical diagnoses yourself - respond as the patient would.`
                    },
                    ...this.conversationHistory.map(msg => ({
                        role: msg.role === 'student' ? 'user' : 'assistant',
                        content: msg.text
                    })),
                    {
                        role: 'user',
                        content: input
                    }
                ],
                max_tokens: CONFIG.openai.maxTokens,
                temperature: CONFIG.openai.temperature
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('OpenAI API Error:', data.error);
            return 'I\'m sorry, I didn\'t understand that. Could you rephrase?';
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting AI response:', error);
        return 'I\'m having trouble responding right now.';
    }
}
```

---

### Option 2: Azure OpenAI Service

#### Step 1: Setup Azure

1. Create an Azure account
2. Create an Azure OpenAI resource
3. Deploy a GPT model
4. Get your endpoint and API key

#### Step 2: Configuration

```javascript
export const CONFIG = {
    azure: {
        endpoint: 'https://YOUR_RESOURCE.openai.azure.com/',
        apiKey: 'YOUR_API_KEY',
        deploymentName: 'YOUR_DEPLOYMENT_NAME',
        apiVersion: '2024-02-01'
    }
};
```

#### Step 3: Implementation

```javascript
async getAIResponse(input) {
    const url = `${CONFIG.azure.endpoint}openai/deployments/${CONFIG.azure.deploymentName}/chat/completions?api-version=${CONFIG.azure.apiVersion}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'api-key': CONFIG.azure.apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                // ... same structure as OpenAI
            ]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
```

---

## Adding Lip Sync

### Option 1: Azure Speech Service (Recommended)

Azure provides viseme data which is perfect for accurate lip sync.

#### Step 1: Install SDK

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

#### Step 2: Create Speech Service Module

Create `js/AzureSpeechService.js`:

```javascript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export class AzureSpeechService {
    constructor(subscriptionKey, region, lipSyncManager) {
        this.speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
        this.speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
        this.lipSyncManager = lipSyncManager;
    }

    async speak(text) {
        const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

        return new Promise((resolve, reject) => {
            // Handle viseme events for lip sync
            synthesizer.visemeReceived = (s, e) => {
                // Convert Azure viseme ID to our viseme format
                const visemeMap = {
                    0: 'sil', 1: 'aa', 2: 'E', 3: 'I', 4: 'O',
                    5: 'U', 6: 'PP', 7: 'FF', 8: 'TH', 9: 'DD',
                    10: 'kk', 11: 'CH', 12: 'SS', 13: 'nn', 14: 'RR'
                };

                const viseme = visemeMap[e.visemeId] || 'sil';
                const duration = e.audioOffset / 10000; // Convert to ms

                this.lipSyncManager.triggerViseme(viseme, 50);
            };

            synthesizer.speakTextAsync(
                text,
                result => {
                    synthesizer.close();
                    resolve(result);
                },
                error => {
                    synthesizer.close();
                    reject(error);
                }
            );
        });
    }
}
```

#### Step 3: Integration

In your main application:

```javascript
import { AzureSpeechService } from './js/AzureSpeechService.js';

// Initialize
const speechService = new AzureSpeechService(
    'YOUR_SUBSCRIPTION_KEY',
    'YOUR_REGION',
    lipSyncManager
);

// Use
await speechService.speak('Hello, I am your virtual patient.');
```

---

### Option 2: Rhubarb Lip Sync (Free, Offline)

Rhubarb analyzes audio and generates viseme data.

#### Step 1: Download Rhubarb

Download from: https://github.com/DanielSWolf/rhubarb-lip-sync

#### Step 2: Generate Viseme Data

```bash
# Process audio file
rhubarb -f json -o visemes.json audio.wav
```

#### Step 3: Use Viseme Data

```javascript
// Load viseme data
const response = await fetch('visemes.json');
const visemeData = await response.json();

// Play with lip sync
lipSyncManager.integrateExternalVisemeData({
    visemes: visemeData.mouthCues.map(cue => ({
        viseme: cue.value,
        time: cue.start
    })),
    duration: visemeData.metadata.duration
});

// Play audio
audioManager.playAudio('audio.wav');
```

---

## Implementing Scoring

### Step 1: Enhance ConversationManager

The `ConversationManager.js` already includes basic scoring. Enhance it:

```javascript
analyzeStudentInput(input) {
    const lowerInput = input.toLowerCase();

    // Check for required questions based on scenario
    const requiredQuestions = this.currentScenario.requiredQuestions || [];

    requiredQuestions.forEach(question => {
        if (lowerInput.includes(question.keyword)) {
            question.asked = true;
            this.score.diagnosticAccuracy += question.points;
        }
    });

    // Check for empathy
    const empathyPhrases = [
        'how are you feeling',
        'i understand',
        'that must be',
        'i\'m sorry to hear',
        'thank you for sharing'
    ];

    if (empathyPhrases.some(phrase => lowerInput.includes(phrase))) {
        this.score.empathy += 10;
    }

    // Communication quality
    const hasProfessionalOpening = this.conversationHistory.length === 1 &&
        (lowerInput.includes('hello') || lowerInput.includes('good'));

    if (hasProfessionalOpening) {
        this.score.communicationSkills += 10;
    }

    this.updateTotalScore();
}
```

### Step 2: Add Required Questions to Scenarios

```javascript
export const EXAMPLE_SCENARIOS = {
    chestPain: {
        // ... existing properties
        requiredQuestions: [
            { keyword: 'pain', question: 'Tell me about the pain', points: 10, asked: false },
            { keyword: 'when', question: 'When did it start', points: 10, asked: false },
            { keyword: 'rate', question: 'Rate the pain', points: 8, asked: false },
            { keyword: 'radiation', question: 'Does it radiate', points: 8, asked: false },
            { keyword: 'shortness', question: 'Any breathing issues', points: 8, asked: false },
            { keyword: 'medication', question: 'Current medications', points: 7, asked: false },
            { keyword: 'history', question: 'Medical history', points: 7, asked: false }
        ]
    }
};
```

### Step 3: Display Score in UI

Add to your HTML:

```html
<div id="score-panel">
    <h3>Performance Score</h3>
    <div class="score-item">
        <span>Total:</span>
        <span id="score-total">0</span>
    </div>
    <div class="score-item">
        <span>Empathy:</span>
        <span id="score-empathy">0</span>
    </div>
    <div class="score-item">
        <span>Diagnostic:</span>
        <span id="score-diagnostic">0</span>
    </div>
    <div class="score-item">
        <span>Communication:</span>
        <span id="score-communication">0</span>
    </div>
</div>
```

Update scores in real-time:

```javascript
updateScoreDisplay() {
    document.getElementById('score-total').textContent =
        Math.round(this.score.total);
    document.getElementById('score-empathy').textContent =
        Math.round(this.score.empathy);
    document.getElementById('score-diagnostic').textContent =
        Math.round(this.score.diagnosticAccuracy);
    document.getElementById('score-communication').textContent =
        Math.round(this.score.communicationSkills);
}
```

---

## Testing

### Test 1: Avatar Loading

```javascript
// In browser console
avatarApp.avatarManager.loadAvatar();
```

### Test 2: Lip Sync

```javascript
// Test lip sync animation
avatarApp.lipSyncManager.testLipSync();
```

### Test 3: Conversation Flow

```javascript
import { ConversationManager, EXAMPLE_SCENARIOS } from './js/ConversationManager.js';

const conversationManager = new ConversationManager(
    avatarApp.audioManager,
    avatarApp.lipSyncManager
);

// Start a test session
conversationManager.startSession(EXAMPLE_SCENARIOS.chestPain);

// Simulate student input
conversationManager.onStudentInput('Tell me about your chest pain');

// End session and get results
const results = conversationManager.endSession();
console.log('Final score:', results.score);
console.log('Feedback:', results.feedback);
```

---

## Production Checklist

- [ ] Store API keys in environment variables, not in code
- [ ] Implement proper error handling
- [ ] Add loading states for all async operations
- [ ] Test on different browsers and devices
- [ ] Optimize 3D models for performance
- [ ] Implement session recording for review
- [ ] Add user authentication
- [ ] Set up analytics
- [ ] Create backup AI response system
- [ ] Test with real medical students

---

## Security Best Practices

### 1. API Key Management

**Never commit API keys to version control!**

Create a backend server to handle API calls:

```javascript
// Backend (Node.js/Express)
app.post('/api/chat', async (req, res) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        // ... rest of request
    });

    const data = await response.json();
    res.json(data);
});

// Frontend
async function getAIResponse(input) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ input })
    });
    return await response.json();
}
```

### 2. Use Environment Variables

```bash
# .env file
OPENAI_API_KEY=sk-...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus
```

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
const rateLimiter = {
    requests: [],
    maxRequests: 10,
    timeWindow: 60000, // 1 minute

    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);

        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }

        return false;
    }
};
```

---

## Troubleshooting

### Issue: Avatar not loading
- Check console for CORS errors
- Verify the URL is a direct link to a .glb file
- Try loading the fallback avatar first

### Issue: No lip sync
- Verify avatar has morph targets: `avatarManager.getMorphTargetNames()`
- Check that viseme names match
- Enable console logging in LipSyncManager

### Issue: Microphone not working
- Ensure HTTPS (required for mic access)
- Check browser permissions
- Verify audio context is initialized

### Issue: API calls failing
- Check API keys are correct
- Verify rate limits not exceeded
- Check network requests in browser DevTools

---

## Next Steps

1. Choose your AI service (OpenAI, Azure, etc.)
2. Implement the integration following the guide above
3. Test with a simple scenario
4. Add lip sync integration
5. Enhance the scoring system
6. Deploy to production

---

## Support Resources

- Three.js Docs: https://threejs.org/docs/
- OpenAI API Docs: https://platform.openai.com/docs
- Azure Speech Docs: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/
- Ready Player Me Docs: https://docs.readyplayer.me/

For questions, check the browser console for error messages and refer to the troubleshooting section.
