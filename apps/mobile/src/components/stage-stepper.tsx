import type { BundleDto } from "@connoisseur/shared";
import {
  getNextStage,
  STAGE_LABELS,
  STAGE_COLORS,
  PRODUCTION_STAGES,
} from "@connoisseur/shared";
import { View, Text, StyleSheet } from "react-native";

const colors: Record<string, { bg: string; text: string }> = {
  amber: { bg: "#fef3c7", text: "#92400e" },
  blue: { bg: "#dbeafe", text: "#1e40af" },
  purple: { bg: "#ede9fe", text: "#5b21b6" },
  green: { bg: "#dcfce7", text: "#166534" },
};

export function StageStepper({ bundle }: { bundle: BundleDto }) {
  const stages = [...PRODUCTION_STAGES, "COMPLETED" as const];
  const currentIndex = stages.indexOf(bundle.currentStage);

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const colorKey = stage in STAGE_COLORS ? STAGE_COLORS[stage as keyof typeof STAGE_COLORS] : "green";
        const palette = colors[colorKey] ?? colors.green;

        return (
          <View key={stage} style={styles.row}>
            <View
              style={[
                styles.dot,
                isPast && styles.dotPast,
                isCurrent && { backgroundColor: palette.bg, borderColor: palette.text },
              ]}
            >
              <Text style={[styles.dotText, isCurrent && { color: palette.text }]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.labelWrap}>
              <Text style={[styles.label, isCurrent && styles.labelCurrent]}>
                {STAGE_LABELS[stage]}
              </Text>
              {isCurrent && <Text style={styles.currentBadge}>Current</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function getNextAction(bundle: BundleDto) {
  return getNextStage(bundle.currentStage);
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  dotPast: { backgroundColor: "#e2e8f0", borderColor: "#94a3b8" },
  dotText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  labelWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 16, color: "#64748b" },
  labelCurrent: { color: "#0f172a", fontWeight: "700" },
  currentBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
