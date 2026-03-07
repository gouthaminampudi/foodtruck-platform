import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import NotificationBanner from "./src/shared/components/NotificationBanner";
import ProfileMenu from "./src/shared/components/ProfileMenu";
import { getApiBaseUrl, requestJson, buildAuthHeader } from "./src/shared/services/apiClient";
import { useNotifications } from "./src/shared/utils/notifications";
import { hasRole } from "./src/shared/utils/roleGuard";
import { isStrongPassword, isValidEmail } from "./src/shared/utils/validators";
import CustomerMap from "./src/components/CustomerMap";

const ROUTES = {
  ROOT: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  HOME: "/home",
  PROFILE: "/profile",
  EDIT_PROFILE: "/profile/edit"
};

const fallbackCoords = { latitude: 32.9343, longitude: -97.2517 };

const signUpDefaults = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: ""
};

const signInDefaults = { username: "", password: "" };
const profileDefaults = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  preferredCuisines: "",
  profileImageUrl: "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: ""
};

export default function App() {
  const baseUrl = useMemo(() => getApiBaseUrl(), []);
  const { notification, notify } = useNotifications();

  const [route, setRoute] = useState(ROUTES.ROOT);
  const [coords, setCoords] = useState(null);
  const [locationMessage, setLocationMessage] = useState("Resolving location...");
  const [nearbyTrucks, setNearbyTrucks] = useState([]);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [auth, setAuth] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signUpForm, setSignUpForm] = useState(signUpDefaults);
  const [signInForm, setSignInForm] = useState(signInDefaults);
  const [profileForm, setProfileForm] = useState(profileDefaults);
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticatedCustomer = hasRole(auth, "CUSTOMER");

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (coords) {
      loadNearbyTrucks(coords);
    }
  }, [coords]);

  async function loadLocation() {
    try {
      if (Platform.OS === "web" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setLocationMessage("Using browser location");
          },
          () => {
            setCoords(fallbackCoords);
            setLocationMessage("Location permission required");
            notify("error", "Location permission required.");
          }
        );
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setCoords(fallbackCoords);
        setLocationMessage("Location permission required");
        notify("error", "Location permission required.");
        return;
      }
      const currentPosition = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude
      });
      setLocationMessage("Using current GPS location");
    } catch {
      setCoords(fallbackCoords);
      setLocationMessage("Unable to read location");
      notify("error", "Network error. Please try again.");
    }
  }

  async function loadNearbyTrucks(location) {
    setLoadingTrucks(true);
    try {
      const data = await requestJson(
        `${baseUrl}/api/v1/public/trucks/nearby?latitude=${location.latitude}&longitude=${location.longitude}&radiusMeters=12000`
      );
      setNearbyTrucks(data);
      if (data.length === 0) {
        notify("error", "No nearby trucks found.");
      }
    } catch {
      notify("error", "Network error. Please try again.");
    } finally {
      setLoadingTrucks(false);
    }
  }

  async function showMenu(truckId) {
    try {
      const items = await requestJson(`${baseUrl}/api/v1/public/trucks/${truckId}/menu`);
      if (!items.length) {
        Alert.alert("Menu", "No menu items found.");
        return;
      }
      const preview = items
        .slice(0, 8)
        .map((item) => `${item.itemName} - $${(item.priceCents / 100).toFixed(2)}`)
        .join("\n");
      Alert.alert("Menu", preview);
    } catch {
      notify("error", "Network error. Please try again.");
    }
  }

  function validateSignUp() {
    if (
      !signUpForm.firstName ||
      !signUpForm.lastName ||
      !signUpForm.username ||
      !signUpForm.email ||
      !signUpForm.phoneNumber ||
      !signUpForm.password ||
      !signUpForm.confirmPassword
    ) {
      notify("error", "This field is required.");
      return false;
    }
    if (!isValidEmail(signUpForm.email)) {
      notify("error", "Email format is invalid.");
      return false;
    }
    if (!isStrongPassword(signUpForm.password)) {
      notify("error", "Password must meet minimum requirements.");
      return false;
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      notify("error", "Passwords do not match.");
      return false;
    }
    return true;
  }

  async function onSignUp() {
    if (!validateSignUp()) {
      return;
    }
    setSubmitting(true);
    try {
      await requestJson(`${baseUrl}/api/v1/auth/customer/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpForm)
      });
      setSignUpForm(signUpDefaults);
      setRoute(ROUTES.SIGNIN);
      notify("success", "Account created successfully.");
    } catch (error) {
      notify("error", error.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSignIn() {
    if (!signInForm.username || !signInForm.password) {
      notify("error", "This field is required.");
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = await requestJson(`${baseUrl}/api/v1/auth/customer/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInForm)
      });
      if (signedIn.role !== "CUSTOMER") {
        notify("error", "Unauthorized access.");
        return;
      }
      setAuth(signedIn);
      setSignInForm(signInDefaults);
      await loadProfile(signedIn);
      setRoute(ROUTES.HOME);
      notify("success", "Login successful.");
    } catch {
      notify("error", "Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadProfile(authState = auth) {
    if (!authState) {
      return;
    }
    try {
      const data = await requestJson(`${baseUrl}/api/v1/customer/profile`, {
        headers: buildAuthHeader(authState)
      });
      setProfile(data);
      setProfileForm({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        preferredCuisines: data.preferredCuisines ?? "",
        profileImageUrl: data.profileImageUrl ?? "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch {
      notify("error", "Unable to update profile.");
    }
  }

  async function onUpdateProfile() {
    if (!isAuthenticatedCustomer) {
      notify("error", "Unauthorized access.");
      return;
    }
    if (!profileForm.email || !isValidEmail(profileForm.email)) {
      notify("error", "Email format is invalid.");
      return;
    }
    if (profileForm.newPassword && !isStrongPassword(profileForm.newPassword)) {
      notify("error", "Password must meet minimum requirements.");
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
      notify("error", "Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await requestJson(`${baseUrl}/api/v1/customer/profile`, {
        method: "PUT",
        headers: {
          ...buildAuthHeader(auth),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileForm)
      });
      await loadProfile();
      setRoute(ROUTES.HOME);
      notify("success", "Profile updated successfully.");
    } catch {
      notify("error", "Unable to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    setAuth(null);
    setProfile(null);
    setMenuOpen(false);
    setRoute(ROUTES.ROOT);
    notify("success", "Changes saved successfully.");
  }

  function renderAuthButtons() {
    return (
      <View style={styles.authButtons}>
        <Pressable style={styles.lightButton} onPress={() => setRoute(ROUTES.SIGNUP)}>
          <Text style={styles.lightButtonText}>Sign Up</Text>
        </Pressable>
        <Pressable style={styles.darkButton} onPress={() => setRoute(ROUTES.SIGNIN)}>
          <Text style={styles.darkButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        {isAuthenticatedCustomer ? (
          <ProfileMenu
            firstName={profile?.firstName}
            imageUrl={profile?.profileImageUrl}
            isOpen={menuOpen}
            onToggle={() => setMenuOpen((value) => !value)}
            onViewProfile={() => { setMenuOpen(false); setRoute(ROUTES.PROFILE); }}
            onEditProfile={() => { setMenuOpen(false); setRoute(ROUTES.EDIT_PROFILE); }}
            onLogout={logout}
          />
        ) : renderAuthButtons()}
        <View>
          <Text style={styles.title}>Customer Home</Text>
          <Text style={styles.subtitle}>{locationMessage}</Text>
        </View>
      </View>
    );
  }

  function renderHome() {
    const mapRegion = {
      latitude: coords?.latitude ?? fallbackCoords.latitude,
      longitude: coords?.longitude ?? fallbackCoords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    };
    const markers = nearbyTrucks.map((truck, index) => ({
      id: truck.truckId,
      name: truck.truckName,
      cuisine: truck.foodCategory,
      eta: "Nearby",
      distance: `${truck.distanceMiles} mi`,
      latitude: truck.latitude,
      longitude: truck.longitude,
      pinColor: index % 2 === 0 ? "#d65f37" : "#1d8c79"
    }));

    return (
      <>
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>Current Location</Text>
          <Text style={styles.meta}>{locationMessage}</Text>
          <Text style={styles.meta}>
            {`Lat ${mapRegion.latitude.toFixed(5)}, Lng ${mapRegion.longitude.toFixed(5)}`}
          </Text>
        </View>
        <View style={styles.mapCard}>
          <CustomerMap mapRegion={mapRegion} nearbyTruckMarkers={markers} placeLabel={locationMessage} />
        </View>
        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Nearby Food Trucks</Text>
          {loadingTrucks ? <ActivityIndicator style={styles.loader} /> : null}
          {!loadingTrucks && nearbyTrucks.length === 0 ? <Text style={styles.meta}>No nearby trucks found.</Text> : null}
          {nearbyTrucks.map((truck) => (
            <View key={truck.truckId} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{truck.truckName}</Text>
                <Text style={styles.meta}>{truck.distanceMiles} mi • {truck.foodCategory}</Text>
              </View>
              <Pressable style={styles.darkButton} onPress={() => showMenu(truck.truckId)}>
                <Text style={styles.darkButtonText}>View Menu</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </>
    );
  }

  function renderSignUp() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Sign Up</Text>
        <TextInput style={styles.input} value={signUpForm.firstName} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, firstName: value }))} placeholder="First Name" />
        <TextInput style={styles.input} value={signUpForm.lastName} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, lastName: value }))} placeholder="Last Name" />
        <TextInput style={styles.input} value={signUpForm.username} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, username: value }))} placeholder="Username" autoCapitalize="none" />
        <TextInput style={styles.input} value={signUpForm.email} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, email: value }))} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} value={signUpForm.phoneNumber} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, phoneNumber: value }))} placeholder="Phone Number" />
        <TextInput style={styles.input} value={signUpForm.password} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, password: value }))} placeholder="Password" secureTextEntry />
        <TextInput style={styles.input} value={signUpForm.confirmPassword} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, confirmPassword: value }))} placeholder="Confirm Password" secureTextEntry />
        <Pressable style={styles.darkButtonWide} onPress={onSignUp} disabled={submitting}>
          <Text style={styles.darkButtonText}>Sign Up</Text>
        </Pressable>
      </View>
    );
  }

  function renderSignIn() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Sign In</Text>
        <TextInput style={styles.input} value={signInForm.username} onChangeText={(value) => setSignInForm((prev) => ({ ...prev, username: value }))} placeholder="Username" autoCapitalize="none" />
        <TextInput style={styles.input} value={signInForm.password} onChangeText={(value) => setSignInForm((prev) => ({ ...prev, password: value }))} placeholder="Password" secureTextEntry />
        <Pressable style={styles.darkButtonWide} onPress={onSignIn} disabled={submitting}>
          <Text style={styles.darkButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  function renderProfile() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Profile</Text>
        <Text style={styles.meta}>Name: {profile?.firstName} {profile?.lastName}</Text>
        <Text style={styles.meta}>Username: {profile?.username}</Text>
        <Text style={styles.meta}>Email: {profile?.email}</Text>
        <Text style={styles.meta}>Phone: {profile?.phoneNumber || "-"}</Text>
      </View>
    );
  }

  function renderEditProfile() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Customer Profile</Text>
        <TextInput style={styles.input} value={profileForm.firstName} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, firstName: value }))} placeholder="First Name" />
        <TextInput style={styles.input} value={profileForm.lastName} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, lastName: value }))} placeholder="Last Name" />
        <TextInput style={styles.input} value={profileForm.email} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, email: value }))} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} value={profileForm.phoneNumber} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, phoneNumber: value }))} placeholder="Phone Number" />
        <TextInput style={styles.input} value={profileForm.profileImageUrl} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, profileImageUrl: value }))} placeholder="Profile Image URL" autoCapitalize="none" />
        <TextInput style={styles.input} value={profileForm.currentPassword} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, currentPassword: value }))} placeholder="Current Password" secureTextEntry />
        <TextInput style={styles.input} value={profileForm.newPassword} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, newPassword: value }))} placeholder="New Password" secureTextEntry />
        <TextInput style={styles.input} value={profileForm.confirmNewPassword} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, confirmNewPassword: value }))} placeholder="Confirm New Password" secureTextEntry />
        <Pressable style={styles.darkButtonWide} onPress={onUpdateProfile} disabled={submitting}>
          <Text style={styles.darkButtonText}>Save</Text>
        </Pressable>
      </View>
    );
  }

  function renderByRoute() {
    if (route === ROUTES.SIGNUP) return renderSignUp();
    if (route === ROUTES.SIGNIN) return renderSignIn();
    if (route === ROUTES.PROFILE) return renderProfile();
    if (route === ROUTES.EDIT_PROFILE) return renderEditProfile();
    return renderHome();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <NotificationBanner notification={notification} />
        {renderHeader()}
        {route !== ROUTES.HOME ? (
          <Pressable style={styles.lightButton} onPress={() => setRoute(ROUTES.HOME)}>
            <Text style={styles.lightButtonText}>Back to Home</Text>
          </Pressable>
        ) : null}
        {renderByRoute()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f6f7f4" },
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { gap: 10 },
  title: { fontSize: 24, fontWeight: "800", color: "#173544" },
  subtitle: { color: "#50616d" },
  authButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  mapCard: { height: 220, borderRadius: 14, overflow: "hidden", backgroundColor: "#102b34" },
  locationCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e1e6ea", borderRadius: 12, padding: 12, gap: 4 },
  locationTitle: { color: "#132731", fontWeight: "700", fontSize: 16 },
  listCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e1e6ea", borderRadius: 12, padding: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#132731" },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e1e6ea", borderRadius: 12, padding: 12, gap: 8 },
  input: { borderWidth: 1, borderColor: "#d2d9df", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#fbfcfd" },
  darkButton: { backgroundColor: "#20445c", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center" },
  darkButtonWide: { backgroundColor: "#20445c", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" },
  darkButtonText: { color: "#fff", fontWeight: "700" },
  lightButton: { backgroundColor: "#e8edf2", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  lightButtonText: { color: "#173544", fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: "#e8edf1", paddingVertical: 8 },
  itemTitle: { color: "#173544", fontWeight: "700" },
  meta: { color: "#5b7280" },
  loader: { marginVertical: 10 }
});
