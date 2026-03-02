import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
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

function formatCoordinates(coords) {
  if (!coords) {
    return "Location unavailable";
  }

  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

function formatPlace(geocode, coords) {
  if (geocode) {
    const parts = [
      geocode.name,
      geocode.street,
      geocode.district,
      geocode.city,
      geocode.region
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.slice(0, 2).join(", ");
    }
  }

  return `Current area · ${formatCoordinates(coords)}`;
}

export default function App() {
  const [coords, setCoords] = useState(null);
  const [placeLabel, setPlaceLabel] = useState("Locating you...");
  const [coordinateLabel, setCoordinateLabel] = useState("Waiting for GPS fix");
  const [locationMeta, setLocationMeta] = useState("Requesting location permission");

  useEffect(() => {
    let active = true;
    let browserWatchId = null;

    async function resolvePlace(nextCoords, sourceLabel) {
      if (!active) {
        return;
      }

      setCoords(nextCoords);
      setCoordinateLabel(formatCoordinates(nextCoords));
      setLocationMeta(sourceLabel);
      setPlaceLabel("Resolving address...");

      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: nextCoords.latitude,
          longitude: nextCoords.longitude
        });

        if (!active) {
          return;
        }

        setPlaceLabel(formatPlace(geocode, nextCoords));
      } catch {
        if (!active) {
          return;
        }

        setPlaceLabel(`Current area · ${formatCoordinates(nextCoords)}`);
      }
    }

    function loadBrowserLocation() {
      if (!navigator.geolocation) {
        setPlaceLabel("Location unavailable");
        setCoordinateLabel("No coordinate data available");
        setLocationMeta("Browser geolocation is not supported");
        return;
      }

      browserWatchId = navigator.geolocation.watchPosition(
        (position) => {
          resolvePlace(position.coords, "Browser GPS live");
        },
        () => {
          if (!active) {
            return;
          }

          setPlaceLabel("Location permission needed");
          setCoordinateLabel("Enable browser location access");
          setLocationMeta("Allow browser location access to show nearby trucks accurately");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    }

    async function loadLocation() {
      if (Platform.OS === "web") {
        loadBrowserLocation();
        return;
      }

      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!active) {
          return;
        }

        if (permission.status !== "granted") {
          setPlaceLabel("Location permission needed");
          setCoordinateLabel("Enable device location access");
          setLocationMeta("Enable location access to show nearby trucks accurately");
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });

        resolvePlace(currentPosition.coords, "GPS live");
      } catch {
        if (!active) {
          return;
        }

        setPlaceLabel("Location unavailable");
        setCoordinateLabel("Could not determine coordinates");
        setLocationMeta("Could not determine your current location");
      }
    }

    loadLocation();

    return () => {
      active = false;
      if (browserWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(browserWatchId);
      }
    };
  }, []);

  const locationSummary = useMemo(() => {
    if (!coords) {
      return "Showing truck preview data until live location is available";
    }

    return `Showing online trucks near ${placeLabel} · ${coordinateLabel}`;
  }, [coords, placeLabel, coordinateLabel]);

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

        <View style={styles.locationCard}>
          <View style={styles.locationIconWrap}>
            <Text style={styles.locationIcon}>◎</Text>
          </View>
          <View style={styles.locationBody}>
            <Text style={styles.locationLabel}>Current location</Text>
            <Text style={styles.locationValue}>{placeLabel}</Text>
            <Text style={styles.coordinateValue}>{coordinateLabel}</Text>
            <Text style={styles.locationMeta}>{locationMeta}</Text>
          </View>
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
            <View style={styles.userLocationLabel}>
              <Text style={styles.userLocationLabelText}>{placeLabel}</Text>
            </View>
            <View style={styles.userDot}>
              <View style={styles.userPulse} />
              <View style={styles.userCore} />
            </View>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapFooterText}>{locationSummary}</Text>
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
    lineHeight: 40,
    marginBottom: 8
  },
  subtitle: {
    color: "#5b554b",
    fontSize: 16,
    lineHeight: 24
  },
  locationCard: {
    backgroundColor: "#fffaf2",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eadfca"
  },
  locationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f6dcc4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  locationIcon: {
    color: "#8f3a21",
    fontSize: 20,
    fontWeight: "700"
  },
  locationBody: {
    flex: 1
  },
  locationLabel: {
    color: "#8b8375",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  locationValue: {
    color: "#1f1d1a",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4
  },
  coordinateValue: {
    color: "#514a41",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6
  },
  locationMeta: {
    color: "#6c655c",
    fontSize: 13,
    marginTop: 4
  },
  mapCard: {
    backgroundColor: "#132a32",
    borderRadius: 30,
    padding: 18,
    marginBottom: 22,
    overflow: "hidden"
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    color: "#f9f4ea",
    fontSize: 20,
    fontWeight: "800"
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#d6532f"
  },
  liveBadgeText: {
    color: "#fff7ee",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1
  },
  mapCanvas: {
    height: 280,
    borderRadius: 24,
    backgroundColor: "#20505d",
    position: "relative",
    overflow: "hidden"
  },
  route: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999
  },
  routeOne: {
    width: 260,
    height: 12,
    top: 90,
    left: -24,
    transform: [{ rotate: "18deg" }]
  },
  routeTwo: {
    width: 240,
    height: 10,
    bottom: 88,
    right: -18,
    transform: [{ rotate: "-22deg" }]
  },
  marker: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f7b24d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff6e8"
  },
  markerOne: {
    top: 56,
    right: 62
  },
  markerTwo: {
    bottom: 72,
    left: 56,
    backgroundColor: "#ff8966"
  },
  markerThree: {
    top: 136,
    left: 142,
    backgroundColor: "#84d2c5"
  },
  markerText: {
    color: "#18323b",
    fontWeight: "900"
  },
  userLocationLabel: {
    position: "absolute",
    top: 172,
    left: 98,
    backgroundColor: "rgba(255, 250, 242, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    maxWidth: 180
  },
  userLocationLabelText: {
    color: "#204654",
    fontSize: 12,
    fontWeight: "700"
  },
  userDot: {
    position: "absolute",
    top: 212,
    left: 124,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  userPulse: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 231, 179, 0.45)"
  },
  userCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffe7b3",
    borderWidth: 2,
    borderColor: "#fff"
  },
  mapFooter: {
    marginTop: 14
  },
  mapFooterText: {
    color: "#c6dfde",
    fontSize: 13,
    lineHeight: 18
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  sectionMeta: {
    color: "#7d7264",
    fontSize: 13,
    fontWeight: "700"
  },
  truckCard: {
    backgroundColor: "#fffaf2",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eadfca"
  },
  truckTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14
  },
  truckName: {
    color: "#1f1d1a",
    fontSize: 18,
    fontWeight: "800"
  },
  truckCuisine: {
    color: "#8b8375",
    fontSize: 14,
    marginTop: 4
  },
  ratingPill: {
    backgroundColor: "#f7b24d",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  ratingText: {
    color: "#503400",
    fontWeight: "900"
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  infoChip: {
    backgroundColor: "#efe4d3",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8
  },
  infoChipText: {
    color: "#5b554b",
    fontSize: 12,
    fontWeight: "700"
  }
});
