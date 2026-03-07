import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotificationBanner({ notification }) {
  if (!notification) {
    return null;
  }

  return (
    <View style={[styles.container, notification.type === "success" ? styles.success : styles.error]}>
      <Text style={styles.text}>{notification.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  success: {
    backgroundColor: "#d6f0df"
  },
  error: {
    backgroundColor: "#f4d6d6"
  },
  text: {
    color: "#173746",
    fontWeight: "600"
  }
});
