import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { handleLogout } from "../utils/logout";

const apiUrl = "http://192.168.135.53:5000"; // ✅ IP adresin
const TOTAL_DAYS = 30; // Streak için gün sayısı

const ProfileScreen = () => {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [streakData, setStreakData] = useState(new Array(TOTAL_DAYS).fill(false));
  const [currentStreak, setCurrentStreak] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
    loadStreakData();
  }, []);

  // Kullanıcı bilgilerini çek
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const response = await axios.get(`${apiUrl}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setNewUsername(response.data.username);
      setNewEmail(response.data.email);
    } catch (error) {
      console.error("Kullanıcı verisi alınamadı:", error);
      Alert.alert("Hata", "Kullanıcı bilgileri yüklenemedi.");
    }
  };

  // Profil bilgilerini güncelle
  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      await axios.put(
        `${apiUrl}/api/auth/update-profile`,
        { username: newUsername, email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi!");
      fetchUserData();
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      Alert.alert("Hata", "Profil güncellenemedi.");
    }
  };

  // Şifreyi güncelle
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Eksik Bilgi", "Lütfen mevcut ve yeni şifreyi girin.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Geçersiz Şifre", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      await axios.put(
        `${apiUrl}/api/auth/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Başarılı", "Şifreniz güncellendi!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Şifre güncelleme hatası:", error);
      Alert.alert("Hata", "Şifre güncellenemedi.");
    }
  };

  // Streak verilerini yükle
  const loadStreakData = async () => {
    try {
      const saved = await AsyncStorage.getItem("streakData");
      if (saved) {
        const parsed = JSON.parse(saved);
        setStreakData(parsed);
        calculateCurrentStreak(parsed);
      }
    } catch (error) {
      console.error("Streak verisi yüklenirken hata:", error);
    }
  };

  // Bugünü tamamla
  const markTodayAsCompleted = async () => {
    try {
      const today = new Date();
      const dayIndex = today.getDate() % TOTAL_DAYS;

      let updatedStreak = [...streakData];
      updatedStreak[dayIndex] = true;

      await AsyncStorage.setItem("streakData", JSON.stringify(updatedStreak));
      setStreakData(updatedStreak);
      calculateCurrentStreak(updatedStreak);

      Alert.alert("Başarılı", "Bugün için streak tamamlandı! 🎯");
    } catch (error) {
      console.error("Bugünü işaretlerken hata:", error);
    }
  };

  // Streak hesaplama
  const calculateCurrentStreak = (data) => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < data.length; i++) {
      const dayIndex = (today.getDate() - i - 1 + TOTAL_DAYS) % TOTAL_DAYS;
      if (data[dayIndex]) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Ionicons name="person-circle" size={100} color="#FFF" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Mevcut Profil Bilgileriniz</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>👤 Kullanıcı Adı: {userData.username}</Text>
          <Text style={styles.infoText}>📧 E-Posta: {userData.email}</Text>
        </View>

        <View style={styles.updateBox}>
          <Text style={styles.sectionTitle}>Bilgilerini Güncelle</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Yeni Kullanıcı Adı"
              placeholderTextColor="#AAA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni E-Posta</Text>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Yeni E-Posta"
              keyboardType="email-address"
              placeholderTextColor="#AAA"
            />
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
            <Text style={styles.updateButtonText}>Profili Güncelle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.updateBox}>
          <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mevcut Şifre</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Mevcut Şifre"
              placeholderTextColor="#AAA"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Yeni Şifre"
              placeholderTextColor="#AAA"
            />
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
            <Text style={styles.updateButtonText}>Şifreyi Güncelle</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 STREAK TAKİBİ */}
        <View style={styles.streakContainer}>
          <Text style={styles.sectionTitle}>STREAK TAKİBİ</Text>
          <View style={styles.daysWrapper}>
            {streakData.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.dayCircle,
                  item ? styles.completedDay : styles.emptyDay,
                ]}
              />
            ))}
          </View>
          <View style={styles.streakInfoContainer}>
            <View style={styles.streakBox}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>STREAK SAYISI</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.completeButton} onPress={markTodayAsCompleted}>
            <Text style={styles.completeButtonText}>🎯 Bugünü Tamamla</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alt Navigasyon Barı */}
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
  container: { flex: 1 },
  scrollContent: { alignItems: "center", paddingBottom: 120 },
  title: { fontSize: 24, color: "#FFF", fontWeight: "bold", marginBottom: 15 },
  infoBox: { backgroundColor: "#FFF", borderRadius: 10, padding: 20, width: "85%", marginBottom: 20 },
  infoText: { fontSize: 16, color: "#333", marginBottom: 10 },
  updateBox: { backgroundColor: "#FFF", borderRadius: 10, padding: 20, width: "85%", marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#4A90E2", marginBottom: 15, textAlign: "center" },
  inputGroup: { marginBottom: 15 },
  label: { color: "#333", fontSize: 16, marginBottom: 5 },
  input: { backgroundColor: "#EEE", borderRadius: 10, padding: 10, color: "#000" },
  updateButton: { backgroundColor: "#4A90E2", padding: 15, borderRadius: 10, marginTop: 10, alignItems: "center" },
  updateButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
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
  mainButton: {
    backgroundColor: "#007bff",
    borderRadius: 25,
    padding: 12,
  },
  streakContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    alignItems: "center",
    marginTop: 20,
  },
  daysWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  dayCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 5,
  },
  completedDay: { backgroundColor: "#00E5FF" },
  emptyDay: { backgroundColor: "#444" },
  streakInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  streakBox: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  streakNumber: { color: "#FFD700", fontSize: 36, fontWeight: "bold" },
  streakLabel: { color: "#FFF", fontSize: 14, marginTop: 5 },
  completeButton: {
    marginTop: 15,
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  completeButtonText: {
    color: "#1E1E1E",
    fontWeight: "bold",
    fontSize: 16,
  },
});
export default ProfileScreen;
