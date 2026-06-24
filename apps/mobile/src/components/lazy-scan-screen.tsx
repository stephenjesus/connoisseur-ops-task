import { useEffect, useState, type ComponentType } from "react";
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from "react-native";

type ScanScreenProps = {
  submitting: boolean;
  onScan: (data: string) => void;
  onBack: () => void;
};

export function LazyScanScreen(props: ScanScreenProps) {
  const [Screen, setScreen] = useState<ComponentType<ScanScreenProps> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    import("../screens/scan-screen")
      .then((m) => setScreen(() => m.ScanScreen))
      .catch((e) =>
        setLoadError(e instanceof Error ? e.message : "Camera failed to load"),
      );
  }, []);

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{loadError}</Text>
        <Text style={styles.hint}>Use “Enter ID manually” on the home screen.</Text>
        <Pressable style={styles.btn} onPress={props.onBack}>
          <Text style={styles.btnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!Screen) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return <Screen {...props} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  error: { color: "#fca5a5", textAlign: "center", marginBottom: 12 },
  hint: { color: "#94a3b8", textAlign: "center", marginBottom: 24 },
  btn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
