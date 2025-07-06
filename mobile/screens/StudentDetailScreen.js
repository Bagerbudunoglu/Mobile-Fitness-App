import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ScrollView
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";

const apiUrl = "http://192.168.135.53:5000"; // IP'yi güncel tut!

const StudentDetailScreen = () => {
  const route = useRoute();
  const { studentId } = route.params;

  const [todayCalories, setTodayCalories] = useState([]);
  const [todayExercises, setTodayExercises] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [scoreInput, setScoreInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tüm verileri topla
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchTodayCalories(),
      fetchTodayExercises(),
      fetchScoreHistory()
    ]);
    setIsLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Aşağı çek-tazele için
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData().finally(() => setRefreshing(false));
  }, [fetchAllData]);

  // Bugünkü yemekler
  const fetchTodayCalories = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/api/trainer/student/${studentId}/today-calories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayCalories(response.data.foods || []);
    } catch (error) {
      Alert.alert("Hata", "Bugünkü yemekler çekilemedi.");
      setTodayCalories([]);
      console.error("❌ Bugünkü yemekler çekilemedi:", error.message);
    }
  };

  // Bugünkü egzersizler
  const fetchTodayExercises = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/api/trainer/student/${studentId}/today-exercises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayExercises(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      Alert.alert("Hata", "Egzersiz verisi çekilemedi.");
      setTodayExercises([]);
      console.error("❌ Egzersiz verisi çekilemedi:", error.message);
    }
  };

  // Puan geçmişi
  const fetchScoreHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/api/trainer/student/${studentId}/scores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScoreHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      Alert.alert("Hata", "Puan geçmişi çekilemedi.");
      setScoreHistory([]);
      console.error("❌ Puan geçmişi çekilemedi:", error.message);
    }
  };

  // Puan kaydet
  const handleScoreSubmit = async () => {
    if (!scoreInput) {
      Alert.alert("Uyarı", "Puan girmelisiniz!");
      return;
    }
    const number = Number(scoreInput);
    if (isNaN(number) || number <= 0) {
      Alert.alert("Uyarı", "Geçerli bir puan girin!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(
        `${apiUrl}/api/trainer/student/${studentId}/score`,
        { score: number },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Başarılı", "Puan başarıyla kaydedildi!");
      setScoreInput("");
      fetchScoreHistory();
    } catch (error) {
      Alert.alert("Hata", "Puan kaydedilemedi.");
      console.error("❌ Puan gönderme hatası:", error.message);
    }
  };

  // Haftalık toplam
  const calculateWeeklyTotal = () => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const weeklyScores = scoreHistory.filter((item) => {
      const scoreDate = new Date(item.date);
      return scoreDate >= sevenDaysAgo && scoreDate <= now;
    });

    return weeklyScores.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>📋 Öğrenci Günlük Kayıtları</Text>

        <Text style={styles.sectionTitle}>🍴 Bugünkü Yiyecek Kayıtları</Text>
        {todayCalories.length === 0 ? (
          <Text style={styles.emptyText}>Yemek kaydı bulunamadı.</Text>
        ) : (
          <FlatList
            data={todayCalories}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardSubText}>
                  {item.name} - {item.grams}g ({item.calories} kcal)
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}

        <Text style={styles.sectionTitle}>🏋️‍♂️ Bugünkü Egzersiz Kayıtları</Text>
        {todayExercises.length === 0 ? (
          <Text style={styles.emptyText}>Bugün için egzersiz kaydı yok.</Text>
        ) : (
          <FlatList
            data={todayExercises}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  {item.exerciseId?.name || "Bilinmeyen Egzersiz"} - {item.sets} set
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}

        <Text style={styles.sectionTitle}>🏆 Haftalık Toplam Puan: {calculateWeeklyTotal()} ⭐</Text>

        <Text style={styles.sectionTitle}>🎯 Geçmiş Puanlar</Text>
        {scoreHistory.length === 0 ? (
          <Text style={styles.emptyText}>Henüz puan verilmemiş.</Text>
        ) : (
          <FlatList
            data={scoreHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  Tarih: {new Date(item.date).toLocaleDateString()} ➔ {item.score} Puan
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}

        <View style={styles.scoreSection}>
          <TextInput
            style={styles.input}
            placeholder="Puan (örn. 10)"
            value={scoreInput}
            onChangeText={setScoreInput}
            keyboardType="numeric"
            placeholderTextColor="#AAA"
          />
          <TouchableOpacity style={styles.scoreButton} onPress={handleScoreSubmit}>
            <Text style={styles.scoreButtonText}>Puanı Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#FFD700", textAlign: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: "#FFF", marginVertical: 10 },
  card: { backgroundColor: "#2C3E50", padding: 15, borderRadius: 10, marginBottom: 10 },
  cardText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  cardSubText: { color: "#CCC", fontSize: 14 },
  emptyText: { color: "#AAA", fontSize: 16, fontStyle: "italic", textAlign: "center", marginVertical: 10 },
  scoreSection: { marginTop: 20, alignItems: "center" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    width: "80%",
    height: 45,
    fontSize: 16,
    marginBottom: 10,
    color: "#000",
  },
  scoreButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  scoreButtonText: {
    color: "#1E1E1E",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StudentDetailScreen;
