# 🎤 Voice Conversation Quick Start

## Get Started in 3 Steps

### Step 1: Setup API Key (One-time)

```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and add:
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your key at: https://platform.openai.com/api-keys

**Then restart the server**:
```bash
npm run dev
```

### Step 2: Load Avatar

1. Refresh browser: http://localhost:3000
2. Click **"Load Avatar"** button in left panel
3. Wait for avatar to appear

### Step 3: Start Talking!

1. Click **"Start Conversation"** in right panel
2. Click the big **"🎤 Press to Speak"** button
3. **Allow microphone** when browser asks
4. **Speak clearly**: "Hello, I'm Dr. Smith. What brings you in today?"
5. **Wait and watch** the avatar respond with lip movements!

## 🎯 How Voice Interaction Works

```
You Click "Press to Speak"
        ↓
Browser asks for microphone permission
        ↓
You speak your question
        ↓
Speech is converted to text
        ↓
Sent to ChatGPT
        ↓
AI generates patient response
        ↓
Response converted to speech
        ↓
Avatar speaks with LIP SYNC! 🗣️
```

## 💡 Tips for Best Experience

### Speaking Tips
✅ **DO:**
- Speak clearly and at normal pace
- Wait for complete silence before speaking
- Use medical terminology naturally
- Ask one question at a time

❌ **DON'T:**
- Speak too fast or mumble
- Talk while avatar is speaking
- Use very long sentences
- Speak with background noise

### Example Conversation Flow

**You:** "Hello, I'm Dr. Smith. Can you tell me your name?"

**Avatar:** *[Speaks with lip sync]* "Hello doctor, my name is John. Thank you for seeing me."

**You:** "What brings you in today, John?"

**Avatar:** *[Speaks with lip sync]* "I've been experiencing chest pain for the past few hours."

**You:** "Can you describe the pain for me?"

**Avatar:** *[Speaks with lip sync]* "It feels like pressure in my chest, like something heavy is sitting on it."

## 🔧 Troubleshooting Voice Issues

### Microphone Not Working

**Problem:** Browser doesn't ask for permission
- **Solution:** Check URL bar for 🎤 icon, click to allow

**Problem:** "Microphone blocked" error
- **Solution:**
  - Chrome: Settings → Privacy → Site Settings → Microphone
  - Allow localhost

**Problem:** Voice not detected
- **Solution:**
  - Test your microphone in system settings
  - Speak louder and closer to mic
  - Check if other apps are using microphone

### Avatar Not Speaking

**Problem:** No sound from avatar
- **Solution:**
  - Check system volume
  - Check browser isn't muted
  - Refresh the page

**Problem:** No lip sync
- **Solution:**
  - Make sure avatar is loaded
  - Check console for errors
  - Try reloading avatar

### API Errors

**Problem:** "OpenAI API key is missing"
- **Solution:**
  - Create `.env.local` with your API key
  - Restart server with `npm run dev`

**Problem:** "Failed to process message"
- **Solution:**
  - Check API key is correct
  - Check internet connection
  - Verify OpenAI account has credits

## 🎮 Voice-Only Mode Features

### What You See:

```
┌─────────────────────────────────┐
│  🎤 Press to Speak              │  ← Big button
│  (Listening/Thinking/Speaking)  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  💡 How to talk:                │
│  1. Click button above          │
│  2. Speak your question         │
│  3. Wait for response           │
│  4. Avatar speaks & lip syncs   │
└─────────────────────────────────┘

┌──────────────┬─────────────────┐
│ Type Instead │  End Session    │  ← Secondary options
└──────────────┴─────────────────┘
```

### State Indicators:

- **🎤 Press to Speak** = Ready, click to start
- **🎤 Listening...** = Recording your voice (animated pulse)
- **🤔 Thinking...** = AI processing (spinning)
- **💬 Speaking...** = Avatar responding with voice

### Text Option (Hidden by Default):

If you need to type instead of speaking:
1. Click **"Type Instead"** button
2. Text input will appear
3. Type and press Enter or click Send

## 📊 What Happens Behind the Scenes

### When You Speak:

1. **Speech Recognition** (Web Speech API)
   - Browser captures your voice
   - Converts speech to text
   - ~95% accuracy for clear speech

2. **AI Processing** (ChatGPT)
   - Receives your text
   - Generates natural patient response
   - Context-aware and realistic

3. **Text-to-Speech** (OpenAI TTS)
   - Converts AI response to voice
   - High-quality neural voice
   - Natural intonation

4. **Lip Sync** (Custom Algorithm)
   - Analyzes audio frequencies
   - Triggers avatar mouth movements
   - Real-time synchronization

## 🎯 Practice Scenarios

### Scenario 1: Initial Assessment
```
You: "Hello, I'm Dr. Smith. What's your name?"
Avatar: "Hello doctor, I'm John. Thank you for seeing me."
You: "What brings you in today?"
Avatar: "I've been having chest pain."
You: "When did this start?"
Avatar: "About 3 hours ago."
```

### Scenario 2: Detailed History
```
You: "Can you describe the pain?"
Avatar: "It's a pressure-like pain in my chest."
You: "Does it radiate anywhere?"
Avatar: "Yes, to my left arm sometimes."
You: "Do you have any medical conditions?"
Avatar: "I have high blood pressure."
```

### Scenario 3: Medication Review
```
You: "What medications are you taking?"
Avatar: "I take Lisinopril for my blood pressure."
You: "Any allergies?"
Avatar: "I'm allergic to penicillin."
```

## 🚀 Advanced Tips

### For Better Conversations:

1. **Use Open-Ended Questions**
   - ✅ "Can you describe your symptoms?"
   - ❌ "Does it hurt?" (yes/no)

2. **Follow Medical Interview Structure**
   - Chief complaint
   - History of present illness
   - Past medical history
   - Medications
   - Allergies
   - Social history

3. **Build Rapport**
   - Use patient's name
   - Show empathy
   - Active listening

### Keyboard Shortcuts (Coming Soon):

- `Space` - Start/Stop speaking
- `Enter` - Quick text input
- `Esc` - End session

## 📱 Mobile Support

Voice works on mobile too!

- **iOS Safari**: Full support
- **Android Chrome**: Full support
- Grant microphone permission when prompted
- Use headphones for best experience

## ✨ What's Next?

After you're comfortable with basic voice conversation:

1. ✅ Try different patient scenarios
2. ✅ Practice full medical interviews
3. ✅ Review conversation transcripts
4. ✅ Get AI-powered feedback (coming soon)
5. ✅ Record sessions (coming soon)

---

**Ready to start?**

1. Make sure `.env.local` has your API key
2. Run `npm run dev`
3. Load avatar
4. Click "Start Conversation"
5. Click "🎤 Press to Speak"
6. **Just talk!** 🎤
