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
const routeTitles = {
  [ROUTES.HOME]: "Find The Next Great Bite",
  [ROUTES.SIGNIN]: "Welcome Back",
  [ROUTES.SIGNUP]: "Create Your Food Run Profile",
  [ROUTES.PROFILE]: "Your Flavor Profile",
  [ROUTES.EDIT_PROFILE]: "Tune Your Preferences"
};
const routeSubtitles = {
  [ROUTES.HOME]: "Track nearby trucks, peek at menus, and keep your favorites within reach.",
  [ROUTES.SIGNIN]: "Jump back into discovery and pick up where you left off.",
  [ROUTES.SIGNUP]: "Save your preferences so the best local finds feel tailored to you.",
  [ROUTES.PROFILE]: "Your account details and saved dining identity in one place.",
  [ROUTES.EDIT_PROFILE]: "Refresh your contact info, password, and profile image anytime."
};
const THEME_OPTIONS = [
  { key: "blueYellow", label: "Blue & Yellow" },
  { key: "blackGrey", label: "Black & Grey" },
  { key: "violetPurple", label: "Violet & Purple" }
];
const THEMES = {
  blueYellow: {
    pageBg: "#f6efe3",
    glowTop: "#ffd3a8",
    glowBottom: "#bddfd2",
    heroBg: "#12343b",
    heroGlowA: "rgba(242, 164, 90, 0.22)",
    heroGlowB: "rgba(42, 162, 141, 0.18)",
    heroBadgeBg: "rgba(255, 244, 231, 0.14)",
    heroBadgeBorder: "rgba(255, 244, 231, 0.18)",
    heroBadgeText: "#f7eddc",
    heroTitle: "#f9f4eb",
    heroSubtitle: "#c9ddd8",
    heroStatusBg: "rgba(250, 243, 230, 0.1)",
    heroStatusBorder: "rgba(250, 243, 230, 0.12)",
    heroStatusLabel: "#f3c28c",
    heroStatusValue: "#fff7ed",
    heroStatusMeta: "#bed2cd",
    cardBg: "#fffdf8",
    cardBorder: "#e7decd",
    softCardBg: "#fff8ef",
    softCardBorder: "#f0dfc6",
    altCardBg: "#edf7f3",
    altCardBorder: "#cfe5dd",
    locationBg: "#fffaf1",
    locationBorder: "#ecdfcb",
    title: "#132731",
    body: "#5f6a70",
    bodyStrong: "#20414b",
    muted: "#5b7280",
    statEyebrow: "#6c675f",
    primaryButton: "#133842",
    primaryButtonText: "#ffffff",
    accentButton: "#f2a45a",
    accentButtonText: "#18323a",
    lightButton: "#f4ead8",
    lightButtonText: "#173544",
    pillBg: "#12343b",
    pillText: "#f9f2e8",
    featureBg: "#173d46",
    featurePillBg: "rgba(255, 221, 177, 0.18)",
    featurePillText: "#ffd8ab",
    featureTitle: "#fff5e8",
    featureSubtitle: "#c9ddd8",
    featureBody: "#dce8e5",
    mapBg: "#102b34",
    mapBorder: "#295059",
    distanceBadgeBg: "#173d46",
    distanceBadgeText: "#fff2de",
    inputBg: "#fffaf1",
    inputBorder: "#d5d7cf",
    successBg: "#ecf8f3",
    successBorder: "#cce7dc",
    errorBg: "#fff1ea",
    errorBorder: "#f2cabd"
  },
  blackGrey: {
    pageBg: "#e8e8e8",
    glowTop: "#d0d0d0",
    glowBottom: "#bcbcbc",
    heroBg: "#171717",
    heroGlowA: "rgba(255, 255, 255, 0.08)",
    heroGlowB: "rgba(120, 120, 120, 0.12)",
    heroBadgeBg: "rgba(255, 255, 255, 0.08)",
    heroBadgeBorder: "rgba(255, 255, 255, 0.12)",
    heroBadgeText: "#f0f0f0",
    heroTitle: "#fafafa",
    heroSubtitle: "#c9c9c9",
    heroStatusBg: "rgba(255, 255, 255, 0.05)",
    heroStatusBorder: "rgba(255, 255, 255, 0.08)",
    heroStatusLabel: "#d8d8d8",
    heroStatusValue: "#ffffff",
    heroStatusMeta: "#b6b6b6",
    cardBg: "#f7f7f7",
    cardBorder: "#d1d1d1",
    softCardBg: "#efefef",
    softCardBorder: "#d7d7d7",
    altCardBg: "#e2e2e2",
    altCardBorder: "#c9c9c9",
    locationBg: "#f2f2f2",
    locationBorder: "#d7d7d7",
    title: "#171717",
    body: "#4f4f4f",
    bodyStrong: "#2f2f2f",
    muted: "#616161",
    statEyebrow: "#676767",
    primaryButton: "#1e1e1e",
    primaryButtonText: "#ffffff",
    accentButton: "#8c8c8c",
    accentButtonText: "#111111",
    lightButton: "#dadada",
    lightButtonText: "#1f1f1f",
    pillBg: "#212121",
    pillText: "#f0f0f0",
    featureBg: "#242424",
    featurePillBg: "rgba(255, 255, 255, 0.08)",
    featurePillText: "#efefef",
    featureTitle: "#ffffff",
    featureSubtitle: "#cdcdcd",
    featureBody: "#d8d8d8",
    mapBg: "#151515",
    mapBorder: "#333333",
    distanceBadgeBg: "#232323",
    distanceBadgeText: "#efefef",
    inputBg: "#fcfcfc",
    inputBorder: "#cfcfcf",
    successBg: "#ececec",
    successBorder: "#d0d0d0",
    errorBg: "#f2e6e6",
    errorBorder: "#d8c3c3"
  },
  violetPurple: {
    pageBg: "#f4ebff",
    glowTop: "#d6b7ff",
    glowBottom: "#bba3ff",
    heroBg: "#3f2461",
    heroGlowA: "rgba(203, 144, 255, 0.26)",
    heroGlowB: "rgba(129, 89, 255, 0.2)",
    heroBadgeBg: "rgba(255, 245, 255, 0.12)",
    heroBadgeBorder: "rgba(255, 245, 255, 0.18)",
    heroBadgeText: "#f7ebff",
    heroTitle: "#fbf5ff",
    heroSubtitle: "#dbcdf2",
    heroStatusBg: "rgba(255, 245, 255, 0.08)",
    heroStatusBorder: "rgba(255, 245, 255, 0.12)",
    heroStatusLabel: "#efbefd",
    heroStatusValue: "#fff7ff",
    heroStatusMeta: "#d6c5f0",
    cardBg: "#fcf8ff",
    cardBorder: "#e4d6f4",
    softCardBg: "#f6efff",
    softCardBorder: "#ddcff0",
    altCardBg: "#efe7ff",
    altCardBorder: "#d4c6ef",
    locationBg: "#faf4ff",
    locationBorder: "#e2d6f0",
    title: "#32184f",
    body: "#675778",
    bodyStrong: "#4b3565",
    muted: "#6c5b81",
    statEyebrow: "#7a688f",
    primaryButton: "#5f3292",
    primaryButtonText: "#ffffff",
    accentButton: "#c56dff",
    accentButtonText: "#2b133f",
    lightButton: "#eadcff",
    lightButtonText: "#42225f",
    pillBg: "#4c2774",
    pillText: "#f7efff",
    featureBg: "#4a2872",
    featurePillBg: "rgba(248, 204, 255, 0.14)",
    featurePillText: "#f7caff",
    featureTitle: "#fff5ff",
    featureSubtitle: "#decdf2",
    featureBody: "#eadcf6",
    mapBg: "#34174f",
    mapBorder: "#5b3383",
    distanceBadgeBg: "#522d80",
    distanceBadgeText: "#f8ebff",
    inputBg: "#fffaff",
    inputBorder: "#d9cde8",
    successBg: "#f2ebff",
    successBorder: "#d8c8f2",
    errorBg: "#fff0fb",
    errorBorder: "#efc9e3"
  }
};
const DEFAULT_THEME_KEY = "blueYellow";

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
  const [themeKey, setThemeKey] = useState("blueYellow");

  const isAuthenticatedCustomer = hasRole(auth, "CUSTOMER");
  const heroTitle = routeTitles[route] ?? routeTitles[ROUTES.HOME];
  const heroSubtitle = routeSubtitles[route] ?? routeSubtitles[ROUTES.HOME];
  const theme = THEMES[themeKey] ?? THEMES[DEFAULT_THEME_KEY];
  const styles = useMemo(() => createStyles(theme), [theme]);

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
      <View style={styles.heroCard}>
        <View style={styles.heroGlowLarge} />
        <View style={styles.heroGlowSmall} />
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>FoodTruck Discover</Text>
          </View>
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
        </View>
        <View style={styles.heroBody}>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>{heroTitle}</Text>
            <Text style={styles.subtitle}>{heroSubtitle}</Text>
            <View style={styles.themeSwitcher}>
              {THEME_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.themeChip,
                    themeKey === option.key ? styles.themeChipActive : null
                  ]}
                  onPress={() => setThemeKey(option.key)}
                >
                  <Text
                    style={[
                      styles.themeChipText,
                      themeKey === option.key ? styles.themeChipTextActive : null
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.heroStatusCard}>
            <Text style={styles.heroStatusLabel}>Live location</Text>
            <Text style={styles.heroStatusValue}>{locationMessage}</Text>
            <Text style={styles.heroStatusMeta}>
              {coords
                ? `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`
                : `${fallbackCoords.latitude.toFixed(3)}, ${fallbackCoords.longitude.toFixed(3)}`}
            </Text>
          </View>
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
    const featuredTruck = nearbyTrucks[0];

    return (
      <>
        <View style={styles.homeGrid}>
          <View style={styles.leftColumn}>
            <View style={styles.statsRow}>
              <View style={styles.statCardWarm}>
                <Text style={styles.statEyebrow}>Nearby now</Text>
                <Text style={styles.statValue}>{nearbyTrucks.length}</Text>
                <Text style={styles.statMeta}>Open trucks in discovery range</Text>
              </View>
              <View style={styles.statCardCool}>
                <Text style={styles.statEyebrow}>Search radius</Text>
                <Text style={styles.statValue}>12 km</Text>
                <Text style={styles.statMeta}>Optimized for quick lunch runs</Text>
              </View>
            </View>
            <View style={styles.locationCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.locationTitle}>Where We’re Looking</Text>
                  <Text style={styles.metaStrong}>{locationMessage}</Text>
                </View>
                <View style={styles.coordPill}>
                  <Text style={styles.coordPillText}>Live Radius</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {`Lat ${mapRegion.latitude.toFixed(5)} • Lng ${mapRegion.longitude.toFixed(5)}`}
              </Text>
            </View>
            {featuredTruck ? (
              <View style={styles.featureCard}>
                <View style={styles.featurePill}>
                  <Text style={styles.featurePillText}>Featured Nearby</Text>
                </View>
                <Text style={styles.featureTitle}>{featuredTruck.truckName}</Text>
                <Text style={styles.featureSubtitle}>
                  {featuredTruck.foodCategory} • {featuredTruck.distanceMiles} mi away
                </Text>
                <Text style={styles.featureBody}>
                  A strong first stop if you want something close, fast, and already within your current search area.
                </Text>
                <Pressable style={styles.accentButtonWide} onPress={() => showMenu(featuredTruck.truckId)}>
                  <Text style={styles.accentButtonText}>Preview Featured Menu</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.listCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Nearby Food Trucks</Text>
                  <Text style={styles.sectionSubtitle}>Browse what’s around you right now.</Text>
                </View>
              </View>
              {loadingTrucks ? <ActivityIndicator style={styles.loader} /> : null}
              {!loadingTrucks && nearbyTrucks.length === 0 ? <Text style={styles.meta}>No nearby trucks found.</Text> : null}
              {nearbyTrucks.map((truck) => (
                <View key={truck.truckId} style={styles.truckCard}>
                  <View style={styles.truckCardTop}>
                    <View style={styles.truckIdentity}>
                      <Text style={styles.itemTitle}>{truck.truckName}</Text>
                      <Text style={styles.meta}>{truck.foodCategory}</Text>
                    </View>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceBadgeText}>{truck.distanceMiles} mi</Text>
                    </View>
                  </View>
                  <Text style={styles.truckCardBody}>
                    Fresh nearby option with fast menu access and a location already pinned on your current map.
                  </Text>
                  <Pressable style={styles.darkButton} onPress={() => showMenu(truck.truckId)}>
                    <Text style={styles.darkButtonText}>View Menu</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.rightColumn}>
            <View style={styles.mapCard}>
              <CustomerMap mapRegion={mapRegion} nearbyTruckMarkers={markers} placeLabel={locationMessage} />
            </View>
            <View style={styles.mapInfoCard}>
              <Text style={styles.mapInfoTitle}>Map-first discovery</Text>
              <Text style={styles.mapInfoBody}>
                Keep the live map visible while you scan trucks, compare distance, and jump into menus without losing spatial context.
              </Text>
            </View>
            <View style={styles.mapInfoCardAlt}>
              <Text style={styles.mapInfoTitle}>Search snapshot</Text>
              <Text style={styles.mapInfoBody}>
                {nearbyTrucks.length
                  ? `${nearbyTrucks.length} nearby options currently plotted around your active location.`
                  : "We’re still scanning for trucks in your active location."}
              </Text>
              <Text style={styles.mapInfoMeta}>{locationMessage}</Text>
            </View>
          </View>
        </View>
      </>
    );
  }

  function renderSignUp() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Sign Up</Text>
        <Text style={styles.sectionSubtitle}>Build a profile for faster discovery and smoother repeat visits.</Text>
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
        <Text style={styles.sectionSubtitle}>Your nearby finds, saved profile, and menu browsing are waiting.</Text>
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
        <Text style={styles.sectionSubtitle}>A quick snapshot of the account you use across the customer experience.</Text>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileLabel}>Name</Text>
          <Text style={styles.profileValue}>{profile?.firstName} {profile?.lastName}</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileLabel}>Username</Text>
          <Text style={styles.profileValue}>{profile?.username}</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileLabel}>Email</Text>
          <Text style={styles.profileValue}>{profile?.email}</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileLabel}>Phone</Text>
          <Text style={styles.profileValue}>{profile?.phoneNumber || "-"}</Text>
        </View>
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
        <View style={styles.pageGlowTop} />
        <View style={styles.pageGlowBottom} />
        <NotificationBanner notification={notification} theme={theme} />
        <View style={styles.contentShell}>
          {renderHeader()}
          {route !== ROUTES.HOME ? (
            <Pressable style={styles.backButton} onPress={() => setRoute(ROUTES.HOME)}>
              <Text style={styles.lightButtonText}>Back to Home</Text>
            </Pressable>
          ) : null}
          {renderByRoute()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.pageBg },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
    backgroundColor: theme.pageBg
  },
  pageGlowTop: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: theme.glowTop,
    opacity: 0.4
  },
  pageGlowBottom: {
    position: "absolute",
    bottom: 40,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: theme.glowBottom,
    opacity: 0.35
  },
  contentShell: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    gap: 14
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.heroBg,
    borderRadius: 28,
    padding: 22,
    gap: 18
  },
  heroGlowLarge: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: theme.heroGlowA
  },
  heroGlowSmall: {
    position: "absolute",
    bottom: -30,
    left: -10,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: theme.heroGlowB
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  heroBody: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    gap: 16
  },
  heroCopy: {
    flex: 1,
    gap: 10
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.heroBadgeBg,
    borderWidth: 1,
    borderColor: theme.heroBadgeBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999
  },
  heroBadgeText: {
    color: theme.heroBadgeText,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1
  },
  title: { fontSize: 34, fontWeight: "900", color: theme.heroTitle, lineHeight: 40, maxWidth: 520 },
  subtitle: { color: theme.heroSubtitle, fontSize: 15, lineHeight: 23, maxWidth: 540 },
  heroStatusCard: {
    minWidth: 220,
    alignSelf: "stretch",
    backgroundColor: theme.heroStatusBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.heroStatusBorder,
    gap: 6
  },
  heroStatusLabel: {
    color: theme.heroStatusLabel,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1
  },
  heroStatusValue: { color: theme.heroStatusValue, fontSize: 18, fontWeight: "800" },
  heroStatusMeta: { color: theme.heroStatusMeta, fontSize: 13 },
  themeSwitcher: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  themeChip: {
    backgroundColor: theme.heroBadgeBg,
    borderWidth: 1,
    borderColor: theme.heroBadgeBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  themeChipActive: {
    backgroundColor: theme.accentButton,
    borderColor: theme.accentButton
  },
  themeChipText: {
    color: theme.heroBadgeText,
    fontWeight: "700",
    fontSize: 12
  },
  themeChipTextActive: {
    color: theme.accentButtonText
  },
  authButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  statsRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 12
  },
  homeGrid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "flex-start",
    gap: 16
  },
  leftColumn: {
    flex: Platform.OS === "web" ? 1.1 : undefined,
    alignSelf: "stretch",
    gap: 14
  },
  rightColumn: {
    flex: Platform.OS === "web" ? 0.9 : undefined,
    alignSelf: "stretch",
    gap: 14
  },
  statCardWarm: {
    flex: 1,
    backgroundColor: theme.softCardBg,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.softCardBorder,
    gap: 4
  },
  statCardCool: {
    flex: 1,
    backgroundColor: theme.altCardBg,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.altCardBorder,
    gap: 4
  },
  statEyebrow: {
    color: theme.statEyebrow,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  statValue: { color: theme.title, fontSize: 28, fontWeight: "900" },
  statMeta: { color: theme.body, fontSize: 13, lineHeight: 18 },
  mapCard: {
    height: Platform.OS === "web" ? 620 : 300,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: theme.mapBg,
    borderWidth: 1,
    borderColor: theme.mapBorder
  },
  mapInfoCard: {
    backgroundColor: theme.softCardBg,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.softCardBorder,
    gap: 6
  },
  mapInfoCardAlt: {
    backgroundColor: theme.altCardBg,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.altCardBorder,
    gap: 6
  },
  mapInfoTitle: {
    color: theme.title,
    fontSize: 18,
    fontWeight: "800"
  },
  mapInfoBody: {
    color: theme.body,
    lineHeight: 21
  },
  mapInfoMeta: {
    color: theme.bodyStrong,
    fontWeight: "700"
  },
  locationCard: {
    backgroundColor: theme.locationBg,
    borderWidth: 1,
    borderColor: theme.locationBorder,
    borderRadius: 22,
    padding: 18,
    gap: 8
  },
  locationTitle: { color: theme.title, fontWeight: "800", fontSize: 18 },
  metaStrong: { color: theme.bodyStrong, fontWeight: "700" },
  coordPill: {
    backgroundColor: theme.pillBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  coordPillText: { color: theme.pillText, fontWeight: "800", fontSize: 12 },
  listCard: {
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 24,
    padding: 18,
    gap: 12
  },
  featureCard: {
    backgroundColor: theme.featureBg,
    borderRadius: 26,
    padding: 20,
    gap: 10
  },
  featurePill: {
    alignSelf: "flex-start",
    backgroundColor: theme.featurePillBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  featurePillText: { color: theme.featurePillText, fontWeight: "800", fontSize: 12 },
  featureTitle: { color: theme.featureTitle, fontSize: 24, fontWeight: "900" },
  featureSubtitle: { color: theme.featureSubtitle, fontWeight: "700" },
  featureBody: { color: theme.featureBody, lineHeight: 22 },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: theme.title },
  sectionSubtitle: { color: theme.body, lineHeight: 20 },
  card: {
    backgroundColor: theme.cardBg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 24,
    padding: 18,
    gap: 10
  },
  input: {
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.inputBg
  },
  darkButton: { backgroundColor: theme.primaryButton, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, alignItems: "center" },
  darkButtonWide: { backgroundColor: theme.primaryButton, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, alignItems: "center" },
  darkButtonText: { color: theme.primaryButtonText, fontWeight: "700" },
  accentButtonWide: { backgroundColor: theme.accentButton, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, alignItems: "center", alignSelf: "flex-start" },
  accentButtonText: { color: theme.accentButtonText, fontWeight: "800" },
  lightButton: { backgroundColor: theme.lightButton, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  backButton: { alignSelf: "flex-start", backgroundColor: theme.lightButton, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  lightButtonText: { color: theme.lightButtonText, fontWeight: "700" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  truckCard: {
    backgroundColor: theme.softCardBg,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.softCardBorder
  },
  truckCardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
  truckIdentity: { flex: 1, gap: 4 },
  truckCardBody: { color: theme.body, lineHeight: 20 },
  distanceBadge: {
    backgroundColor: theme.distanceBadgeBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  distanceBadgeText: { color: theme.distanceBadgeText, fontWeight: "800", fontSize: 12 },
  itemTitle: { color: theme.title, fontWeight: "800", fontSize: 17 },
  profileStatCard: {
    backgroundColor: theme.softCardBg,
    borderRadius: 18,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.softCardBorder
  },
  profileLabel: { color: theme.statEyebrow, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  profileValue: { color: theme.title, fontSize: 16, fontWeight: "700" },
  meta: { color: theme.muted },
  loader: { marginVertical: 10 }
});
}
