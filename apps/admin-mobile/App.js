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
import { buildAuthHeader, getApiBaseUrl, requestJson } from "./src/shared/services/apiClient";
import { useNotifications } from "./src/shared/utils/notifications";
import { hasRole } from "./src/shared/utils/roleGuard";

const ROUTES = {
  ROOT: "/",
  SIGNIN: "/signin",
  HOME: "/home",
  CUSTOMERS: "/customers",
  TRUCKS: "/trucks"
};

const loginDefaults = { username: "", password: "" };
const customerDefaults = {
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  preferredCuisines: "",
  profileImageUrl: "",
  isActive: true
};
const truckDefaults = {
  ownerUserId: "",
  truckName: "",
  cuisineCategories: "",
  description: "",
  phoneNumber: "",
  licenseNumber: "",
  isOnline: true,
  isActive: true
};

export default function App() {
  const baseUrl = useMemo(() => getApiBaseUrl(), []);
  const { notification, notify } = useNotifications();

  const [route, setRoute] = useState(ROUTES.ROOT);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState(loginDefaults);

  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState(customerDefaults);
  const [trucks, setTrucks] = useState([]);
  const [truckForm, setTruckForm] = useState(truckDefaults);
  const [selectedTruckId, setSelectedTruckId] = useState(null);

  const isAdmin = hasRole(auth, "ADMIN");

  function authHeaders(currentAuth = auth) {
    return buildAuthHeader(currentAuth);
  }

  async function loginAdmin() {
    if (!login.username || !login.password) {
      notify("error", "This field is required.");
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson(`${baseUrl}/api/v1/auth/admin/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login)
      });
      if (data.role !== "ADMIN") {
        notify("error", "Unauthorized access.");
        return;
      }
      setAuth(data);
      setLogin(loginDefaults);
      setRoute(ROUTES.HOME);
      notify("success", "Login successful.");
    } catch {
      notify("error", "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers(currentAuth = auth) {
    if (!currentAuth) return;
    try {
      const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
      const data = await requestJson(`${baseUrl}/api/v1/admin/customers${suffix}`, {
        headers: authHeaders(currentAuth)
      });
      setCustomers(data);
      if (!data.length) {
        notify("error", "No customers found.");
      }
    } catch {
      notify("error", "Unable to load customers.");
    }
  }

  async function loadTrucks(currentAuth = auth) {
    if (!currentAuth) return;
    try {
      const data = await requestJson(`${baseUrl}/api/v1/admin/trucks`, {
        headers: authHeaders(currentAuth)
      });
      setTrucks(data);
      if (!data.length) {
        notify("error", "No trucks found.");
      }
    } catch {
      notify("error", "Unable to load trucks.");
    }
  }

  function pickCustomer(customer) {
    setCustomerForm({
      userId: customer.userId,
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      email: customer.email ?? "",
      phoneNumber: customer.phoneNumber ?? "",
      preferredCuisines: customer.preferredCuisines ?? "",
      profileImageUrl: customer.profileImageUrl ?? "",
      isActive: customer.isActive ?? true
    });
  }

  async function saveCustomer() {
    if (!customerForm.userId) {
      notify("error", "Select a customer to update.");
      return;
    }
    try {
      await requestJson(`${baseUrl}/api/v1/admin/customers/${customerForm.userId}`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: customerForm.firstName,
          lastName: customerForm.lastName,
          email: customerForm.email,
          phoneNumber: customerForm.phoneNumber,
          preferredCuisines: customerForm.preferredCuisines,
          profileImageUrl: customerForm.profileImageUrl,
          isActive: customerForm.isActive
        })
      });
      notify("success", "Customer updated successfully.");
      await loadCustomers();
    } catch {
      notify("error", "Unable to update customer.");
    }
  }

  async function toggleCustomer(userId, active) {
    try {
      const action = active ? "activate" : "deactivate";
      await requestJson(`${baseUrl}/api/v1/admin/customers/${userId}/${action}`, {
        method: "PATCH",
        headers: authHeaders()
      });
      notify("success", "Changes saved successfully.");
      await loadCustomers();
    } catch {
      notify("error", "Unable to update customer.");
    }
  }

  function pickTruck(truck) {
    setSelectedTruckId(truck.id);
    setTruckForm({
      ownerUserId: truck.ownerUserId ?? "",
      truckName: truck.truckName ?? "",
      cuisineCategories: (truck.cuisineCategories ?? []).join("|"),
      description: truck.description ?? "",
      phoneNumber: truck.phoneNumber ?? "",
      licenseNumber: truck.licenseNumber ?? "",
      isOnline: truck.isOnline ?? true,
      isActive: truck.isActive ?? true
    });
  }

  async function saveTruck() {
    const ownerUserId = truckForm.ownerUserId.trim();
    const truckName = truckForm.truckName.trim();

    if (!ownerUserId || !truckName) {
      notify("error", "This field is required.");
      return;
    }

    try {
      const method = selectedTruckId ? "PUT" : "POST";
      const url = selectedTruckId
        ? `${baseUrl}/api/v1/admin/trucks/${selectedTruckId}`
        : `${baseUrl}/api/v1/admin/trucks`;
      await requestJson(url, {
        method,
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ownerUserId,
          truckName,
          cuisineCategories: truckForm.cuisineCategories
            .split("|")
            .map((value) => value.trim())
            .filter(Boolean),
          description: truckForm.description.trim(),
          phoneNumber: truckForm.phoneNumber.trim(),
          licenseNumber: truckForm.licenseNumber.trim(),
          isOnline: truckForm.isOnline,
          isActive: truckForm.isActive
        })
      });
      notify("success", selectedTruckId ? "Truck updated successfully." : "Food truck added successfully.");
      setSelectedTruckId(null);
      setTruckForm(truckDefaults);
      await loadTrucks();
    } catch (error) {
      notify("error", error.message || "Unable to save truck changes.");
    }
  }

  async function toggleTruck(truckId, active) {
    try {
      const action = active ? "activate" : "deactivate";
      await requestJson(`${baseUrl}/api/v1/admin/trucks/${truckId}/${action}`, {
        method: "PATCH",
        headers: authHeaders()
      });
      notify("success", "Changes saved successfully.");
      await loadTrucks();
    } catch {
      notify("error", "Unable to save truck changes.");
    }
  }

  function logout() {
    setAuth(null);
    setRoute(ROUTES.ROOT);
    setCustomers([]);
    setTrucks([]);
    notify("success", "Changes saved successfully.");
  }

  function renderSignIn() {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Admin Sign In</Text>
        <TextInput style={styles.input} placeholder="Username" value={login.username} onChangeText={(value) => setLogin((prev) => ({ ...prev, username: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={login.password} onChangeText={(value) => setLogin((prev) => ({ ...prev, password: value }))} secureTextEntry />
        <Pressable style={styles.primaryButton} onPress={loginAdmin}>
          <Text style={styles.primaryText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  function renderAdminHome() {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Admin Home</Text>
        <Text style={styles.meta}>Select a management page.</Text>
        <Pressable style={styles.primaryButton} onPress={() => { setRoute(ROUTES.CUSTOMERS); loadCustomers(); }}>
          <Text style={styles.primaryText}>Customer Management</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => { setRoute(ROUTES.TRUCKS); loadTrucks(); }}>
          <Text style={styles.primaryText}>Truck Management</Text>
        </Pressable>
        <Pressable style={styles.lightButton} onPress={logout}>
          <Text style={styles.lightText}>Log Out</Text>
        </Pressable>
      </View>
    );
  }

  function renderCustomerManagementPage() {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Customer Management</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Search customers" value={query} onChangeText={setQuery} />
          <Pressable style={styles.lightButton} onPress={() => loadCustomers()}>
            <Text style={styles.lightText}>Search</Text>
          </Pressable>
        </View>
        {customers.map((customer) => (
          <View key={customer.userId} style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{customer.firstName} {customer.lastName}</Text>
              <Text style={styles.meta}>{customer.username} • {customer.email}</Text>
            </View>
            <Pressable style={styles.lightButton} onPress={() => pickCustomer(customer)}>
              <Text style={styles.lightText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.lightButton} onPress={() => toggleCustomer(customer.userId, !customer.isActive)}>
              <Text style={styles.lightText}>{customer.isActive ? "Deactivate" : "Activate"}</Text>
            </Pressable>
          </View>
        ))}
        <TextInput style={styles.input} placeholder="Selected User Id" value={customerForm.userId} editable={false} />
        <TextInput style={styles.input} placeholder="First Name" value={customerForm.firstName} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, firstName: value }))} />
        <TextInput style={styles.input} placeholder="Last Name" value={customerForm.lastName} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, lastName: value }))} />
        <TextInput style={styles.input} placeholder="Email" value={customerForm.email} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, email: value }))} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" value={customerForm.phoneNumber} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, phoneNumber: value }))} />
        <Pressable style={styles.primaryButton} onPress={saveCustomer}>
          <Text style={styles.primaryText}>Save Customer</Text>
        </Pressable>
      </View>
    );
  }

  function renderTruckManagementPage() {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Truck Management</Text>
        {trucks.map((truck) => (
          <View key={truck.id} style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{truck.truckName}</Text>
              <Text style={styles.meta}>{truck.id}</Text>
            </View>
            <Pressable style={styles.lightButton} onPress={() => pickTruck(truck)}>
              <Text style={styles.lightText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.lightButton} onPress={() => toggleTruck(truck.id, !truck.isActive)}>
              <Text style={styles.lightText}>{truck.isActive ? "Deactivate" : "Activate"}</Text>
            </Pressable>
          </View>
        ))}
        <TextInput style={styles.input} placeholder="Owner Username or User Id" value={truckForm.ownerUserId} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, ownerUserId: value }))} autoCapitalize="none" />
        <Text style={styles.meta}>Enter the owner username. UUID still works too if you already have it.</Text>
        <TextInput style={styles.input} placeholder="Truck Name" value={truckForm.truckName} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, truckName: value }))} />
        <TextInput style={styles.input} placeholder="Cuisines (pipe-separated)" value={truckForm.cuisineCategories} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, cuisineCategories: value }))} />
        <TextInput style={styles.input} placeholder="Description" value={truckForm.description} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, description: value }))} />
        <TextInput style={styles.input} placeholder="Phone Number" value={truckForm.phoneNumber} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, phoneNumber: value }))} />
        <TextInput style={styles.input} placeholder="License Number" value={truckForm.licenseNumber} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, licenseNumber: value }))} />
        <Pressable style={styles.primaryButton} onPress={saveTruck}>
          <Text style={styles.primaryText}>{selectedTruckId ? "Update Truck" : "Create Truck"}</Text>
        </Pressable>
      </View>
    );
  }

  function renderByRoute() {
    if (!isAdmin && route !== ROUTES.ROOT && route !== ROUTES.SIGNIN) {
      return renderSignIn();
    }
    if (route === ROUTES.CUSTOMERS) return renderCustomerManagementPage();
    if (route === ROUTES.TRUCKS) return renderTruckManagementPage();
    if (route === ROUTES.HOME) return renderAdminHome();
    return renderSignIn();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <NotificationBanner notification={notification} />
        {loading ? <ActivityIndicator style={styles.loader} /> : null}
        {renderByRoute()}
        {isAdmin && route !== ROUTES.HOME ? (
          <Pressable style={styles.lightButton} onPress={() => setRoute(ROUTES.HOME)}>
            <Text style={styles.lightText}>Back to Admin Home</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fa" },
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dbe2e7", borderRadius: 12, padding: 12, gap: 8 },
  title: { fontSize: 20, fontWeight: "800", color: "#183746" },
  input: { borderWidth: 1, borderColor: "#cfd8df", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#fbfdff" },
  primaryButton: { backgroundColor: "#1c4d6f", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  lightButton: { backgroundColor: "#e7edf1", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  lightText: { color: "#1e3a4b", fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  listItem: { flexDirection: "row", gap: 8, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e8edf1", paddingVertical: 8 },
  itemTitle: { fontWeight: "700", color: "#173645" },
  meta: { color: "#5b7280", fontSize: 12 },
  loader: { marginVertical: 8 }
});
