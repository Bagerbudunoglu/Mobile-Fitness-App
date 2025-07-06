import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { handleLogout } from "../utils/logout";
import { LinearGradient } from "expo-linear-gradient";

const TrainerHomeScreen = () => {
  const navigation = useNavigation();

  // Güvenli logout
  const safeLogout = async () => {
    try {
      await handleLogout(navigation);
    } catch (e) {
      Alert.alert("Hata", "Çıkış yapılamadı!");
    }
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>🏋️ Trainer Anasayfa</Text>
        <Text style={styles.subtitle}>
          Öğrencilerini yönet, puan ver, ilerlemeyi takip et!
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("StudentList")}
        >
          <Text style={styles.primaryButtonText}>Öğrencilerimi Listele</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={safeLogout}
        >
          <Text style={styles.secondaryButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* ALT NAVBAR */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Messages")}
        >
          <LinearGradient
            colors={["#FFD700", "#FFEA70"]}
            style={styles.iconBg}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Text style={{ color: "#222", fontWeight: "bold", fontSize: 18 }}>💬</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.mainButton]}
          onPress={() => navigation.navigate("TrainerHome")}
        >
          <LinearGradient
            colors={["#4A90E2", "#355C7D"]}
            style={styles.iconBg}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 20 }}>🏠</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={safeLogout}
        >
          <LinearGradient
            colors={["#FF5252", "#FF867F"]}
            style={styles.iconBg}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 20 }}>🚪</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  primaryButtonText: {
    color: "#1E1E1E",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  secondaryButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#222",
    paddingVertical: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  mainButton: {
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 25,
  },
  iconBg: {
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
    minHeight: 48,
  },
});

export default TrainerHomeScreen;
