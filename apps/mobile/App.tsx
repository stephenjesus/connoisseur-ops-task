import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import type { BundleDto } from "@connoisseur/shared";
import { STAGE_LABELS } from "@connoisseur/shared";
import { api, clearToken, getToken, setToken } from "./src/lib/api";
import { getNextAction, StageStepper } from "./src/components/stage-stepper";

type Screen = "login" | "home" | "scan" | "manual" | "bundle";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("operator@demo.com");
  const [password, setPassword] = useState("password123");
  const [manualId, setManualId] = useState("");
  const [bundle, setBundle] = useState<BundleDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    getToken().then((token) => {
      setScreen(token ? "home" : "login");
      setLoading(false);
    });
  }, []);

  const openBundle = useCallback(async (id: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const data = await api.getBundle(id.trim().toUpperCase());
      setBundle(data);
      setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 3));
      setScreen("bundle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bundle not found");
    } finally {
      setSubmitting(false);
    }
  }, []);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await api.login({ email, password });
      await setToken(token);
      setScreen("home");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTransition() {
    if (!bundle) return;
    const next = getNextAction(bundle);
    if (!next) {
      setError("Bundle is already completed");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const updated = await api.transitionBundle(
        bundle.id,
        { toStage: next, fromStage: bundle.currentStage },
        `${bundle.id}-${next}-${Date.now()}`,
      );
      setBundle(updated);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transition failed");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await clearToken();
    setBundle(null);
    setScreen("login");
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (screen === "login") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.loginWrap}
        >
          <View style={styles.brandBadge}>
            <Text style={styles.brandEmoji}>👔</Text>
          </View>
          <Text style={styles.title}>Connoisseur Ops</Text>
          <Text style={styles.subtitle}>Operator floor app</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.primaryBtn} onPress={handleLogin} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (screen === "scan") {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.centered}>
            <Text style={styles.subtitle}>Camera permission required</Text>
            <Pressable style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>Allow camera</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setScreen("home")}>
              <Text style={styles.secondaryBtnText}>Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeDark}>
        <StatusBar style="light" />
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "code39"] }}
          onBarcodeScanned={submitting ? undefined : ({ data }) => openBundle(data)}
        />
        <View style={styles.scanOverlay}>
          <Pressable style={styles.backChip} onPress={() => setScreen("home")}>
            <Text style={styles.backChipText}>← Back</Text>
          </Pressable>
          <Text style={styles.scanHint}>Align bundle barcode in frame</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "manual") {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.title}>Enter Bundle ID</Text>
          <TextInput
            style={styles.input}
            value={manualId}
            onChangeText={setManualId}
            autoCapitalize="characters"
            placeholder="BND-0001"
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            style={styles.primaryBtn}
            onPress={() => openBundle(manualId)}
            disabled={submitting || !manualId.trim()}
          >
            <Text style={styles.primaryBtnText}>Look up bundle</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => setScreen("home")}>
            <Text style={styles.secondaryBtnText}>Back</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "bundle" && bundle) {
    const next = getNextAction(bundle);
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page}>
          <Pressable onPress={() => setScreen("home")}>
            <Text style={styles.backLink}>← Back to home</Text>
          </Pressable>
          <Text style={styles.bundleId}>{bundle.id}</Text>
          <Text style={styles.bundleStyle}>{bundle.style.name}</Text>
          <Text style={styles.bundleMeta}>
            {bundle.style.sku} · {bundle.quantity} pieces
          </Text>
          <View style={styles.card}>
            <StageStepper bundle={bundle} />
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          {next ? (
            <Pressable
              style={styles.primaryBtn}
              onPress={handleTransition}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  Complete {STAGE_LABELS[bundle.currentStage]}
                </Text>
              )}
            </Pressable>
          ) : (
            <View style={styles.doneBanner}>
              <Text style={styles.doneText}>Bundle completed — stock updated</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Floor operator</Text>
            <Text style={styles.title}>Scan bundle</Text>
          </View>
          <Pressable onPress={handleLogout}>
            <Text style={styles.logout}>Sign out</Text>
          </Pressable>
        </View>

        <Pressable style={styles.heroBtn} onPress={() => setScreen("scan")}>
          <Text style={styles.heroBtnEmoji}>📷</Text>
          <Text style={styles.heroBtnText}>Scan Bundle</Text>
          <Text style={styles.heroBtnSub}>Point camera at barcode</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={() => setScreen("manual")}>
          <Text style={styles.secondaryBtnText}>Enter ID manually</Text>
        </Pressable>

        {recent.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent scans</Text>
            {recent.map((id) => (
              <Pressable key={id} style={styles.recentCard} onPress={() => openBundle(id)}>
                <Text style={styles.recentId}>{id}</Text>
                <Text style={styles.recentAction}>Open →</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  safeDark: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loginWrap: { flex: 1, justifyContent: "center", padding: 24 },
  page: { padding: 20, gap: 16 },
  brandBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brandEmoji: { fontSize: 32 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 24 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#334155", fontSize: 16, fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  hello: { color: "#64748b", fontSize: 14 },
  logout: { color: "#4f46e5", fontWeight: "600" },
  heroBtn: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  heroBtnEmoji: { fontSize: 40 },
  heroBtnText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  heroBtnSub: { color: "#94a3b8", fontSize: 14 },
  recentSection: { marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#64748b", marginBottom: 8 },
  recentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  recentId: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontWeight: "700" },
  recentAction: { color: "#4f46e5", fontWeight: "600" },
  camera: { flex: 1 },
  scanOverlay: { position: "absolute", top: 60, left: 20, right: 20 },
  backChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backChipText: { color: "#fff", fontWeight: "600" },
  scanHint: { color: "#fff", marginTop: 20, textAlign: "center", fontSize: 16 },
  backLink: { color: "#4f46e5", fontWeight: "600", marginBottom: 8 },
  bundleId: { fontSize: 32, fontWeight: "800", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  bundleStyle: { fontSize: 20, fontWeight: "600", color: "#0f172a" },
  bundleMeta: { color: "#64748b", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  doneBanner: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 16,
  },
  doneText: { color: "#166534", fontWeight: "700", textAlign: "center" },
});
