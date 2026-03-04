import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CustomerMap() {
  return (
    <View style={styles.mapFallback}>
      <Text style={styles.mapFallbackTitle}>Google Maps is enabled on native builds</Text>
      <Text style={styles.mapFallbackText}>
        Run the customer app on iOS or Android with a Google Maps API key to
        see the live map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  mapFallbackTitle: {
    color: "#fff7ee",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10
  },
  mapFallbackText: {
    color: "#c6dfde",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center"
  }
});
