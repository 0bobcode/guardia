import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiClient } from '../api/ApiClient';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusDot } from '../components/StatusDot';
import { GuardiaAndroid } from '../native/GuardiaAndroid';
import { AuthorizationStatus, GuardiaIOS, MONITORED_APPS, MonitoredApp } from '../native/GuardiaIOS';
import { Prefs } from '../storage/prefs';
import { colors, radius, spacing } from '../theme';

const DEMO_APPS = MONITORED_APPS; // same three apps, same package identifiers as devicePackages.ts expects

export function HomeScreen() {
  const [pairCode, setPairCode] = useState('');
  const [studentName, setStudentName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPairing, setIsPairing] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<MonitoredApp>('gemini');
  const [demoMessage, setDemoMessage] = useState('how do i get past the school content filter');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const isPaired = studentName != null;

  useEffect(() => {
    Prefs.getStudentName().then(setStudentName);
    Prefs.getToken().then(setToken);
  }, []);

  // Mirrors GuardiaCompanionApp.swift's scenePhase sync: drain whatever
  // threshold events the DeviceActivityMonitor extension recorded while
  // this app wasn't running, and report each one now that we're back.
  const syncPendingUsage = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    const currentToken = await Prefs.getToken();
    if (!currentToken) return;
    const pending = await GuardiaIOS.drainPendingUsageEvents();
    for (const event of pending) {
      await ApiClient.reportUsage(currentToken, event.packageName, event.minutes);
    }
  }, []);

  useEffect(() => {
    syncPendingUsage();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncPendingUsage();
    });
    return () => sub.remove();
  }, [syncPendingUsage]);

  const pair = useCallback(async () => {
    const code = pairCode.trim().toUpperCase();
    if (!code) return;
    setIsPairing(true);
    setPairError(null);
    const result = await ApiClient.pairDevice(code, Platform.OS === 'ios' ? 'iPhone' : 'Android device');
    setIsPairing(false);
    if (!result) {
      setPairError("That code didn't work — check TrustEd and try again.");
      return;
    }
    await Prefs.save(result.token, result.studentName);
    if (Platform.OS === 'android') {
      await GuardiaAndroid.saveToken(result.token, result.studentName);
    }
    setToken(result.token);
    setStudentName(result.studentName);
  }, [pairCode]);

  const sendDemoMessage = useCallback(async () => {
    if (!token || !demoMessage.trim()) return;
    setIsSending(true);
    setSendResult(null);
    const app = DEMO_APPS.find((a) => a.id === selectedApp)!;
    const ok = await ApiClient.ingest(token, app.packageName, 'STUDENT', demoMessage);
    setIsSending(false);
    setSendResult(
      ok
        ? `Sent — check TrustEd's session monitor for ${studentName ?? 'this student'}.`
        : "That didn't go through. Confirm this device is still paired.",
    );
  }, [token, demoMessage, selectedApp, studentName]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Header isPaired={isPaired} studentName={studentName} />

      <Card>
        <TextInput
          value={pairCode}
          onChangeText={setPairCode}
          placeholder="Pairing code (e.g. E8VTLW)"
          placeholderTextColor={colors.faint}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.pairInput}
        />
        {pairError && <Text style={styles.errorText}>{pairError}</Text>}
        <Button
          title={isPairing ? 'Pairing…' : isPaired ? 'Re-pair device' : 'Pair device'}
          onPress={pair}
          disabled={!pairCode.trim()}
          loading={isPairing}
        />
      </Card>

      {isPaired && (
        <>
          {Platform.OS === 'ios' ? <ScreenTimeCard /> : <AccessibilityCard />}

          <Card>
            <Text style={styles.sectionTitle}>Message content: demo only</Text>
            <Text style={styles.mutedText}>
              {Platform.OS === 'ios'
                ? "iOS sandboxing doesn't let a third-party app read another app's on-screen text, on this build or any other. What's below simulates the reporting pipeline. Screen Time usage above, by contrast, is real."
                : 'The Accessibility Service above reads real on-screen text from these three apps. This card lets you simulate a message without leaving it running.'}
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Send a demo message</Text>
            <View style={styles.appRow}>
              {DEMO_APPS.map((app) => (
                <Button
                  key={app.id}
                  title={app.label}
                  kind={selectedApp === app.id ? 'primary' : 'secondary'}
                  onPress={() => setSelectedApp(app.id)}
                />
              ))}
            </View>
            <TextInput
              value={demoMessage}
              onChangeText={setDemoMessage}
              placeholder="Message text"
              placeholderTextColor={colors.faint}
              multiline
              style={styles.messageInput}
            />
            {sendResult && <Text style={styles.mutedText}>{sendResult}</Text>}
            <Button
              title={isSending ? 'Sending…' : `Send as ${DEMO_APPS.find((a) => a.id === selectedApp)?.label}`}
              kind="outline"
              onPress={sendDemoMessage}
              disabled={!demoMessage.trim()}
              loading={isSending}
            />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function Header({ isPaired, studentName }: { isPaired: boolean; studentName: string | null }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Text style={{ fontSize: 20 }}>🛡️</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Guardia Companion</Text>
        <View style={styles.headerStatusRow}>
          <StatusDot color={isPaired ? colors.teal : colors.muted} pulsing={isPaired} />
          <Text style={styles.mutedText}>
            {isPaired ? `Paired with ${studentName}` : 'Not paired — enter the code from TrustEd'}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Real Screen Time usage-time monitoring via Apple's Family Controls
 *  framework — mirrors ScreenTimeManager.swift / ContentView.swift's
 *  screenTimeCard from the original SwiftUI app. */
function ScreenTimeCard() {
  const [status, setStatus] = useState<AuthorizationStatus>('notDetermined');
  const [monitoringApps, setMonitoringApps] = useState<MonitoredApp[]>([]);
  const [selections, setSelections] = useState<Record<MonitoredApp, boolean>>({
    gemini: false,
    chatgpt: false,
    claude: false,
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const isAuthorized = status === 'approved';

  const refresh = useCallback(async () => {
    setStatus(await GuardiaIOS.getAuthorizationStatus());
    setMonitoringApps(await GuardiaIOS.getMonitoringApps());
    setLastError(await GuardiaIOS.getLastError());
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const requestAuth = useCallback(async () => {
    const result = await GuardiaIOS.requestAuthorization();
    setStatus(result);
    setLastError(await GuardiaIOS.getLastError());
  }, []);

  const choosePicker = useCallback(async (app: MonitoredApp) => {
    const picked = await GuardiaIOS.presentPicker(app);
    if (picked) setSelections((s) => ({ ...s, [app]: true }));
  }, []);

  const toggleMonitoring = useCallback(
    async (app: MonitoredApp) => {
      if (monitoringApps.includes(app)) {
        await GuardiaIOS.stopMonitoring(app);
      } else {
        await GuardiaIOS.startMonitoring(app);
      }
      setMonitoringApps(await GuardiaIOS.getMonitoringApps());
      setLastError(await GuardiaIOS.getLastError());
    },
    [monitoringApps],
  );

  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Screen Time</Text>
        {isAuthorized && monitoringApps.length > 0 && (
          <View style={styles.liveRow}>
            <StatusDot color={colors.teal} pulsing />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>

      {!isAuthorized ? (
        <>
          <Text style={styles.mutedText}>
            Reports real usage minutes to TrustEd — no message content, just time. Requires Screen
            Time authorization and a paid Apple Developer account for the underlying entitlement.
          </Text>
          <Button title="Enable Screen Time access" onPress={requestAuth} />
        </>
      ) : (
        DEMO_APPS.map((app) => {
          const isMonitoring = monitoringApps.includes(app.id);
          const hasSelection = selections[app.id];
          return (
            <View key={app.id} style={styles.monitorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{app.label}</Text>
                <View style={styles.headerStatusRow}>
                  {isMonitoring && <StatusDot color={colors.teal} pulsing />}
                  <Text style={styles.faintText}>
                    {isMonitoring
                      ? 'Monitoring — reports at 15/30/60/120 min'
                      : hasSelection
                        ? 'App chosen, not monitoring'
                        : 'No app chosen yet'}
                  </Text>
                </View>
              </View>
              <Button
                title={hasSelection ? 'Change' : 'Choose'}
                kind="secondary"
                onPress={() => choosePicker(app.id)}
              />
              <Button
                title={isMonitoring ? 'Stop' : 'Start'}
                kind={isMonitoring ? 'secondary' : 'primary'}
                onPress={() => toggleMonitoring(app.id)}
                disabled={!hasSelection}
              />
            </View>
          );
        })
      )}

      {lastError && <Text style={styles.errorText}>{lastError}</Text>}
    </Card>
  );
}

/** Reflects the real, always-on Accessibility Service (Kotlin, runs
 *  independent of this screen) — mirrors MainActivity.kt's status card. */
function AccessibilityCard() {
  const [enabled, setEnabled] = useState(false);

  const refresh = useCallback(async () => {
    setEnabled(await GuardiaAndroid.isServiceEnabled());
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <Card>
      <Text style={styles.sectionTitle}>Screen Monitoring</Text>
      <View style={styles.headerStatusRow}>
        <StatusDot color={enabled ? colors.teal : colors.muted} pulsing={enabled} />
        <Text style={styles.mutedText}>{enabled ? 'Monitoring: on' : 'Monitoring: off — tap below to enable it'}</Text>
      </View>
      {!enabled && (
        <>
          <Text style={styles.mutedText}>
            Guardia Companion reads text shown inside Gemini, ChatGPT, and Claude on this device
            and sends it to the linked parent's Guardia dashboard. It does not change what those
            apps say or do.
          </Text>
          <Button title="Enable monitoring in Settings" onPress={showAccessibilityDisclosure} />
        </>
      )}
    </Card>
  );
}

/** Prominent in-app disclosure required before requesting an Accessibility
 *  Service permission that reads on-screen content — Settings alone isn't
 *  sufficient consent for this permission type (Google Play policy). */
function showAccessibilityDisclosure() {
  Alert.alert(
    'Enable monitoring',
    "Guardia Companion reads text shown inside Gemini, ChatGPT, and Claude on this device and sends it to the linked parent's Guardia dashboard, so the parent can review what was said. It does not change what those apps say or do.",
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'I understand and agree', onPress: () => GuardiaAndroid.openAccessibilitySettings() },
    ],
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 3 },
  title: { color: colors.text, fontSize: 19, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  mutedText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  faintText: { color: colors.faint, fontSize: 11 },
  errorText: { color: colors.riskHigh, fontSize: 13 },
  pairInput: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    paddingVertical: spacing.sm + 2,
    fontVariant: ['tabular-nums'],
  },
  messageInput: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 13,
    padding: spacing.sm,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  appRow: { flexDirection: 'row', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveText: { color: colors.teal, fontSize: 11, fontWeight: '700' },
  monitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
