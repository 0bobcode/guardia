import { NativeModules, Platform } from 'react-native';

export type MonitoredApp = 'gemini' | 'chatgpt' | 'claude';
export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved' | 'unknown';
export type PendingUsageEvent = { packageName: string; minutes: number };

/** Bridges to ios/GuardiaCompanion/GuardiaScreenTime.swift, which wraps
 *  Apple's FamilyControls/DeviceActivity frameworks (ScreenTimeManager.swift
 *  in the original SwiftUI app). The FamilyActivityPicker is a native
 *  system UI Apple doesn't expose to JS, so `presentPicker` presents it
 *  natively and resolves once the parent dismisses it. */
type GuardiaScreenTimeNative = {
  getAuthorizationStatus(): Promise<AuthorizationStatus>;
  requestAuthorization(): Promise<AuthorizationStatus>;
  presentPicker(app: MonitoredApp): Promise<boolean>;
  hasSelection(app: MonitoredApp): Promise<boolean>;
  startMonitoring(app: MonitoredApp): Promise<boolean>;
  stopMonitoring(app: MonitoredApp): Promise<void>;
  getMonitoringApps(): Promise<MonitoredApp[]>;
  getLastError(): Promise<string | null>;
  drainPendingUsageEvents(): Promise<PendingUsageEvent[]>;
};

const native: GuardiaScreenTimeNative | undefined = NativeModules.GuardiaScreenTime;

export const GuardiaIOS = {
  available: Platform.OS === 'ios' && native != null,

  async getAuthorizationStatus(): Promise<AuthorizationStatus> {
    if (!native) return 'unknown';
    return native.getAuthorizationStatus();
  },
  async requestAuthorization(): Promise<AuthorizationStatus> {
    if (!native) return 'unknown';
    return native.requestAuthorization();
  },
  async presentPicker(app: MonitoredApp): Promise<boolean> {
    if (!native) return false;
    return native.presentPicker(app);
  },
  async hasSelection(app: MonitoredApp): Promise<boolean> {
    if (!native) return false;
    return native.hasSelection(app);
  },
  async startMonitoring(app: MonitoredApp): Promise<boolean> {
    if (!native) return false;
    return native.startMonitoring(app);
  },
  async stopMonitoring(app: MonitoredApp): Promise<void> {
    await native?.stopMonitoring(app);
  },
  async getMonitoringApps(): Promise<MonitoredApp[]> {
    if (!native) return [];
    return native.getMonitoringApps();
  },
  async getLastError(): Promise<string | null> {
    if (!native) return null;
    return native.getLastError();
  },
  /** Drains threshold events the DeviceActivityMonitor extension recorded
   *  into the shared App Group container while this app wasn't running. */
  async drainPendingUsageEvents(): Promise<PendingUsageEvent[]> {
    if (!native) return [];
    return native.drainPendingUsageEvents();
  },
};

export const MONITORED_APPS: { id: MonitoredApp; label: string; packageName: string }[] = [
  { id: 'gemini', label: 'Gemini', packageName: 'com.google.android.apps.bard' },
  { id: 'chatgpt', label: 'ChatGPT', packageName: 'com.openai.chatgpt' },
  { id: 'claude', label: 'Claude', packageName: 'com.anthropic.claude' },
];
