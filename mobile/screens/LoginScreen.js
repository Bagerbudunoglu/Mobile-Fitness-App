import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import muscleman from "../assets/muscleman.png";
import { handleLogout } from "../utils/logout";

const apiUrl = "http://192.168.135.53:5000"; // ⚠️ IP'ni güncel tut!

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMessage("E-posta alanı boş bırakılamaz!");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Şifre alanı boş bırakılamaz!");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password,
      });

      const { token, role } = response.data;

      if (!token || !role) {
        setErrorMessage("Sunucudan beklenen yanıt alınamadı.");
        return;
      }

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userRole", role);

      // Role-based yönlendirme
      if (role === "member") {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      } else if (role === "trainer") {
        navigation.reset({ index: 0, routes: [{ name: "TrainerHome" }] });
      } else {
        setErrorMessage("Bilinmeyen rol: " + role);
      }

    } catch (error) {
      console.error("❌ Giriş hatası:", error.response?.data?.message || error.message);
      setErrorMessage(
        error.response?.data?.message ||
        "Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin."
      );
      Alert.alert("Giriş Hatası", "E-posta veya şifre hatalı!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        {/* Logo */}
        <Image source={muscleman} style={styles.logo} />

        <Text style={styles.title}>FitnessApp'e Hoşgeldiniz</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {/* E-posta Girişi */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#AAA"
          />
        </View>

        {/* Şifre Girişi */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={24} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#AAA"
          />
        </View>

        {/* Giriş Butonu */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        {/* Kayıt Ol Butonu */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("RegisterScreen")}
        >
          <Text style={styles.registerText}>Hesabın yok mu? Kayıt Ol</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  innerContainer: { width: "90%", alignItems: "center", paddingVertical: 30 },
  logo: { width: 150, height: 150, resizeMode: "contain", marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#FFF", marginBottom: 20, textAlign: "center" },
  errorText: { color: "red", fontSize: 16, marginBottom: 10 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 18, color: "#333" },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  registerButton: { marginTop: 15 },
  registerText: { color: "#FFF", fontSize: 16, textDecorationLine: "underline" },
});

export default LoginScreen;
