/**
 * Text-to-Viseme Converter
 * Based on TalkingHead project's approach
 * Converts English text to Oculus viseme sequences with timing
 */

export interface VisemeData {
  visemes: string[];
  times: number[];
  durations: number[];
}

/**
 * Viseme duration weights (relative complexity)
 */
const VISEME_DURATIONS: Record<string, number> = {
  sil: 1.0,   // Silence
  PP: 1.1,    // P, B, M
  FF: 1.15,   // F, V
  TH: 1.2,    // TH
  DD: 1.1,    // D, T
  kk: 1.21,   // K, G
  CH: 1.18,   // CH, J, SH
  SS: 1.23,   // S, Z
  nn: 1.15,   // N, NG
  RR: 1.2,    // R
  aa: 0.95,   // AA, AE
  E: 0.90,    // E, EH
  I: 0.88,    // I, IH
  O: 0.92,    // O, AO
  U: 0.90,    // U, UW
};

/**
 * Phoneme-to-viseme mapping rules
 * Format: input text pattern -> output viseme
 */
const PHONEME_RULES: Record<string, string> = {
  // Consonants
  'B': 'PP',
  'P': 'PP',
  'M': 'PP',
  'F': 'FF',
  'V': 'FF',
  'TH': 'TH',  // Handle digraph first
  'T': 'DD',
  'D': 'DD',
  'N': 'nn',
  'L': 'DD',
  'K': 'kk',
  'G': 'kk',
  'NG': 'kk',  // Handle digraph
  'CH': 'CH',  // Handle digraph
  'SH': 'CH',  // Handle digraph
  'J': 'CH',
  'S': 'SS',
  'Z': 'SS',
  'R': 'RR',
  'W': 'U',
  'Y': 'I',

  // Vowels
  'A': 'aa',
  'E': 'E',
  'I': 'I',
  'O': 'O',
  'U': 'U',
};

/**
 * Special vowel combinations
 */
const VOWEL_COMBINATIONS: Record<string, string> = {
  'EE': 'I',
  'EA': 'I',
  'OO': 'U',
  'OU': 'U',
  'OW': 'O',
  'OY': 'O',
  'AI': 'E',
  'AY': 'E',
  'EI': 'E',
  'IE': 'I',
  'UE': 'U',
  'UI': 'U',
  'AU': 'aa',
  'AW': 'aa',
};

/**
 * Convert text to viseme sequence
 */
export function textToVisemes(text: string, estimatedDuration?: number): VisemeData {
  // Clean and normalize text
  const normalized = text.toUpperCase()
    .replace(/[.,!?;:]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();

  const visemes: string[] = [];
  const durations: number[] = [];

  // Add initial silence
  visemes.push('sil');
  durations.push(0.2);

  let i = 0;
  while (i < normalized.length) {
    const char = normalized[i];

    // Handle spaces (silence)
    if (char === ' ') {
      // Only add silence if the last viseme wasn't already silence
      if (visemes[visemes.length - 1] !== 'sil') {
        visemes.push('sil');
        durations.push(0.1);
      }
      i++;
      continue;
    }

    // Try to match multi-character phonemes first
    let matched = false;

    // Try 2-character combinations
    if (i + 1 < normalized.length) {
      const twoChar = normalized.substring(i, i + 2);

      // Check vowel combinations
      if (VOWEL_COMBINATIONS[twoChar]) {
        const viseme = VOWEL_COMBINATIONS[twoChar];
        addViseme(visemes, durations, viseme);
        i += 2;
        matched = true;
      }
      // Check consonant digraphs
      else if (PHONEME_RULES[twoChar]) {
        const viseme = PHONEME_RULES[twoChar];
        addViseme(visemes, durations, viseme);
        i += 2;
        matched = true;
      }
    }

    // If no multi-char match, try single character
    if (!matched) {
      if (PHONEME_RULES[char]) {
        const viseme = PHONEME_RULES[char];
        addViseme(visemes, durations, viseme);
      } else if (char.match(/[AEIOUY]/)) {
        // Default vowel mapping
        addViseme(visemes, durations, 'aa');
      } else if (char.match(/[BCDFGHJKLMNPQRSTVWXZ]/)) {
        // Default consonant mapping
        addViseme(visemes, durations, 'DD');
      }
      i++;
    }
  }

  // Add final silence
  visemes.push('sil');
  durations.push(0.2);

  // Calculate cumulative times
  const times = calculateTimes(durations, estimatedDuration);

  return { visemes, times, durations };
}

/**
 * Add a viseme to the sequence
 * If the same viseme is repeated, combine them (prevent flickering)
 */
function addViseme(
  visemes: string[],
  durations: number[],
  viseme: string
): void {
  const lastViseme = visemes[visemes.length - 1];

  if (lastViseme === viseme) {
    // Combine with previous viseme (extend duration)
    durations[durations.length - 1] += (VISEME_DURATIONS[viseme] || 1.0) * 0.5;
  } else {
    // Add new viseme
    visemes.push(viseme);
    durations.push(VISEME_DURATIONS[viseme] || 1.0);
  }
}

/**
 * Calculate cumulative times from durations
 * Scales to fit the estimated duration if provided
 */
function calculateTimes(
  durations: number[],
  estimatedDuration?: number
): number[] {
  // Calculate raw cumulative times
  const rawTimes: number[] = [];
  let cumulative = 0;

  for (const duration of durations) {
    rawTimes.push(cumulative);
    cumulative += duration;
  }

  // If estimated duration is provided, scale to fit
  if (estimatedDuration) {
    const totalRawDuration = cumulative;
    const scale = estimatedDuration / totalRawDuration;

    return rawTimes.map(time => time * scale);
  }

  // Otherwise, use a default speaking rate (250ms per unit)
  return rawTimes.map(time => time * 0.08);
}

/**
 * Enhanced text-to-viseme with better phoneme analysis
 * This uses more sophisticated rules for better accuracy
 */
export function enhancedTextToVisemes(text: string, estimatedDuration?: number): VisemeData {
  const words = text.toLowerCase().split(/\s+/);
  const visemes: string[] = ['sil'];
  const durations: number[] = [0.2];

  for (const word of words) {
    if (!word) continue;

    // Process each word
    const wordVisemes = wordToVisemes(word);

    for (const viseme of wordVisemes) {
      addViseme(visemes, durations, viseme);
    }

    // Add short pause between words
    visemes.push('sil');
    durations.push(0.08);
  }

  // Final silence
  visemes.push('sil');
  durations.push(0.2);

  const times = calculateTimes(durations, estimatedDuration);
  return { visemes, times, durations };
}

/**
 * Convert a single word to visemes using phonetic rules
 */
function wordToVisemes(word: string): string[] {
  const visemes: string[] = [];
  const upper = word.toUpperCase();
  let i = 0;

  while (i < upper.length) {
    // Try digraphs first (2 characters)
    if (i + 1 < upper.length) {
      const digraph = upper.substring(i, i + 2);

      if (VOWEL_COMBINATIONS[digraph]) {
        visemes.push(VOWEL_COMBINATIONS[digraph]);
        i += 2;
        continue;
      }

      if (PHONEME_RULES[digraph]) {
        visemes.push(PHONEME_RULES[digraph]);
        i += 2;
        continue;
      }
    }

    // Single character
    const char = upper[i];
    if (PHONEME_RULES[char]) {
      visemes.push(PHONEME_RULES[char]);
    } else if (char.match(/[AEIOUY]/)) {
      visemes.push('aa');
    } else if (char.match(/[BCDFGHJKLMNPQRSTVWXZ]/)) {
      visemes.push('DD');
    }

    i++;
  }

  return visemes;
}
