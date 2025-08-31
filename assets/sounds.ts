// This module encapsulates audio playback functionality for the app.
// Sounds are stored as base64-encoded WAV files to avoid extra network requests.

// A single, pleasant chime sound (sine wave). Played as a 5-second warning.
const chimeSound = 'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhUAAAAAD//wA/AIA/T/7//v8AgD9QAEAAgD9QAEAAgD9Q//7/AD8AgD9AAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9AAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9AAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5QAAAA//8A/wBAAD8A/wA+AD8AAAAA//8AQAA/AP8APgA/AAAA//8AQAA/AP8APgA/AAAA//8AQAA/AP8APgA/AAAA//8AQAA/AP8APgA/AAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9AAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAA/AP8APgA/AAAA//8AQAA/AP8APgA/AAAA//8AQAA/AP8APgA/AAAA//8AQAA/AP8APgA/AAAA//8AQAD/AD8AgD5Q//7/AD8AgD9AAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9AAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5QAEAAgD9Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5Q//7/AD8AgD9QAAAA//8AQAD/AD8AgD5QAEAAgD9QAEAAgD9QAEAAgD9Q//7/AD8AgD9QAAAA//8A';

// A double buzzer sound (square wave). Played when a timer finishes.
const buzzerSound = 'data:audio/wav;base64,UklGRkgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhQAAAAAD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gAAAAAAAP7+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gAAAAAAAP7+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gAAAAAAAP7+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gAAAAAAAP7+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A/v7+/v7+AP7+/v7+/gD+/v7+/v4A';

// Use a singleton pattern to ensure we only have one AudioContext.
let audioContext: AudioContext | null = null;
// Cache decoded audio buffers for performance.
const audioBuffers: Record<string, AudioBuffer> = {};

/**
 * Creates and returns a single AudioContext instance.
 * Memoizes the context so it's only created once.
 */
const getAudioContext = (): AudioContext | null => {
  // Check if we've already created it.
  if (audioContext) {
    return audioContext;
  }
  // Check if the browser supports the Web Audio API.
  if (window.AudioContext || (window as any).webkitAudioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext created successfully.');
      return audioContext;
    } catch (e) {
      console.error("Error creating AudioContext:", e);
      return null;
    }
  } else {
    console.warn("Web Audio API is not supported in this browser.");
    return null;
  }
};

/**
 * Initializes the AudioContext. This must be called in response to a user
 * gesture (e.g., a click) to comply with browser autoplay policies.
 * It's safe to call this function multiple times.
 */
export const initAudio = async (): Promise<void> => {
  console.log('Attempting to initialize audio...');
  const context = getAudioContext();

  if (!context) {
    console.error('AudioContext is not available, cannot initialize.');
    // Fail gracefully without crashing the app.
    return;
  }

  // If the context is 'suspended', it needs to be resumed by a user action.
  if (context.state === 'suspended') {
    console.log('AudioContext is suspended, attempting to resume...');
    try {
      await context.resume();
      console.log(`AudioContext resumed successfully. Current state: ${context.state}`);
    } catch (e) {
      console.error('Failed to resume AudioContext. Sounds will not play.', e);
      // Do not re-throw the error. Re-throwing was causing the app to crash
      // when the user's browser blocked the AudioContext resume. The calling
      // component will catch this and log it, but we should not crash the entire
      // application if audio fails to initialize. The workout can proceed without sound.
    }
  } else {
    console.log(`AudioContext is already in state: '${context.state}'. No action needed.`);
  }
};


/**
 * Decodes and plays a sound. It's a "fire-and-forget" function.
 * @param soundId A unique identifier for the sound, used for caching.
 * @param base64Sound The base64-encoded sound data.
 */
const playAudio = (soundId: string, base64Sound: string): void => {
  const context = getAudioContext();

  // Sound cannot be played if the context doesn't exist or isn't running.
  if (!context || context.state !== 'running') {
    console.warn(`Cannot play sound '${soundId}'. AudioContext state is '${context?.state}'.`);
    return;
  }

  const play = (buffer: AudioBuffer) => {
    try {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
    } catch (e) {
        console.error(`Error playing sound '${soundId}':`, e);
    }
  };

  // If the sound has been decoded and cached, play it immediately.
  if (audioBuffers[soundId]) {
    play(audioBuffers[soundId]);
    return;
  }

  // If not cached, fetch, decode, cache, and then play.
  fetch(base64Sound)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(decodedBuffer => {
      audioBuffers[soundId] = decodedBuffer;
      play(decodedBuffer);
    })
    .catch(e => console.error(`Failed to decode or play sound '${soundId}':`, e));
};


/**
 * Plays the predefined chime sound. Used for timer warnings.
 */
export const playChime = () => playAudio('chime', chimeSound);

/**
 * Plays the predefined buzzer sound. Used for timer completion.
 */
export const playBuzzer = () => playAudio('buzzer', buzzerSound);
