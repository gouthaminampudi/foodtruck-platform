import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { buildAuthHeader, getApiBaseUrl, requestJson } from "./src/shared/services/apiClient";
import { useNotifications } from "./src/shared/utils/notifications";
import { hasRole } from "./src/shared/utils/roleGuard";
import { isStrongPassword, isValidEmail } from "./src/shared/utils/validators";

const ROUTES = {
  ROOT: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  HOME: "/home",
  PROFILE: "/profile",
  EDIT_PROFILE: "/profile/edit",
  TRUCK: "/truck",
  EDIT_TRUCK: "/truck/edit"
};

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
  profileImageUrl: "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: ""
};

const truckDefaults = {
  truckName: "",
  cuisineCategories: "",
  description: "",
  phoneNumber: "",
  isOnline: true,
  latitude: "",
  longitude: "",
  isLive: true
};

export default function App() {
  const baseUrl = useMemo(() => getApiBaseUrl(), []);
  const { notification, notify } = useNotifications();

  const [route, setRoute] = useState(ROUTES.ROOT);
  const [auth, setAuth] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signUpForm, setSignUpForm] = useState(signUpDefaults);
  const [signInForm, setSignInForm] = useState(signInDefaults);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(profileDefaults);
  const [truck, setTruck] = useState(null);
  const [truckForm, setTruckForm] = useState(truckDefaults);

  const isOperator = hasRole(auth, "OPERATOR");

  async function loadOperatorData(authState = auth) {
    if (!authState) return;
    try {
      const [profileData, truckData] = await Promise.all([
        requestJson(`${baseUrl}/api/v1/operator/profile`, { headers: buildAuthHeader(authState) }),
        requestJson(`${baseUrl}/api/v1/operator/truck`, { headers: buildAuthHeader(authState) })
      ]);
      setProfile(profileData);
      setTruck(truckData);
      setProfileForm({
        firstName: profileData.firstName ?? "",
        lastName: profileData.lastName ?? "",
        email: profileData.email ?? "",
        phoneNumber: profileData.phoneNumber ?? "",
        profileImageUrl: profileData.profileImageUrl ?? "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      setTruckForm({
        truckName: truckData.truckName ?? "",
        cuisineCategories: (truckData.cuisineCategories ?? []).join("|"),
        description: truckData.description ?? "",
        phoneNumber: truckData.phoneNumber ?? "",
        isOnline: truckData.isOnline ?? true,
        latitude: "",
        longitude: "",
        isLive: true
      });
    } catch (error) {
      notify("error", error.message || "No operator truck assigned.");
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
    if (!validateSignUp()) return;
    setLoading(true);
    try {
      await requestJson(`${baseUrl}/api/v1/auth/operator/signup`, {
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
      setLoading(false);
    }
  }

  async function onSignIn() {
    if (!signInForm.username || !signInForm.password) {
      notify("error", "This field is required.");
      return;
    }
    setLoading(true);
    try {
      const signedIn = await requestJson(`${baseUrl}/api/v1/auth/operator/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInForm)
      });
      if (signedIn.role !== "OPERATOR") {
        notify("error", "Unauthorized access.");
        return;
      }
      setAuth(signedIn);
      setSignInForm(signInDefaults);
      await loadOperatorData(signedIn);
      setRoute(ROUTES.HOME);
      notify("success", "Login successful.");
    } catch {
      notify("error", "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveProfile() {
    if (!isOperator) {
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
    setLoading(true);
    try {
      await requestJson(`${baseUrl}/api/v1/operator/profile`, {
        method: "PUT",
        headers: {
          ...buildAuthHeader(auth),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileForm)
      });
      await loadOperatorData();
      setRoute(ROUTES.HOME);
      notify("success", "Profile updated successfully.");
    } catch {
      notify("error", "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveTruck() {
    if (!isOperator) {
      notify("error", "Unauthorized access.");
      return;
    }
    setLoading(true);
    try {
      await requestJson(`${baseUrl}/api/v1/operator/truck`, {
        method: "PUT",
        headers: {
          ...buildAuthHeader(auth),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          truckName: truckForm.truckName,
          cuisineCategories: truckForm.cuisineCategories
            .split("|")
            .map((value) => value.trim())
            .filter(Boolean),
          description: truckForm.description,
          phoneNumber: truckForm.phoneNumber,
          isOnline: truckForm.isOnline
        })
      });

      if (truckForm.latitude && truckForm.longitude) {
        await requestJson(`${baseUrl}/api/v1/operator/truck/location`, {
          method: "PUT",
          headers: {
            ...buildAuthHeader(auth),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            latitude: Number(truckForm.latitude),
            longitude: Number(truckForm.longitude),
            isLive: truckForm.isLive
          })
        });
      }

      await loadOperatorData();
      setRoute(ROUTES.TRUCK);
      notify("success", "Truck updated successfully.");
    } catch {
      notify("error", "Unable to save truck changes.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuth(null);
    setProfile(null);
    setTruck(null);
    setMenuOpen(false);
    setRoute(ROUTES.ROOT);
    notify("success", "Changes saved successfully.");
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        {isOperator ? (
          <ProfileMenu
            firstName={profile?.firstName}
            imageUrl={profile?.profileImageUrl}
            isOpen={menuOpen}
            onToggle={() => setMenuOpen((value) => !value)}
            onViewProfile={() => { setMenuOpen(false); setRoute(ROUTES.PROFILE); }}
            onEditProfile={() => { setMenuOpen(false); setRoute(ROUTES.EDIT_PROFILE); }}
            onLogout={logout}
          />
        ) : (
          <View style={styles.authButtons}>
            <Pressable style={styles.lightButton} onPress={() => setRoute(ROUTES.SIGNUP)}>
              <Text style={styles.lightText}>Sign Up</Text>
            </Pressable>
            <Pressable style={styles.darkButton} onPress={() => setRoute(ROUTES.SIGNIN)}>
              <Text style={styles.darkText}>Sign In</Text>
            </Pressable>
          </View>
        )}
        <View>
          <Text style={styles.title}>Operator Home</Text>
          <Text style={styles.subtitle}>Operator-only truck dashboard and profile controls.</Text>
        </View>
      </View>
    );
  }

  function renderSignUp() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Operator Sign Up</Text>
        <TextInput style={styles.input} placeholder="First Name" value={signUpForm.firstName} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, firstName: value }))} />
        <TextInput style={styles.input} placeholder="Last Name" value={signUpForm.lastName} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, lastName: value }))} />
        <TextInput style={styles.input} placeholder="Username" value={signUpForm.username} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, username: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Email" value={signUpForm.email} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, email: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" value={signUpForm.phoneNumber} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, phoneNumber: value }))} />
        <TextInput style={styles.input} placeholder="Password" value={signUpForm.password} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, password: value }))} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" value={signUpForm.confirmPassword} onChangeText={(value) => setSignUpForm((prev) => ({ ...prev, confirmPassword: value }))} secureTextEntry />
        <Pressable style={styles.darkButtonWide} onPress={onSignUp} disabled={loading}>
          <Text style={styles.darkText}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  function renderSignIn() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Operator Sign In</Text>
        <TextInput style={styles.input} placeholder="Username" value={signInForm.username} onChangeText={(value) => setSignInForm((prev) => ({ ...prev, username: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={signInForm.password} onChangeText={(value) => setSignInForm((prev) => ({ ...prev, password: value }))} secureTextEntry />
        <Pressable style={styles.darkButtonWide} onPress={onSignIn} disabled={loading}>
          <Text style={styles.darkText}>Login</Text>
        </Pressable>
      </View>
    );
  }

  function renderHome() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Truck Dashboard</Text>
        {!truck ? <Text style={styles.meta}>No operator truck assigned.</Text> : (
          <>
            <Text style={styles.meta}>Truck: {truck.truckName}</Text>
            <Text style={styles.meta}>Online: {truck.isOnline ? "Yes" : "No"}</Text>
            <Text style={styles.meta}>Cuisine: {(truck.cuisineCategories || []).join(", ") || "-"}</Text>
          </>
        )}
        <Pressable style={styles.lightButton} onPress={() => setRoute(ROUTES.TRUCK)}>
          <Text style={styles.lightText}>Operator Truck Details</Text>
        </Pressable>
      </View>
    );
  }

  function renderProfile() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Operator Profile</Text>
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
        <Text style={styles.sectionTitle}>Edit Operator Profile</Text>
        <TextInput style={styles.input} placeholder="First Name" value={profileForm.firstName} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, firstName: value }))} />
        <TextInput style={styles.input} placeholder="Last Name" value={profileForm.lastName} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, lastName: value }))} />
        <TextInput style={styles.input} placeholder="Email" value={profileForm.email} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, email: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" value={profileForm.phoneNumber} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, phoneNumber: value }))} />
        <TextInput style={styles.input} placeholder="Profile Image URL" value={profileForm.profileImageUrl} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, profileImageUrl: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Current Password" value={profileForm.currentPassword} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, currentPassword: value }))} secureTextEntry />
        <TextInput style={styles.input} placeholder="New Password" value={profileForm.newPassword} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, newPassword: value }))} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm New Password" value={profileForm.confirmNewPassword} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, confirmNewPassword: value }))} secureTextEntry />
        <Pressable style={styles.darkButtonWide} onPress={onSaveProfile} disabled={loading}>
          <Text style={styles.darkText}>Save</Text>
        </Pressable>
      </View>
    );
  }

  function renderTruck() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Operator Truck Details</Text>
        {!truck ? <Text style={styles.meta}>No operator truck assigned.</Text> : (
          <>
            <Text style={styles.meta}>Truck ID: {truck.id}</Text>
            <Text style={styles.meta}>Name: {truck.truckName}</Text>
            <Text style={styles.meta}>Status: {truck.isOnline ? "Online" : "Offline"}</Text>
            <Pressable style={styles.lightButton} onPress={() => setRoute(ROUTES.EDIT_TRUCK)}>
              <Text style={styles.lightText}>Edit Operator Truck</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  function renderEditTruck() {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Operator Truck</Text>
        <TextInput style={styles.input} placeholder="Truck Name" value={truckForm.truckName} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, truckName: value }))} />
        <TextInput style={styles.input} placeholder="Cuisine Categories (pipe-separated)" value={truckForm.cuisineCategories} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, cuisineCategories: value }))} />
        <TextInput style={styles.input} placeholder="Description" value={truckForm.description} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, description: value }))} />
        <TextInput style={styles.input} placeholder="Phone Number" value={truckForm.phoneNumber} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, phoneNumber: value }))} />
        <TextInput style={styles.input} placeholder="Latitude (optional)" value={truckForm.latitude} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, latitude: value }))} />
        <TextInput style={styles.input} placeholder="Longitude (optional)" value={truckForm.longitude} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, longitude: value }))} />
        <Pressable style={styles.darkButtonWide} onPress={onSaveTruck} disabled={loading}>
          <Text style={styles.darkText}>Save Truck</Text>
        </Pressable>
      </View>
    );
  }

  function renderByRoute() {
    if (route === ROUTES.SIGNUP) return renderSignUp();
    if (route === ROUTES.SIGNIN) return renderSignIn();
    if (route === ROUTES.PROFILE) return renderProfile();
    if (route === ROUTES.EDIT_PROFILE) return renderEditProfile();
    if (route === ROUTES.TRUCK) return renderTruck();
    if (route === ROUTES.EDIT_TRUCK) return renderEditTruck();
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
            <Text style={styles.lightText}>Back to Home</Text>
          </Pressable>
        ) : null}
        {loading ? <ActivityIndicator style={styles.loader} /> : null}
        {renderByRoute()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f7f5" },
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { gap: 10 },
  title: { fontSize: 24, fontWeight: "800", color: "#183746" },
  subtitle: { color: "#5b7280" },
  authButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dbe2e7", borderRadius: 12, padding: 12, gap: 8 },
  sectionTitle: { color: "#183746", fontSize: 18, fontWeight: "800" },
  input: { borderWidth: 1, borderColor: "#cfd8df", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#fbfdff" },
  darkButton: { backgroundColor: "#1c4d6f", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  darkButtonWide: { backgroundColor: "#1c4d6f", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" },
  darkText: { color: "#fff", fontWeight: "700" },
  lightButton: { backgroundColor: "#e7edf1", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  lightText: { color: "#1e3a4b", fontWeight: "700" },
  meta: { color: "#5b7280" },
  loader: { marginVertical: 8 }
});
