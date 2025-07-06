import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { handleLogout } from "../utils/logout";

const apiUrl = "http://192.168.135.53:5000";

const MessagesScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) fetchAvailableUsers();
  }, [isFocused]);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Tekrar giriş yapınız.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const res = await axios.get(`${apiUrl}/api/messages/available-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableUsers(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Kullanıcılar alınamadı.";
      Alert.alert("Hata", msg);
      console.error("Kullanıcılar alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.convoItem}
      onPress={() =>
        navigation.navigate("Chat", {
          userId: item._id,
          username: item.username || item.name || "Kullanıcı",
        })
      }
    >
      <Ionicons name="person-circle" size={36} color="#FFD700" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.convoName}>{item.username || item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <Text style={styles.header}>Sohbetler</Text>
      {availableUsers.length === 0 ? (
        <Text style={styles.emptyText}>Sohbet başlatabileceğiniz kişi yok.</Text>
      ) : (
        <FlatList
          data={availableUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Calories")}>
          <Ionicons name="fast-food" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.mainButton]} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Exercises")}>
          <Ionicons name="barbell" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Messages")}>
          <Ionicons name="chatbubbles" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => handleLogout(navigation)}>
          <Ionicons name="log-out" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 12 },
  header: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "center",
  },
  convoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C3E50",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  convoName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  emptyText: {
    color: "#AAA",
    fontSize: 18,
    textAlign: "center",
    marginTop: 60,
    fontStyle: "italic",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: { padding: 10 },
  mainButton: { backgroundColor: "#007bff", borderRadius: 25, padding: 12 },
});

export default MessagesScreen;