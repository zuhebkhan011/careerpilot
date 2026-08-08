/**
 * Capacitor & Native Service Abstraction Layer
 * Allows smooth transition when wrapping this React application into
 * native iOS / Android apps using Capacitor.
 */

export interface NativeCapacitorInfo {
  isNative: boolean;
  platform: 'web' | 'android' | 'ios';
  hasCameraSupport: boolean;
  hasPushNotifications: boolean;
  hasHaptics: boolean;
  hasFileSystem: boolean;
  appVersion: string;
}

export const capacitorService = {
  /**
   * Check if running in a Capacitor / Native container or standard Web PWA
   */
  getInfo(): NativeCapacitorInfo {
    const isCapacitorWindow = typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).Capacitor;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    return {
      isNative: isCapacitorWindow,
      platform: isCapacitorWindow ? (isAndroid ? 'android' : isIOS ? 'ios' : 'web') : 'web',
      hasCameraSupport: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
      hasPushNotifications: typeof window !== 'undefined' && 'Notification' in window,
      hasHaptics: typeof navigator !== 'undefined' && !!navigator.vibrate,
      hasFileSystem: typeof window !== 'undefined' && !!window.showOpenFilePicker,
      appVersion: '1.0.0'
    };
  },

  /**
   * Trigger haptic vibration for touch feedback
   */
  triggerHaptic(pattern: number | number[] = 15): void {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignored if not supported
    }
  },

  /**
   * Share content via Native Share sheet or Web Share API
   */
  async shareContent(title: string, text: string, url?: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url: url || window.location.href });
        return true;
      } else {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url || ''}`);
        return false;
      }
    } catch {
      return false;
    }
  },

  /**
   * Check online/offline network status
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
};
