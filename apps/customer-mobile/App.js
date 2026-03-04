import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import CustomerMap from "./src/components/CustomerMap";
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

const fallbackCoords = {
  latitude: 41.8781,
  longitude: -87.6298
};

const truckOffsets = [
  { latitude: 0.0064, longitude: -0.0042, pinColor: "#d6532f" },
  { latitude: -0.0048, longitude: 0.0071, pinColor: "#f7b24d" },
  { latitude: 0.0032, longitude: 0.0039, pinColor: "#3e9c8f" }
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

function buildTruckMarkers(centerCoords) {
  return trucks.map((truck, index) => {
    const offset = truckOffsets[index] ?? truckOffsets[0];

    return {
      ...truck,
      latitude: centerCoords.latitude + offset.latitude,
      longitude: centerCoords.longitude + offset.longitude,
      pinColor: offset.pinColor
    };
  });
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

  const mapRegion = useMemo(
    () => ({
      latitude: coords?.latitude ?? fallbackCoords.latitude,
      longitude: coords?.longitude ?? fallbackCoords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03
    }),
    [coords]
  );

  const nearbyTruckMarkers = useMemo(
    () => buildTruckMarkers(coords ?? fallbackCoords),
    [coords]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
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
            <CustomerMap
              mapRegion={mapRegion}
              nearbyTruckMarkers={nearbyTruckMarkers}
              placeLabel={placeLabel}
            />
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
  scrollView: {
    flex: 1
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
