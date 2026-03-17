import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CustomerMap({ mapRegion, nearbyTruckMarkers = [], placeLabel, theme }) {
  const resolvedTheme = theme ?? {
    mapBg: "#102b34",
    heroGlowA: "rgba(242, 164, 90, 0.22)",
    heroGlowB: "rgba(42, 162, 141, 0.18)",
    heroStatusLabel: "#f3c28c",
    heroStatusValue: "#fff7ed",
    heroBadgeBg: "rgba(255, 244, 231, 0.14)",
    heroBadgeBorder: "rgba(255, 244, 231, 0.18)",
    heroSubtitle: "#c9ddd8",
    heroStatusBg: "rgba(250, 243, 230, 0.1)",
    featurePillBg: "rgba(255, 221, 177, 0.18)",
    accentButton: "#f2a45a",
    heroStatusMeta: "#bed2cd"
  };
  const styles = useMemo(() => createStyles(resolvedTheme), [resolvedTheme]);
  return (
    <View style={styles.mapFallback}>
      <View style={styles.gridOrbA} />
      <View style={styles.gridOrbB} />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.mapEyebrow}>Discovery Canvas</Text>
          <Text style={styles.mapFallbackTitle}>{placeLabel || "Current search zone"}</Text>
        </View>
        <View style={styles.coordBadge}>
          <Text style={styles.coordBadgeText}>
            {mapRegion.latitude.toFixed(2)}, {mapRegion.longitude.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.gridArea}>
        {nearbyTruckMarkers.slice(0, 6).map((marker, index) => (
          <View
            key={marker.id}
            style={[
              styles.pin,
              {
                top: `${18 + (index * 11) % 50}%`,
                left: `${12 + (index * 15) % 68}%`,
                backgroundColor: marker.pinColor
              }
            ]}
          >
            <Text style={styles.pinLabel}>{index + 1}</Text>
          </View>
        ))}
        <View style={styles.centerPulseOuter}>
          <View style={styles.centerPulseInner} />
        </View>
      </View>
      <View style={styles.mapFooter}>
        <Text style={styles.mapFallbackText}>
          Web preview shows a stylized discovery map. Native builds can swap this for full Google Maps rendering.
        </Text>
        <View style={styles.legendRow}>
          <View style={styles.legendPill}>
            <Text style={styles.legendValue}>{nearbyTruckMarkers.length}</Text>
            <Text style={styles.legendLabel}>Spots found</Text>
          </View>
          <View style={styles.legendPill}>
            <Text style={styles.legendValue}>Live</Text>
            <Text style={styles.legendLabel}>Search state</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
  mapFallback: {
    flex: 1,
    backgroundColor: theme.mapBg,
    padding: 18,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  gridOrbA: {
    position: "absolute",
    top: -20,
    right: -10,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: theme.heroGlowA
  },
  gridOrbB: {
    position: "absolute",
    bottom: -30,
    left: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: theme.heroGlowB
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  mapEyebrow: {
    color: theme.heroStatusLabel,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4
  },
  mapFallbackTitle: {
    color: theme.heroStatusValue,
    fontSize: 22,
    fontWeight: "800",
    maxWidth: 220
  },
  coordBadge: {
    backgroundColor: theme.heroBadgeBg,
    borderWidth: 1,
    borderColor: theme.heroBadgeBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  coordBadgeText: {
    color: theme.heroSubtitle,
    fontWeight: "700",
    fontSize: 12
  },
  gridArea: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.heroBadgeBorder,
    backgroundColor: theme.heroStatusBg,
    position: "relative"
  },
  pin: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  pinLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12
  },
  centerPulseOuter: {
    position: "absolute",
    top: "42%",
    left: "46%",
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: theme.featurePillBg,
    alignItems: "center",
    justifyContent: "center"
  },
  centerPulseInner: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: theme.accentButton
  },
  mapFooter: {
    gap: 12
  },
  mapFallbackText: {
    color: theme.heroSubtitle,
    fontSize: 14,
    lineHeight: 21
  },
  legendRow: {
    flexDirection: "row",
    gap: 10
  },
  legendPill: {
    backgroundColor: theme.heroBadgeBg,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 100
  },
  legendValue: {
    color: theme.heroStatusValue,
    fontWeight: "900",
    fontSize: 18
  },
  legendLabel: {
    color: theme.heroStatusMeta,
    fontSize: 12
  }
});
}
