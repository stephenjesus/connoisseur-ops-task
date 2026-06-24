import { CameraView, useCameraPermissions } from "expo-camera";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ScanScreenProps = {
  submitting: boolean;
  onScan: (data: string) => void;
  onBack: () => void;
};

export function ScanScreen({ submitting, onScan, onBack }: ScanScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.subtitle}>Camera permission required</Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Allow camera</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "code39"] }}
        onBarcodeScanned={
          submitting ? undefined : ({ data }) => onScan(data)
        }
      />
      <View style={styles.overlay}>
        <Pressable style={styles.backChip} onPress={onBack}>
          <Text style={styles.backChipText}>← Back</Text>
        </Pressable>
        <Text style={styles.hint}>Align bundle barcode in frame</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  camera: { flex: 1 },
  overlay: { position: "absolute", top: 60, left: 20, right: 20 },
  backChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backChipText: { color: "#fff", fontWeight: "600" },
  hint: { color: "#fff", marginTop: 20, textAlign: "center", fontSize: 16 },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 24 },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "100%",
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
    width: "100%",
  },
  secondaryBtnText: { color: "#334155", fontSize: 16, fontWeight: "600" },
});
