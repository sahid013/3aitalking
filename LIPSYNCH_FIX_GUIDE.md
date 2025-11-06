# Lip-Sync Fix Guide

## What Was Fixed

Your avatar was experiencing excessive face deformation because the morph target values were too high and being applied to all facial features (eyes, cheeks, entire head) instead of just the mouth.

### Changes Made:

1. **Drastically Reduced Morph Values**
   - Before: Values up to 0.30 (30% deformation)
   - After: Maximum 0.08 (8% deformation) with a hard limit of 0.15
   - This prevents the entire face from collapsing

2. **Strict Mesh Filtering**
   - Now ONLY applies morph targets to mouth-related morphs
   - Completely skips eye meshes
   - Filters out non-mouth morphs (eyebrows, cheeks, nose, etc.)

3. **Safety Limits Added**
   - Hard-coded maximum value of 0.15 to prevent excessive deformation
   - Better validation and logging

4. **Debug Panel Added**
   - A new debug panel in the bottom-right corner
   - Lets you test individual morph targets
   - Shows what morphs are available on your avatar

## How to Test

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Load Your Avatar
1. Open http://localhost:3000
2. Load your avatar using the control panel
3. Watch the console (F12) for morph target logs

### Step 3: Check the Console
Look for these logs:
```
✅ Extracting morphs from: Wolf3D_Head
⏭️ Skipping non-mouth morph: eyeBlinkLeft
✅ Registered mouth morph: mouthOpen at index 0
```

This tells you which morphs are being used.

### Step 4: Use the Debug Panel
1. Look for the "🔧 Morph Debug Panel" in the bottom-right corner
2. Select a morph target from the dropdown
3. Adjust the test value slider (start with 0.05)
4. Click "Test Morph" to see the effect
5. Click "Reset All" to return to neutral

### Step 5: Test Lip-Sync
1. Click "Start Conversation"
2. Click "Press to Speak" and say something
3. The avatar should now have subtle mouth movements
4. Watch the console for logs like: `🎭 Setting mouthOpen = 0.045`

## If Face Still Moves Too Much

### Option 1: Reduce Values Further
Edit `lib/managers/LipSyncManager.ts` and reduce the values:

```typescript
// Make them even smaller
PP: { name: 'mouthOpen', value: 0.01 },  // Was 0.02
aa: { name: 'mouthOpen', value: 0.04 },  // Was 0.08
```

### Option 2: Lower the Safety Limit
Edit `lib/managers/AvatarManager.ts` line 356:

```typescript
// Change from 0.15 to 0.10 or lower
const clampedValue = Math.max(0, Math.min(0.10, Math.max(0, Math.min(1, value))));
```

### Option 3: Disable Lip-Sync Temporarily
In the console (F12), type:
```javascript
window.lipSyncManager.setEnabled(false);
```

To re-enable:
```javascript
window.lipSyncManager.setEnabled(true);
```

## Understanding the Console Logs

**Good signs:**
```
✅ Extracting morphs from: Wolf3D_Head
✅ Registered mouth morph: mouthOpen
🎭 Setting mouthOpen = 0.045
```

**Potential issues:**
```
⏭️ Skipping non-mouth morph: eyeBlinkLeft  ← Good, this should be skipped
❌ Mesh has no morphTargetInfluences  ← Problem with avatar
⚠️ Morph target not found: mouthOpen  ← Morph doesn't exist on avatar
```

## Morph Target Names

Your Ready Player Me avatar should have these mouth-related morphs:
- `mouthOpen` - Opens the mouth
- `mouthSmile` - Smile expression
- `jawOpen` - Jaw movement
- `mouthFunnel` - Pucker/funnel shape
- `mouthRollLower` / `mouthRollUpper` - Lip rolls

Use the Debug Panel to see which ones are actually available on your avatar.

## Technical Details

### Safety Limits (in code)
1. **LipSyncManager**: Defines base values (0.02 - 0.08)
2. **AvatarManager**: Applies hard limit of 0.15 maximum
3. **Mesh Filtering**: Only mouth-related morphs registered

### Text-to-Viseme System
The system now:
1. Converts your text to phonemes (P, A, E, etc.)
2. Maps phonemes to visemes (mouth shapes)
3. Schedules them precisely with audio timing
4. Applies minimal deformation values

This is based on the TalkingHead project's approach but with much more conservative values to prevent the issues you experienced.

## Remove Debug Panel

When ready for production, remove this line from `app/page.tsx`:
```typescript
{/* Debug Panel - Remove this in production */}
<MorphDebugPanel />
```

## Need Help?

1. Check console logs (F12) for detailed debugging info
2. Use the Debug Panel to test individual morphs
3. Try different avatars from Ready Player Me
4. Lower values if still too much movement
5. Check that your avatar has mouth morph targets
