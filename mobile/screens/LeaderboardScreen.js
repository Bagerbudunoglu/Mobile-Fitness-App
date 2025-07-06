import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { handleLogout } from "../utils/logout";

const apiUrl = "http://192.168.135.53:5000";

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const response = await axios.get(`${apiUrl}/api/trainer/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(response.data);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Leaderboard çekilemedi.";
      Alert.alert("Hata", msg);
      setLeaderboard([]);
      console.error("❌ Leaderboard çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>
        {index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
      </Text>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.points}>{item.totalPoints} ⭐</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <Text style={styles.title}>🏆 Haftalık Sıralama</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, idx) => item._id?.toString() || item.id?.toString() || idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={{ color: "#FFF", textAlign: "center", fontStyle: "italic", marginTop: 25 }}>
              Henüz sıralama verisi yok.
            </Text>
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFD700", textAlign: "center", marginBottom: 20 },
  listContent: { paddingHorizontal: 20 },
  row: {
    backgroundColor: "#2C3E50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  rank: { fontSize: 24, fontWeight: "bold", color: "#FFF", width: 38, textAlign: "center" },
  username: { fontSize: 20, color: "#FFF", flex: 1, marginLeft: 10 },
  points: { fontSize: 18, color: "#FFD700", fontWeight: "bold" },
});

export default LeaderboardScreen;
