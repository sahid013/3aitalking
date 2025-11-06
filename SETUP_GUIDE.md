# Conversation Setup Guide

This guide will help you set up the AI conversation feature with voice interaction and lip sync.

## Prerequisites

- OpenAI API Key (required)
- Modern web browser with microphone support
- HTTPS connection (required for microphone access in production)

## Step 1: Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)

## Step 2: Configure Environment Variables

1. **Create `.env.local` file** in the project root:

```bash
cp .env.local.example .env.local
```

2. **Edit `.env.local`** and add your API key:

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control!

## Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Grant Microphone Permissions

When you click "Speak" for the first time:
1. Your browser will ask for microphone permission
2. Click "Allow"
3. If you accidentally clicked "Block", go to browser settings to enable it

## Usage

### Starting a Conversation

1. **Load an avatar** (if not already loaded)
   - Click "Load Avatar" button
   - Wait for avatar to appear

2. **Start conversation**
   - Click "Start Conversation" in the conversation panel
   - The AI patient will greet you

3. **Interact using voice**
   - Click the "🎤 Speak" button
   - Speak your question clearly
   - The avatar will respond with lip sync animation

4. **Or type your messages**
   - Type in the text input field
   - Press Enter or click "Send"

### Features

✅ **Voice Recognition**: Speak to the AI patient
✅ **Text-to-Speech**: AI responds with voice
✅ **Lip Sync**: Avatar mouth moves with speech
✅ **Chat History**: See full conversation
✅ **State Indicators**: Know when AI is listening/thinking/speaking

## API Costs

### OpenAI Pricing (as of 2024)

- **GPT-4o-mini** (text): ~$0.15 per 1M input tokens, $0.60 per 1M output tokens
- **TTS** (text-to-speech): ~$15 per 1M characters

### Estimated Costs for Medical Training

- **10-minute conversation**: ~$0.05-0.10
- **100 conversations**: ~$5-10
- **Very affordable for educational use!**

## Customization

### Change AI Patient Personality

Edit `lib/config.ts`:

```typescript
export const config = {
  conversation: {
    defaultPatientRole: 'You are a [age]-year-old [gender] patient with [condition]...',
  },
};
```

### Change Voice

In `lib/services/SpeechService.ts`, modify the voice selection:

```typescript
// Available voices: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
const voice = 'nova'; // Female voice (default)
```

### Add Custom Scenarios

Create patient scenarios in your code:

```typescript
const chestPainScenario = {
  id: 'chest-pain-001',
  name: 'Acute Chest Pain',
  patientProfile: {
    age: 55,
    gender: 'male',
    chiefComplaint: 'Chest pain for 3 hours',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Lisinopril', 'Metformin'],
  },
  condition: 'Possible myocardial infarction',
};

await conversationManager.startSession(chestPainScenario);
```

## Troubleshooting

### "OpenAI API key is missing" error

- Check that `.env.local` exists
- Verify the key starts with `sk-`
- Restart the dev server after adding the key

### Microphone not working

- Check browser permissions (look for 🎤 icon in address bar)
- Use HTTPS in production (required for mic access)
- Try in Chrome or Edge (best support)

### No lip sync

- Avatar must be loaded first
- Check browser console for errors
- Verify avatar has morph targets: Open console, type:
  ```javascript
  avatarManager.getMorphTargetNames()
  ```

### API errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Error**: OpenAI service issue

Check OpenAI status: [https://status.openai.com/](https://status.openai.com/)

## Advanced: Using Azure Speech Service

For better lip sync with precise viseme data:

1. **Get Azure Speech Service credentials**
2. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_AZURE_SPEECH_KEY=your-azure-key
   NEXT_PUBLIC_AZURE_SPEECH_REGION=eastus
   ```
3. **Install SDK**:
   ```bash
   npm install microsoft-cognitiveservices-speech-sdk
   ```
4. **Implementation example** in README.md

## Security Best Practices

### Development
✅ Use `.env.local` for API keys
✅ Never commit `.env.local`
✅ Add `.env.local` to `.gitignore`

### Production
⚠️ **DO NOT** expose API keys in client-side code!

**Recommended**: Create a backend API route:

```typescript
// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only!
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });

  return NextResponse.json(completion);
}
```

Then update your frontend to call this API instead of OpenAI directly.

## Testing Checklist

- [ ] `.env.local` created with OpenAI API key
- [ ] Dev server restarted
- [ ] Avatar loads successfully
- [ ] Conversation starts
- [ ] Text messages work
- [ ] Voice recognition works (microphone permission granted)
- [ ] AI responds with voice
- [ ] Lip sync animation visible
- [ ] No errors in browser console

## Support

- Check browser console (F12) for detailed error messages
- Verify all configuration steps above
- Test with simple text messages first before using voice
- Ensure stable internet connection for API calls

## Next Steps

1. ✅ Set up basic conversation (you are here!)
2. Add patient scenarios
3. Implement scoring system
4. Add session recording
5. Deploy to production

---

**Ready to test?** Load an avatar, click "Start Conversation", and say "Hello, I'm Doctor Smith. What brings you in today?"
