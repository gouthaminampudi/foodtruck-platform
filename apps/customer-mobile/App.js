import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import CustomerMap from "./src/components/CustomerMap";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const trucks = [
  { id: "1", name: "Taco Transit", cuisine: "Mexican", eta: "5 min away", distance: "0.8 mi", rating: "4.8", status: "Open now" },
  { id: "2", name: "Curry Current", cuisine: "Indian", eta: "9 min away", distance: "1.4 mi", rating: "4.7", status: "Open now" },
  { id: "3", name: "Green Fork Truck", cuisine: "Vegan", eta: "12 min away", distance: "2.1 mi", rating: "4.9", status: "Open now" }
];

const fallbackCoords = { latitude: 41.8781, longitude: -87.6298 };
const truckOffsets = [
  { latitude: 0.0064, longitude: -0.0042, pinColor: "#d6532f" },
  { latitude: -0.0048, longitude: 0.0071, pinColor: "#f7b24d" },
  { latitude: 0.0032, longitude: 0.0039, pinColor: "#3e9c8f" }
];

function apiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }
  return "http://localhost:8080";
}

function formatCoordinates(coords) {
  if (!coords) return "Location unavailable";
  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

function formatPlace(geocode, coords) {
  if (geocode) {
    const parts = [geocode.name, geocode.street, geocode.district, geocode.city, geocode.region].filter(Boolean);
    if (parts.length > 0) return parts.slice(0, 2).join(", ");
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

const emptyForm = {
  email: "",
  passwordHash: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  preferredCuisines: "",
  isActive: true
};

export default function App() {
  const baseUrl = useMemo(() => apiBaseUrl(), []);

  const [coords, setCoords] = useState(null);
  const [placeLabel, setPlaceLabel] = useState("Locating you...");
  const [coordinateLabel, setCoordinateLabel] = useState("Waiting for GPS fix");
  const [locationMeta, setLocationMeta] = useState("Requesting location permission");

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  useEffect(() => {
    let active = true;
    let browserWatchId = null;

    async function resolvePlace(nextCoords, sourceLabel) {
      if (!active) return;
      setCoords(nextCoords);
      setCoordinateLabel(formatCoordinates(nextCoords));
      setLocationMeta(sourceLabel);
      setPlaceLabel("Resolving address...");

      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: nextCoords.latitude,
          longitude: nextCoords.longitude
        });
        if (!active) return;
        setPlaceLabel(formatPlace(geocode, nextCoords));
      } catch {
        if (!active) return;
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
        (position) => resolvePlace(position.coords, "Browser GPS live"),
        () => {
          if (!active) return;
          setPlaceLabel("Location permission needed");
          setCoordinateLabel("Enable browser location access");
          setLocationMeta("Allow browser location access to show nearby trucks accurately");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }

    async function loadLocation() {
      if (Platform.OS === "web") {
        loadBrowserLocation();
        return;
      }

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (permission.status !== "granted") {
          setPlaceLabel("Location permission needed");
          setCoordinateLabel("Enable device location access");
          setLocationMeta("Enable location access to show nearby trucks accurately");
          return;
        }
        const currentPosition = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        resolvePlace(currentPosition.coords, "GPS live");
      } catch {
        if (!active) return;
        setPlaceLabel("Location unavailable");
        setCoordinateLabel("Could not determine coordinates");
        setLocationMeta("Could not determine your current location");
      }
    }

    loadLocation();
    return () => {
      active = false;
      if (browserWatchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(browserWatchId);
    };
  }, []);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setIsLoadingCustomers(true);
    setErrorText("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/customers`);
      if (!response.ok) {
        throw new Error(`List failed (${response.status})`);
      }
      setCustomers(await response.json());
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsLoadingCustomers(false);
    }
  }

  function selectCustomer(customer) {
    setSelectedUserId(customer.userId);
    setForm({
      email: customer.email ?? "",
      passwordHash: "",
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      phoneNumber: customer.phoneNumber ?? "",
      preferredCuisines: customer.preferredCuisines ?? "",
      isActive: customer.isActive ?? true
    });
  }

  function resetForm() {
    setSelectedUserId(null);
    setForm(emptyForm);
    setErrorText("");
    setSuccessText("");
  }

  async function saveCustomer() {
    if (!form.email || !form.passwordHash) {
      setErrorText("Email and password hash are required.");
      setSuccessText("");
      return;
    }

    setIsSaving(true);
    setErrorText("");
    setSuccessText("");
    try {
      const targetUrl = selectedUserId
        ? `${baseUrl}/api/v1/customers/${selectedUserId}`
        : `${baseUrl}/api/v1/customers`;
      const method = selectedUserId ? "PUT" : "POST";
      const response = await fetch(targetUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Save failed (${response.status}): ${body}`);
      }
      const savedCustomer = await response.json();
      await loadCustomers();
      if (!selectedUserId) {
        resetForm();
        setSuccessText(`Customer created: ${savedCustomer.email}`);
      } else {
        setSuccessText(`Customer updated: ${savedCustomer.email}`);
      }
    } catch (error) {
      setErrorText(error.message);
      setSuccessText("");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCustomer(userId) {
    setIsSaving(true);
    setErrorText("");
    setSuccessText("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/customers/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }
      await loadCustomers();
      setSuccessText("Customer deleted.");
      if (selectedUserId === userId) {
        resetForm();
      }
    } catch (error) {
      setErrorText(error.message);
      setSuccessText("");
    } finally {
      setIsSaving(false);
    }
  }

  const locationSummary = useMemo(
    () => (coords ? `Showing online trucks near ${placeLabel} · ${coordinateLabel}` : "Showing truck preview data until live location is available"),
    [coords, placeLabel, coordinateLabel]
  );

  const mapRegion = useMemo(
    () => ({
      latitude: coords?.latitude ?? fallbackCoords.latitude,
      longitude: coords?.longitude ?? fallbackCoords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03
    }),
    [coords]
  );

  const nearbyTruckMarkers = useMemo(() => buildTruckMarkers(coords ?? fallbackCoords), [coords]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Customer Home</Text>
          <Text style={styles.title}>Discover + Customer CRUD</Text>
          <Text style={styles.subtitle}>Map discovery and customer profile management in one screen.</Text>
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
            <CustomerMap mapRegion={mapRegion} nearbyTruckMarkers={nearbyTruckMarkers} placeLabel={placeLabel} />
          </View>
          <View style={styles.mapFooter}>
            <Text style={styles.mapFooterText}>{locationSummary}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleDark}>Customer CRUD</Text>
          <Text style={styles.sectionMetaDark}>{selectedUserId ? "Editing existing customer" : "Creating new customer"}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.apiHint}>API: {baseUrl}/api/v1/customers</Text>
          <TextInput value={form.email} onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))} placeholder="email" style={styles.input} autoCapitalize="none" />
          <TextInput value={form.passwordHash} onChangeText={(value) => setForm((prev) => ({ ...prev, passwordHash: value }))} placeholder="password hash" style={styles.input} autoCapitalize="none" />
          <TextInput value={form.firstName} onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))} placeholder="first name" style={styles.input} />
          <TextInput value={form.lastName} onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))} placeholder="last name" style={styles.input} />
          <TextInput value={form.phoneNumber} onChangeText={(value) => setForm((prev) => ({ ...prev, phoneNumber: value }))} placeholder="phone number" style={styles.input} />
          <TextInput value={form.preferredCuisines} onChangeText={(value) => setForm((prev) => ({ ...prev, preferredCuisines: value }))} placeholder="preferred cuisines (free text)" style={styles.input} />

          {successText ? <Text style={styles.successText}>{successText}</Text> : null}
          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.buttonPrimary]} onPress={saveCustomer} disabled={isSaving}>
              <Text style={styles.buttonText}>{selectedUserId ? "Update" : "Create"}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={resetForm} disabled={isSaving}>
              <Text style={styles.buttonTextDark}>Clear</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={loadCustomers} disabled={isSaving || isLoadingCustomers}>
              <Text style={styles.buttonTextDark}>Refresh</Text>
            </Pressable>
          </View>
          {isSaving ? <ActivityIndicator style={styles.loader} /> : null}
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Customers</Text>
          {isLoadingCustomers ? <ActivityIndicator style={styles.loader} /> : null}
          {customers.map((customer) => (
            <View key={customer.userId} style={styles.listItem}>
              <View style={styles.listItemBody}>
                <Text style={styles.listItemTitle}>
                  {customer.firstName || "-"} {customer.lastName || "-"}
                </Text>
                <Text style={styles.listItemMeta}>{customer.email}</Text>
                <Text style={styles.listItemMeta}>User ID: {customer.userId}</Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable style={[styles.button, styles.miniButton]} onPress={() => selectCustomer(customer)}>
                  <Text style={styles.buttonTextDark}>Edit</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.miniButtonDanger]} onPress={() => deleteCustomer(customer.userId)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5efe3" },
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  hero: { marginBottom: 18 },
  eyebrow: { color: "#8f3a21", fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 },
  title: { color: "#1f1d1a", fontSize: 30, fontWeight: "800", lineHeight: 36, marginBottom: 8 },
  subtitle: { color: "#5b554b", fontSize: 15, lineHeight: 22 },
  locationCard: { backgroundColor: "#fffaf2", borderRadius: 22, padding: 18, marginBottom: 18, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#eadfca" },
  locationIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f6dcc4", alignItems: "center", justifyContent: "center", marginRight: 14 },
  locationIcon: { color: "#8f3a21", fontSize: 20, fontWeight: "700" },
  locationBody: { flex: 1 },
  locationLabel: { color: "#8b8375", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  locationValue: { color: "#1f1d1a", fontSize: 18, fontWeight: "800", marginTop: 4 },
  coordinateValue: { color: "#514a41", fontSize: 13, fontWeight: "700", marginTop: 6 },
  locationMeta: { color: "#6c655c", fontSize: 13, marginTop: 4 },
  mapCard: { backgroundColor: "#132a32", borderRadius: 30, padding: 18, marginBottom: 22, overflow: "hidden" },
  mapHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { color: "#f9f4ea", fontSize: 20, fontWeight: "800" },
  liveBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#d6532f" },
  liveBadgeText: { color: "#fff7ee", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  mapCanvas: { height: 220, borderRadius: 24, backgroundColor: "#20505d", overflow: "hidden" },
  mapFooter: { marginTop: 14 },
  mapFooterText: { color: "#c6dfde", fontSize: 13, lineHeight: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitleDark: { color: "#1f1d1a", fontSize: 24, fontWeight: "800" },
  sectionMetaDark: { color: "#7d7264", fontSize: 12, fontWeight: "700" },
  formCard: { backgroundColor: "#fffaf2", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#eadfca", marginBottom: 16 },
  apiHint: { color: "#7d7264", fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eadfca", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, color: "#1f1d1a" },
  buttonRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },
  button: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: "#8f3a21" },
  buttonSecondary: { backgroundColor: "#efe4d3" },
  buttonText: { color: "#fffaf2", fontWeight: "800", fontSize: 13 },
  buttonTextDark: { color: "#4f463b", fontWeight: "800", fontSize: 13 },
  loader: { marginTop: 10 },
  successText: {
    color: "#166534",
    fontSize: 12,
    marginBottom: 8,
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  errorText: { color: "#c31919", fontSize: 12, marginTop: 8 },
  listCard: { backgroundColor: "#fffaf2", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#eadfca" },
  listTitle: { color: "#1f1d1a", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  listItem: { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderColor: "#eadfca", borderRadius: 12, padding: 10, marginBottom: 8, gap: 10 },
  listItemBody: { flex: 1 },
  listItemTitle: { color: "#1f1d1a", fontSize: 15, fontWeight: "800" },
  listItemMeta: { color: "#6c655c", fontSize: 12, marginTop: 2 },
  itemActions: { justifyContent: "center", gap: 6 },
  miniButton: { backgroundColor: "#efe4d3", paddingHorizontal: 12, paddingVertical: 8 },
  miniButtonDanger: { backgroundColor: "#d6532f", paddingHorizontal: 12, paddingVertical: 8 }
});
