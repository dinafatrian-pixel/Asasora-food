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
      volume: 0.8,
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
    volume: 0.8,
  };
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

/**
 * Synthesizes a loud, crisp, pleasant dual-burst phone bell/chime using Web Audio API.
 * Does not depend on external MP3/WAV files, works on Android, iOS, Windows, Mac, Linux.
 */
export const playNotificationRingtone = (volume = 0.8) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Pattern: 2 melodic bursts (C6 -> E6 -> G6 -> C7)
    // Ting-ting-ting-TIIING!
    const playBurst = (startTime: number) => {
      const notes = [
        { freq: 880, start: startTime, dur: 0.12 },
        { freq: 1108.73, start: startTime + 0.11, dur: 0.13 },
        { freq: 1318.51, start: startTime + 0.23, dur: 0.15 },
        { freq: 1760.0, start: startTime + 0.37, dur: 0.45 },
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sine with slight triangle harmonics for bell richness
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        const targetGain = Math.max(0.1, Math.min(1.0, volume)) * 0.45;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(targetGain, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    };

    // First burst
    playBurst(now + 0.05);
    // Second burst after 0.85s for unmistakable incoming phone ringtone feel
    playBurst(now + 0.85);
  } catch (err) {
    console.warn('[AudioRingtone] Play error:', err);
  }
};

/**
 * Triggers phone vibration if device supports Vibration API (Android / mobile browsers)
 */
export const vibratePhone = () => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    // 3 distinct vibration pulses
    navigator.vibrate([250, 100, 250, 100, 450]);
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

    // Auto close after 8 seconds
    setTimeout(() => {
      try {
        notif.close();
      } catch (e) {}
    }, 8000);
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
  }, 1000);

  // Stop flashing when user clicks window or changes tab focus
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
