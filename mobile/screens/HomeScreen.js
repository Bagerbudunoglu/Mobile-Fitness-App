import React, { useEffect, useState } from "react";
import {API_URL} from '@env'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { handleLogout } from "../utils/logout";


const apiUrl =  process.env.API_URL; // IP adresin doğru olsun!

const HomeScreen = () => {
  const navigation = useNavigation();
  const [scoreboard, setScoreboard] = useState([]);

  useEffect(() => {
    fetchScoreboard();
  }, [navigation]);

  const fetchScoreboard = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const response = await axios.get(`${apiUrl}/api/scoreboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScoreboard(response.data);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Puanlar alınamadı.";
      Alert.alert("Hata", msg);
      setScoreboard([]);
      console.error("Puan tablosu alınırken hata:", error);
    }
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.sectionTitle}>HAFTALIK PUAN TABLOSU</Text>
        <FlatList
          data={scoreboard}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.scoreItem}>
              <Text style={styles.scoreText}>
                {index + 1}. {item.username} - {item.totalPoints} puan
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#FFF", fontStyle: "italic", textAlign: "center", marginTop: 15 }}>
              Henüz puan verisi bulunamadı.
            </Text>
          }
        />
      </View>

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
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  scoreContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    alignItems: "center",
    marginTop: 40,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  scoreItem: {
    paddingVertical: 8,
  },
  scoreText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: { padding: 10 },
  mainButton: {
    backgroundColor: "#007bff",
    borderRadius: 25,
    padding: 12,
  },
});

export default HomeScreen;
