import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const trucks = [
  {
    id: "1",
    name: "Taco Transit",
    cuisine: "Mexican",
    eta: "5 min away",
    distance: "0.8 mi",
    rating: "4.8",
    status: "Open now"
  },
  {
    id: "2",
    name: "Curry Current",
    cuisine: "Indian",
    eta: "9 min away",
    distance: "1.4 mi",
    rating: "4.7",
    status: "Open now"
  },
  {
    id: "3",
    name: "Green Fork Truck",
    cuisine: "Vegan",
    eta: "12 min away",
    distance: "2.1 mi",
    rating: "4.9",
    status: "Open now"
  }
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Customer Home</Text>
          <Text style={styles.title}>Find food trucks near you</Text>
          <Text style={styles.subtitle}>
            Live map discovery with online trucks matched to your cuisine
            preferences.
          </Text>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Nearby Map</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.mapCanvas}>
            <View style={[styles.route, styles.routeOne]} />
            <View style={[styles.route, styles.routeTwo]} />
            <View style={[styles.marker, styles.markerOne]}>
              <Text style={styles.markerText}>T</Text>
            </View>
            <View style={[styles.marker, styles.markerTwo]}>
              <Text style={styles.markerText}>C</Text>
            </View>
            <View style={[styles.marker, styles.markerThree]}>
              <Text style={styles.markerText}>G</Text>
            </View>
            <View style={styles.userDot}>
              <View style={styles.userPulse} />
              <View style={styles.userCore} />
            </View>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapFooterText}>
              Showing online trucks based on your saved cuisines: Mexican,
              Indian, Vegan
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Trucks</Text>
          <Text style={styles.sectionMeta}>3 online matches</Text>
        </View>

        {trucks.map((truck) => (
          <View key={truck.id} style={styles.truckCard}>
            <View style={styles.truckTopRow}>
              <View>
                <Text style={styles.truckName}>{truck.name}</Text>
                <Text style={styles.truckCuisine}>{truck.cuisine}</Text>
              </View>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>{truck.rating}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>{truck.status}</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>{truck.eta}</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>{truck.distance}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe3"
  },
  container: {
    padding: 20,
    paddingBottom: 48
  },
  hero: {
    marginBottom: 18
  },
  eyebrow: {
    color: "#8f3a21",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8
  },
  title: {
    color: "#1f1d1a",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38
  },
  subtitle: {
    color: "#5c554a",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 480
  },
  mapCard: {
    backgroundColor: "#fffaf1",
    borderRadius: 24,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#eadbc1",
    shadowColor: "#6e4f22",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  sectionTitle: {
    color: "#1f1d1a",
    fontSize: 20,
    fontWeight: "800"
  },
  liveBadge: {
    backgroundColor: "#163d33",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  liveBadgeText: {
    color: "#f5efe3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1
  },
  mapCanvas: {
    position: "relative",
    height: 280,
    backgroundColor: "#d7eadf",
    borderRadius: 20,
    overflow: "hidden"
  },
  route: {
    position: "absolute",
    backgroundColor: "#f3e6ce",
    borderRadius: 999
  },
  routeOne: {
    width: 320,
    height: 20,
    top: 62,
    left: -12,
    transform: [{ rotate: "18deg" }]
  },
  routeTwo: {
    width: 290,
    height: 18,
    top: 162,
    left: 36,
    transform: [{ rotate: "-14deg" }]
  },
  marker: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#c84f2d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff7ea"
  },
  markerOne: {
    top: 48,
    left: 52
  },
  markerTwo: {
    top: 112,
    right: 58
  },
  markerThree: {
    bottom: 40,
    left: 118
  },
  markerText: {
    color: "#fffaf1",
    fontWeight: "900",
    fontSize: 17
  },
  userDot: {
    position: "absolute",
    bottom: 84,
    right: 92,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  userPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(34, 94, 168, 0.24)"
  },
  userCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#225ea8",
    borderWidth: 2,
    borderColor: "#ffffff"
  },
  mapFooter: {
    marginTop: 14
  },
  mapFooterText: {
    color: "#4f4a42",
    fontSize: 13,
    lineHeight: 19
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12
  },
  sectionMeta: {
    color: "#6a6257",
    fontSize: 13,
    fontWeight: "600"
  },
  truckCard: {
    backgroundColor: "#fffaf1",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eadbc1"
  },
  truckTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  truckName: {
    color: "#1f1d1a",
    fontSize: 18,
    fontWeight: "800"
  },
  truckCuisine: {
    color: "#8f3a21",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4
  },
  ratingPill: {
    backgroundColor: "#163d33",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  ratingText: {
    color: "#fffaf1",
    fontSize: 12,
    fontWeight: "800"
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  infoChip: {
    backgroundColor: "#f2e7d1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  infoChipText: {
    color: "#4e473e",
    fontSize: 12,
    fontWeight: "700"
  }
});
