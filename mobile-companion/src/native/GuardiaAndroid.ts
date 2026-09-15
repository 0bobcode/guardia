import { NativeModules, Platform } from 'react-native';

/** Bridges to android/app/src/main/java/com/guardia/companion/
 *  GuardiaAccessibilityModule.kt. The actual on-screen text reading still
 *  happens entirely in MonitorAccessibilityService.kt, independent of this
 *  JS thread — this module only lets the UI show/change pairing &
 *  permission state, mirroring the native app's MainActivity.kt. */
type GuardiaAccessibilityNative = {
  isServiceEnabled(): Promise<boolean>;
  openAccessibilitySettings(): void;
  saveToken(token: string, studentName: string): Promise<void>;
  clearToken(): Promise<void>;
};

const native: GuardiaAccessibilityNative | undefined = NativeModules.GuardiaAccessibility;

export const GuardiaAndroid = {
  available: Platform.OS === 'android' && native != null,

  async isServiceEnabled(): Promise<boolean> {
    if (!native) return false;
    return native.isServiceEnabled();
  },

  openAccessibilitySettings(): void {
    native?.openAccessibilitySettings();
  },

  /** Mirrors the token into the AccessibilityService's own native storage
   *  (Prefs.kt) so it can keep reporting even if this JS app isn't running. */
  async saveToken(token: string, studentName: string): Promise<void> {
    await native?.saveToken(token, studentName);
  },

  async clearToken(): Promise<void> {
    await native?.clearToken();
  },
};
