// Utility for Admin Ringtone Alert, Vibration, Web Notifications, and Tab Title Alerts

export interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  browserNotificationEnabled: boolean;
  volume: number; // 0 to 1
}

const SETTINGS_KEY = 'asasora_admin_notification_settings_v1';

export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === 'undefined') {
    return {
      soundEnabled: true,
      vibrationEnabled: true,
      browserNotificationEnabled: true,
      volume: 0.9,
    };
  }
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    soundEnabled: true,
    vibrationEnabled: true,
    browserNotificationEnabled: true,
    volume: 0.9,
  };
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

// Global shared AudioContext
let sharedAudioCtx: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    return null;
  }
};

// Auto-unlock audio on the very first touch/click anywhere on the webpage
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

let activeRingtoneTimer: any = null;

/**
 * Synthesizes a loud, prominent, unmistakable 3-cycle phone bell ringtone
 * Pattern: "Dring-dring-dring! ... Dring-dring-dring! ... Dring-dring-dring!"
 * Works across all browsers and devices without any external audio file dependencies.
 */
export const playNotificationRingtone = (volume = 0.9) => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const effectiveVol = Math.max(0.2, Math.min(1.0, volume));

    // Play a single bright, melodic bell chime burst
    const playChimeBurst = (startTime: number) => {
      // Dual-tone harmonic frequencies for bell richness (High C melody)
      const chords = [
        { freq1: 1046.5, freq2: 2093.0, start: startTime, dur: 0.12 },
        { freq1: 1318.5, freq2: 2637.0, start: startTime + 0.11, dur: 0.13 },
        { freq1: 1567.98, freq2: 3135.96, start: startTime + 0.23, dur: 0.16 },
        { freq1: 2093.0, freq2: 4186.0, start: startTime + 0.38, dur: 0.45 },
      ];

      chords.forEach(({ freq1, freq2, start, dur }) => {
        // Primary oscillator (pure sine)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq1, start);

        gain1.gain.setValueAtTime(0, start);
        gain1.gain.linearRampToValueAtTime(effectiveVol * 0.45, start + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(start);
        osc1.stop(start + dur);

        // Secondary harmonic oscillator (triangle for bright bell attack)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq2, start);

        gain2.gain.setValueAtTime(0, start);
        gain2.gain.linearRampToValueAtTime(effectiveVol * 0.15, start + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.7);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(start);
        osc2.stop(start + dur * 0.7);
      });
    };

    // 3 distinct ringing bursts so nobody can miss it:
    // Ring 1 at 0.05s
    playChimeBurst(now + 0.05);
    // Ring 2 at 1.0s
    playChimeBurst(now + 1.0);
    // Ring 3 at 2.0s
    playChimeBurst(now + 2.0);
  } catch (err) {
    console.warn('[AudioRingtone] Play error:', err);
  }
};

/**
 * Starts continuous ringtone loop that rings every 2.5 seconds until stopped
 */
export const startContinuousRingtone = (volume = 0.9) => {
  stopContinuousRingtone();
  playNotificationRingtone(volume);
  vibratePhone();

  activeRingtoneTimer = setInterval(() => {
    playNotificationRingtone(volume);
    vibratePhone();
  }, 2600);
};

/**
 * Stops continuous ringtone loop
 */
export const stopContinuousRingtone = () => {
  if (activeRingtoneTimer) {
    clearInterval(activeRingtoneTimer);
    activeRingtoneTimer = null;
  }
};

/**
 * Triggers distinct phone vibration sequence (3 long buzzes)
 */
export const vibratePhone = () => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([350, 150, 350, 150, 500]);
  } catch (e) {}
};

/**
 * Requests native browser/OS push notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    if (Notification.permission === 'granted') return 'granted';
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'denied';
  }
};

/**
 * Shows native system notification on screen / phone lockscreen
 */
export const showSystemNotification = (
  title: string,
  body: string,
  onClick?: () => void
) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const options: any = {
      body,
      icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=128&auto=format&fit=crop&q=80',
      badge: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=64&auto=format&fit=crop&q=80',
      tag: 'asasora-new-chat',
      renotify: true,
      requireInteraction: false,
    };
    const notif = new Notification(title, options);

    notif.onclick = () => {
      window.focus();
      onClick?.();
      notif.close();
    };

    setTimeout(() => {
      try {
        notif.close();
      } catch (e) {}
    }, 10000);
  } catch (e) {
    console.warn('[SystemNotification] Error:', e);
  }
};

let titleFlasherInterval: any = null;
let originalDocumentTitle = '';

/**
 * Flashes browser tab title: "(1) 🔔 Chat Baru!" <-> Original Title
 */
export const flashTabTitle = (alertText = '🔔 (1) Chat Baru Masuk!') => {
  if (typeof window === 'undefined') return;

  if (!originalDocumentTitle) {
    originalDocumentTitle = document.title;
  }

  if (titleFlasherInterval) {
    clearInterval(titleFlasherInterval);
  }

  let isAlert = false;
  titleFlasherInterval = setInterval(() => {
    document.title = isAlert ? alertText : originalDocumentTitle;
    isAlert = !isAlert;
  }, 900);

  const stopFlasher = () => {
    if (titleFlasherInterval) {
      clearInterval(titleFlasherInterval);
      titleFlasherInterval = null;
    }
    if (originalDocumentTitle) {
      document.title = originalDocumentTitle;
    }
    window.removeEventListener('focus', stopFlasher);
    window.removeEventListener('click', stopFlasher);
  };

  window.addEventListener('focus', stopFlasher);
  window.addEventListener('click', stopFlasher);
};
