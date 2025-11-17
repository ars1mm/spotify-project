// Howler-based browser playback utilities.
// Guards against SSR: no-ops on the server.

const isBrowser = typeof window !== 'undefined';

let HowlCtor: any = null;
let howl: any = null;
let currentSrc: string | null = null;

const ensureHowlCtor = () => {
  if (!isBrowser) return null;
  if (HowlCtor) return HowlCtor;
  try {
    // Load howler at runtime to avoid SSR import issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('howler');
    HowlCtor = mod?.Howl ?? mod?.default?.Howl ?? mod;
  } catch (e) {
    // If howler isn't installed or fails, gracefully degrade
    // Consumers should ensure dependency is installed.
    // eslint-disable-next-line no-console
    console.warn('Howler could not be loaded', e);
    return null;
  }
  return HowlCtor;
};

export const initAudio = (src?: string, opts?: { autoplay?: boolean; volume?: number }) => {
  if (!isBrowser) return null;
  const H = ensureHowlCtor();
  if (!H) return null;
  if (howl) {
    try { howl.unload(); } catch { }
    howl = null;
    currentSrc = null;
  }
  howl = new H({
    src: src ? [src] : [],
    html5: true,
    autoplay: opts?.autoplay ?? false,
    volume: typeof opts?.volume === 'number' ? opts!.volume : 1,
  });
  if (src) currentSrc = src;
  return howl;
};

export const setSource = (src: string) => {
  if (!isBrowser) return;
  if (!howl) {
    initAudio(src);
    return;
  }
  if (currentSrc !== src) {
    try { howl.unload(); } catch { }
    initAudio(src);
  }
};

export const playSong = async (src?: string) => {
  if (!isBrowser) return false;
  if (src) setSource(src);
  if (!howl) return false;
  try {
    howl.play();
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('playSong failed', err);
    return false;
  }
};

export const pause = () => {
  if (!isBrowser || !howl) return;
  try { howl.pause(); } catch { }
};

export const stop = () => {
  if (!isBrowser || !howl) return;
  try { howl.stop(); } catch { }
};

export const setVolume = (value: number) => {
  if (!isBrowser || !howl) return;
  const v = Math.max(0, Math.min(1, value));
  try { howl.volume(v); } catch { }
};

export const seek = (time: number) => {
  if (!isBrowser || !howl) return;
  const t = Math.max(0, time);
  try { howl.seek(t); } catch { }
};

export const onEnded = (cb: () => void) => {
  if (!isBrowser || !howl) return;
  try {
    if (typeof howl.off === 'function') howl.off('end');
    howl.on('end', cb);
  } catch { }
};

export const getCurrentTime = () => (isBrowser && howl ? howl.seek() : 0);
export const getDuration = () => (isBrowser && howl ? howl.duration() || 0 : 0);
export const isPlaying = () => (isBrowser && howl ? howl.playing() : false);

export const getAudioInstance = () => (isBrowser ? howl : null);

export default {
  initAudio,
  setSource,
  playSong,
  pause,
  stop,
  setVolume,
  seek,
  onEnded,
  getCurrentTime,
  getDuration,
  isPlaying,
  getAudioInstance,
};
