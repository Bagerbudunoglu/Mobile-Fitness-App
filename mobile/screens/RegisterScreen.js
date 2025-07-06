import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, Modal, Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; 
import axios from "axios";

const apiUrl = "http://192.168.135.53:5000"; // ✅ IP'ni güncel tut

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member"); 
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [selectedTrainerName, setSelectedTrainerName] = useState("");
  const [trainerModalVisible, setTrainerModalVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (role === "member") {
      fetchTrainers();
    }
  }, [role]);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/auth/trainers`);
      setTrainers(response.data);
    } catch (error) {
      Alert.alert("Hata", "Trainer listesi çekilemedi. Sunucuya ulaşılamıyor.");
      setTrainers([]);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Tüm alanları doldurun!");
      return;
    }
    if (password.length < 5) {
      setErrorMessage("Şifre en az 5 karakter olmalı!");
      return;
    }
    if (role === "member" && !selectedTrainerId) {
      Alert.alert("Uyarı", "Bir Trainer seçmediniz. Devam etmek istiyor musunuz?", [
        { text: "İptal", style: "cancel" },
        { text: "Devam Et", style: "default", onPress: () => submitRegister() }
      ]);
      return;
    }
    submitRegister();
  };

  const submitRegister = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        username,
        email,
        password,
        role,
        trainerId: role === "member" ? selectedTrainerId : null,
      });

      Alert.alert("Kayıt Başarılı", "Giriş yapabilirsiniz!");
      navigation.goBack();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      Alert.alert("Kayıt Hatası", error.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
        
        <Text style={styles.title}>Kayıt Ol</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={24} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#AAA"
          />
        </View>

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

        {/* Rol Seçimi */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === "member" && styles.selectedRole]}
            onPress={() => setRole("member")}
          >
            <Text style={[styles.roleButtonText, role === "member" && { color: "#FFF" }]}>Üye Kaydı</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === "trainer" && styles.selectedRole]}
            onPress={() => {
              setRole("trainer");
              setSelectedTrainerId(null);
              setSelectedTrainerName("");
            }}
          >
            <Text style={[styles.roleButtonText, role === "trainer" && { color: "#FFF" }]}>Trainer Kaydı</Text>
          </TouchableOpacity>
        </View>

        {/* Trainer seçimi sadece 'member' ise göster */}
        {role === "member" && (
          <>
            <TouchableOpacity 
              style={styles.trainerSelectButton}
              onPress={() => setTrainerModalVisible(true)}
            >
              <Text style={styles.trainerSelectText}>
                {selectedTrainerId 
                  ? `Trainer: ${selectedTrainerName || "Seçildi"} ✅` 
                  : "Trainer İstemiyorum veya Seç"
                }
              </Text>
            </TouchableOpacity>

            {/* Trainer Seçimi Modalı */}
            <Modal visible={trainerModalVisible} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Trainer Seçin</Text>

                  <FlatList
                    data={trainers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.trainerOption}
                        onPress={() => {
                          setSelectedTrainerId(item._id);
                          setSelectedTrainerName(item.username);
                          setTrainerModalVisible(false);
                        }}
                      >
                        <Text style={styles.trainerOptionText}>{item.username}</Text>
                      </TouchableOpacity>
                    )}
                    ListFooterComponent={
                      <TouchableOpacity
                        style={[styles.trainerOption, { backgroundColor: "#FF5252" }]}
                        onPress={() => {
                          setSelectedTrainerId(null);
                          setSelectedTrainerName("");
                          setTrainerModalVisible(false);
                        }}
                      >
                        <Text style={styles.trainerOptionText}>Trainer İstemiyorum</Text>
                      </TouchableOpacity>
                    }
                  />
                </View>
              </View>
            </Modal>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.registerText}>Zaten bir hesabın var mı? Giriş Yap</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  innerContainer: { width: "90%", alignItems: "center", paddingVertical: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFF", marginBottom: 20, textAlign: "center" },
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
  roleContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20, marginTop: 10 },
  roleButton: { backgroundColor: "#FFF", paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 5, borderRadius: 20 },
  selectedRole: { backgroundColor: "#4A90E2" },
  roleButtonText: { color: "#333", fontWeight: "bold" },
  button: { width: "100%", padding: 15, backgroundColor: "#007bff", alignItems: "center", borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  registerButton: { marginTop: 15 },
  registerText: { color: "#FFF", fontSize: 16, textDecorationLine: "underline" },

  trainerSelectButton: { backgroundColor: "#FFD700", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginBottom: 20 },
  trainerSelectText: { fontSize: 16, fontWeight: "bold", color: "#1E1E1E" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, width: "80%", maxHeight: "80%" },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  trainerOption: { backgroundColor: "#4A90E2", padding: 15, borderRadius: 10, marginVertical: 5 },
  trainerOptionText: { color: "#FFF", fontSize: 16, textAlign: "center" },
});

export default RegisterScreen;
