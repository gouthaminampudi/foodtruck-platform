import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileMenu({
  firstName,
  imageUrl,
  isOpen,
  onToggle,
  onViewProfile,
  onEditProfile,
  onLogout
}) {
  const initial = (firstName || "U").charAt(0).toUpperCase();

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.avatar} onPress={onToggle}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </Pressable>
      {isOpen ? (
        <View style={styles.menu}>
          <Pressable style={styles.item} onPress={onViewProfile}>
            <Text style={styles.itemText}>View Profile</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={onEditProfile}>
            <Text style={styles.itemText}>Edit Profile</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={onLogout}>
            <Text style={styles.itemText}>Log Out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "flex-start" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f4f68",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarText: { color: "#fff", fontWeight: "700" },
  menu: {
    marginTop: 8,
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1e6"
  },
  item: { paddingHorizontal: 10, paddingVertical: 10 },
  itemText: { color: "#173746", fontWeight: "600" }
});
