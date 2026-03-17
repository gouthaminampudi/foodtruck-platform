import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotificationBanner({ notification, theme }) {
  const resolvedTheme = theme ?? {
    successBg: "#ecf8f3",
    successBorder: "#cce7dc",
    errorBg: "#fff1ea",
    errorBorder: "#f2cabd",
    bodyStrong: "#20414b",
    title: "#132731"
  };
  const styles = useMemo(() => createStyles(resolvedTheme), [resolvedTheme]);

  if (!notification) {
    return null;
  }

  return (
    <View style={[styles.container, notification.type === "success" ? styles.success : styles.error]}>
      <Text style={styles.eyebrow}>{notification.type === "success" ? "Success" : "Heads up"}</Text>
      <Text style={styles.text}>{notification.message}</Text>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
  container: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1
  },
  success: {
    backgroundColor: theme.successBg,
    borderColor: theme.successBorder
  },
  error: {
    backgroundColor: theme.errorBg,
    borderColor: theme.errorBorder
  },
  eyebrow: {
    color: theme.bodyStrong,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4
  },
  text: {
    color: theme.title,
    fontWeight: "700",
    lineHeight: 19
  }
});
}
