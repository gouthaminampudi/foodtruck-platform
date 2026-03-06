import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
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

const emptyTruckForm = {
  ownerUserId: "",
  truckName: "",
  cuisineCategories: "",
  description: "",
  phoneNumber: "",
  licenseNumber: "",
  isOnline: true
};

const emptyOperatorForm = {
  truckId: "",
  userId: "",
  operatorRole: "CHEF",
  isActive: true,
  actorUserId: ""
};

export default function App() {
  const baseUrl = useMemo(() => apiBaseUrl(), []);
  const [trucks, setTrucks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [truckForm, setTruckForm] = useState(emptyTruckForm);
  const [operatorForm, setOperatorForm] = useState(emptyOperatorForm);
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    loadTrucks();
  }, []);

  async function loadTrucks() {
    setIsLoading(true);
    setErrorText("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/trucks`);
      if (!response.ok) {
        throw new Error(`Trucks load failed (${response.status})`);
      }
      setTrucks(await response.json());
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAssignments(truckId) {
    if (!truckId) {
      setAssignments([]);
      return;
    }
    setIsLoading(true);
    setErrorText("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/truck-operators?truckId=${truckId}`);
      if (!response.ok) {
        throw new Error(`Assignments load failed (${response.status})`);
      }
      setAssignments(await response.json());
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function selectTruck(truck) {
    setSelectedTruckId(truck.id);
    setTruckForm({
      ownerUserId: truck.ownerUserId ?? "",
      truckName: truck.truckName ?? "",
      cuisineCategories: (truck.cuisineCategories ?? []).join("|"),
      description: truck.description ?? "",
      phoneNumber: truck.phoneNumber ?? "",
      licenseNumber: truck.licenseNumber ?? "",
      isOnline: truck.isOnline ?? true
    });
    setOperatorForm((prev) => ({ ...prev, truckId: truck.id }));
    loadAssignments(truck.id);
  }

  function selectAssignment(assignment) {
    setSelectedAssignmentId(assignment.id);
    setOperatorForm((prev) => ({
      ...prev,
      truckId: assignment.truckId,
      userId: assignment.userId,
      operatorRole: assignment.operatorRole,
      isActive: assignment.isActive ?? true
    }));
  }

  async function saveTruck() {
    if (!truckForm.ownerUserId || !truckForm.truckName) {
      setErrorText("ownerUserId and truckName are required.");
      return;
    }
    setIsSaving(true);
    setErrorText("");
    try {
      const payload = {
        ownerUserId: truckForm.ownerUserId,
        truckName: truckForm.truckName,
        cuisineCategories: truckForm.cuisineCategories
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean),
        description: truckForm.description,
        phoneNumber: truckForm.phoneNumber,
        licenseNumber: truckForm.licenseNumber,
        isOnline: truckForm.isOnline
      };

      const targetUrl = selectedTruckId ? `${baseUrl}/api/v1/trucks/${selectedTruckId}` : `${baseUrl}/api/v1/trucks`;
      const method = selectedTruckId ? "PUT" : "POST";
      const headers = { "Content-Type": "application/json" };
      if (operatorForm.actorUserId) {
        headers["X-Actor-User-Id"] = operatorForm.actorUserId;
      }

      const response = await fetch(targetUrl, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Save truck failed (${response.status}): ${body}`);
      }
      await loadTrucks();
      if (!selectedTruckId) {
        setTruckForm(emptyTruckForm);
      }
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTruck(truckId) {
    setIsSaving(true);
    setErrorText("");
    try {
      const headers = {};
      if (operatorForm.actorUserId) {
        headers["X-Actor-User-Id"] = operatorForm.actorUserId;
      }
      const response = await fetch(`${baseUrl}/api/v1/trucks/${truckId}`, { method: "DELETE", headers });
      if (!response.ok) {
        throw new Error(`Delete truck failed (${response.status})`);
      }
      await loadTrucks();
      if (selectedTruckId === truckId) {
        setSelectedTruckId(null);
        setTruckForm(emptyTruckForm);
        setAssignments([]);
      }
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAssignment() {
    if (!operatorForm.truckId || !operatorForm.userId || !operatorForm.operatorRole) {
      setErrorText("truckId, userId, and operatorRole are required.");
      return;
    }
    setIsSaving(true);
    setErrorText("");
    try {
      const payload = {
        truckId: operatorForm.truckId,
        userId: operatorForm.userId,
        operatorRole: operatorForm.operatorRole,
        isActive: operatorForm.isActive
      };
      const targetUrl = selectedAssignmentId
        ? `${baseUrl}/api/v1/truck-operators/${selectedAssignmentId}`
        : `${baseUrl}/api/v1/truck-operators`;
      const method = selectedAssignmentId ? "PUT" : "POST";
      const headers = { "Content-Type": "application/json" };
      if (operatorForm.actorUserId) {
        headers["X-Actor-User-Id"] = operatorForm.actorUserId;
      }
      const response = await fetch(targetUrl, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Save assignment failed (${response.status}): ${body}`);
      }
      setSelectedAssignmentId(null);
      setOperatorForm((prev) => ({ ...emptyOperatorForm, truckId: prev.truckId, actorUserId: prev.actorUserId }));
      await loadAssignments(payload.truckId);
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAssignment(assignment) {
    setIsSaving(true);
    setErrorText("");
    try {
      const headers = {};
      if (operatorForm.actorUserId) {
        headers["X-Actor-User-Id"] = operatorForm.actorUserId;
      }
      const response = await fetch(`${baseUrl}/api/v1/truck-operators/${assignment.id}`, {
        method: "DELETE",
        headers
      });
      if (!response.ok) {
        throw new Error(`Delete assignment failed (${response.status})`);
      }
      await loadAssignments(assignment.truckId);
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Operator CRUD Console</Text>
        <Text style={styles.subtitle}>Manage truck profiles and truck operator assignments.</Text>
        <Text style={styles.apiHint}>API: {baseUrl}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actor Context</Text>
          <TextInput
            style={styles.input}
            value={operatorForm.actorUserId}
            onChangeText={(value) => setOperatorForm((prev) => ({ ...prev, actorUserId: value }))}
            placeholder="X-Actor-User-Id (optional unless authz enabled)"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Truck Profile</Text>
          <TextInput style={styles.input} value={truckForm.ownerUserId} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, ownerUserId: value }))} placeholder="ownerUserId" />
          <TextInput style={styles.input} value={truckForm.truckName} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, truckName: value }))} placeholder="truckName" />
          <TextInput style={styles.input} value={truckForm.cuisineCategories} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, cuisineCategories: value }))} placeholder="cuisineCategories (Mexican|Tacos)" />
          <TextInput style={styles.input} value={truckForm.description} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, description: value }))} placeholder="description" />
          <TextInput style={styles.input} value={truckForm.phoneNumber} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, phoneNumber: value }))} placeholder="phone number" />
          <TextInput style={styles.input} value={truckForm.licenseNumber} onChangeText={(value) => setTruckForm((prev) => ({ ...prev, licenseNumber: value }))} placeholder="license number" />

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.primary]} onPress={saveTruck} disabled={isSaving}>
              <Text style={styles.buttonText}>{selectedTruckId ? "Update Truck" : "Create Truck"}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={() => { setSelectedTruckId(null); setTruckForm(emptyTruckForm); }}>
              <Text style={styles.buttonTextDark}>Clear</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={loadTrucks}>
              <Text style={styles.buttonTextDark}>Refresh</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Truck Operator Assignment</Text>
          <TextInput style={styles.input} value={operatorForm.truckId} onChangeText={(value) => setOperatorForm((prev) => ({ ...prev, truckId: value }))} placeholder="truckId" />
          <TextInput style={styles.input} value={operatorForm.userId} onChangeText={(value) => setOperatorForm((prev) => ({ ...prev, userId: value }))} placeholder="operator userId" />
          <TextInput style={styles.input} value={operatorForm.operatorRole} onChangeText={(value) => setOperatorForm((prev) => ({ ...prev, operatorRole: value.toUpperCase() }))} placeholder="operatorRole (CHEF/CASHIER/DRIVER)" />

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.primary]} onPress={saveAssignment} disabled={isSaving}>
              <Text style={styles.buttonText}>{selectedAssignmentId ? "Update Assignment" : "Create Assignment"}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={() => setSelectedAssignmentId(null)}>
              <Text style={styles.buttonTextDark}>Clear</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={() => loadAssignments(operatorForm.truckId)}>
              <Text style={styles.buttonTextDark}>Refresh</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trucks</Text>
          {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
          {trucks.map((truck) => (
            <View key={truck.id} style={styles.listItem}>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{truck.truckName}</Text>
                <Text style={styles.listMeta}>Truck: {truck.id}</Text>
                <Text style={styles.listMeta}>Owner: {truck.ownerUserId}</Text>
              </View>
              <View style={styles.actionColumn}>
                <Pressable style={[styles.button, styles.secondarySmall]} onPress={() => selectTruck(truck)}>
                  <Text style={styles.buttonTextDark}>Edit</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.dangerSmall]} onPress={() => deleteTruck(truck.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assignments</Text>
          {assignments.map((assignment) => (
            <View key={assignment.id} style={styles.listItem}>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{assignment.operatorRole}</Text>
                <Text style={styles.listMeta}>Assignment: {assignment.id}</Text>
                <Text style={styles.listMeta}>User: {assignment.userId}</Text>
              </View>
              <View style={styles.actionColumn}>
                <Pressable style={[styles.button, styles.secondarySmall]} onPress={() => selectAssignment(assignment)}>
                  <Text style={styles.buttonTextDark}>Edit</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.dangerSmall]} onPress={() => deleteAssignment(assignment)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5efe3" },
  scrollView: { flex: 1 },
  container: { padding: 16, paddingBottom: 44 },
  title: { color: "#1f1d1a", fontSize: 30, fontWeight: "800" },
  subtitle: { color: "#5b554b", fontSize: 14, marginTop: 6, marginBottom: 6 },
  apiHint: { color: "#7d7264", fontSize: 12, marginBottom: 10 },
  card: { backgroundColor: "#fffaf2", borderRadius: 18, borderWidth: 1, borderColor: "#eadfca", padding: 12, marginBottom: 12 },
  cardTitle: { color: "#1f1d1a", fontSize: 18, fontWeight: "800", marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#eadfca", paddingHorizontal: 10, paddingVertical: 9, marginBottom: 8 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  button: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 },
  primary: { backgroundColor: "#8f3a21" },
  secondary: { backgroundColor: "#efe4d3" },
  secondarySmall: { backgroundColor: "#efe4d3", paddingVertical: 8 },
  dangerSmall: { backgroundColor: "#d6532f", paddingVertical: 8 },
  buttonText: { color: "#fffaf2", fontWeight: "800", fontSize: 12 },
  buttonTextDark: { color: "#4f463b", fontWeight: "800", fontSize: 12 },
  loader: { marginVertical: 10 },
  listItem: { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderColor: "#eadfca", borderRadius: 10, padding: 10, marginBottom: 8, gap: 10 },
  listBody: { flex: 1 },
  listTitle: { color: "#1f1d1a", fontSize: 14, fontWeight: "800" },
  listMeta: { color: "#6c655c", fontSize: 11, marginTop: 2 },
  actionColumn: { justifyContent: "center", gap: 6 },
  errorText: { color: "#c31919", fontSize: 12, marginTop: 4 }
});
