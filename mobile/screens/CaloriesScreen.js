import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleLogout } from "../utils/logout";
const apiUrl = "http://192.168.135.53:5000";
const CaloriesScreen = () => {
  const navigation = useNavigation();
  const [foodList, setFoodList] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [gramInput, setGramInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [targetCalories, setTargetCalories] = useState("");
  const [mealData, setMealData] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  useEffect(() => {
    fetchFoods();
    fetchTodayLog();
  }, []);

  // Yiyecekleri getir
  const fetchFoods = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const res = await axios.get(`${apiUrl}/api/foods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoodList(res.data);
    } catch (err) {
      if (err.message === "Network Error") {
        Alert.alert(
          "Ağ Hatası",
          "Sunucuya erişilemiyor. Telefonun ve bilgisayarın aynı Wi-Fi'da olduğundan, sunucunun açık ve doğru IP'de çalıştığından emin ol."
        );
      } else {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Yiyecek listesi alınamadı.";
        Alert.alert("Hata", msg);
      }
      console.error("Yiyecek listesi alınamadı:", err);
    }
  };

  // Bugünkü kalori logunu getir
  const fetchTodayLog = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const res = await axios.get(`${apiUrl}/api/calories/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };
      (res.data.foods || []).forEach((f) => {
        if (f.meal && grouped[f.meal]) grouped[f.meal].push(f);
      });
      setMealData(grouped);
    } catch (err) {
      if (err.message === "Network Error") {
        Alert.alert(
          "Ağ Hatası",
          "Sunucuya erişilemiyor. Telefonun ve bilgisayarın aynı Wi-Fi'da olduğundan, sunucunun açık ve doğru IP'de çalıştığından emin ol."
        );
      } else {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Bugünkü kayıtlar çekilemedi.";
        Alert.alert("Hata", msg);
      }
      console.error("Bugünkü kayıtlar çekilemedi:", err);
    }
  };

  const openModal = (meal) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  // Yiyecek ekleme fonksiyonu
  const addFoodToMeal = async () => {
    if (!selectedFood || !gramInput) {
      Alert.alert("Eksik Bilgi", "Lütfen yiyecek ve gramaj girin.");
      return;
    }

    const grams = parseFloat(gramInput);
    const calories = (grams / 100) * selectedFood.caloriesPer100g;
    const foodItem = {
      name: selectedFood.name,
      grams,
      calories: calories.toFixed(2),
      meal: selectedMeal,
    };

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      await axios.post(`${apiUrl}/api/calories/add`, foodItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealData((prev) => ({
        ...prev,
        [selectedMeal]: [...prev[selectedMeal], foodItem],
      }));
    } catch (err) {
      if (err.message === "Network Error") {
        Alert.alert(
          "Ağ Hatası",
          "Sunucuya erişilemiyor. Telefonun ve bilgisayarın aynı Wi-Fi'da olduğundan, sunucunun açık ve doğru IP'de çalıştığından emin ol."
        );
      } else {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Yiyecek kaydedilemedi.";
        Alert.alert("Hata", msg);
      }
      console.error("Yiyecek kaydedilemedi:", err);
    }

    setModalVisible(false);
    setSelectedFood(null);
    setGramInput("");
  };

  const calculateTotalCalories = () => {
    return Object.values(mealData)
      .flat()
      .reduce((sum, item) => sum + parseFloat(item.calories), 0);
  };

  const renderMealItems = (items) =>
    items.length === 0 ? (
      <Text style={styles.emptyText}>Henüz ekleme yapılmadı</Text>
    ) : (
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.foodItem}>
            {item.name} - {item.grams}g ({item.calories} kcal)
          </Text>
        )}
      />
    );

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      {/* Alt navigasyon barı */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Calories")}
        >
          <Ionicons name="fast-food" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.mainButton]}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Exercises")}
        >
          <Ionicons name="barbell" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Messages")}
        >
          <Ionicons name="chatbubbles" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleLogout(navigation)}
        >
          <Ionicons name="log-out" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.innerContainer}>
          <View style={styles.caloriesSection}>
            <Text style={styles.targetLabel}>🎯 Hedef Kalori Belirleyin:</Text>
            <TextInput
              style={styles.targetInput}
              placeholder="örneğin: 2500"
              keyboardType="numeric"
              value={targetCalories}
              onChangeText={setTargetCalories}
              placeholderTextColor="#AAA"
            />
            {targetCalories ? (
              <>
                <Text style={styles.totalCaloriesText}>
                  Alınan Kalori: {calculateTotalCalories().toFixed(2)} / {targetCalories} kcal
                </Text>
                <Progress.Bar
                  progress={Math.min(
                    calculateTotalCalories() / parseFloat(targetCalories),
                    1
                  )}
                  width={250}
                  color={
                    calculateTotalCalories() > parseFloat(targetCalories)
                      ? "#FF5252"
                      : "#00FF00"
                  }
                  borderRadius={10}
                  height={12}
                  unfilledColor="#555"
                  borderColor="#FFF"
                />
              </>
            ) : (
              <Text style={styles.totalCaloriesText}>
                Hedef belirlemeden ilerleme izlenemez.
              </Text>
            )}
          </View>

          {["breakfast", "lunch", "dinner", "snack"].map((meal, index) => (
            <View key={index} style={styles.mealSection}>
              <Text style={styles.mealTitle}>
                {meal === "breakfast"
                  ? "🍳 Kahvaltı"
                  : meal === "lunch"
                  ? "🍽️ Öğle Yemeği"
                  : meal === "dinner"
                  ? "🍲 Akşam Yemeği"
                  : "🍎 Ara Öğün"}
              </Text>
              {renderMealItems(mealData[meal])}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openModal(meal)}
              >
                <Ionicons name="add-circle" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Yiyecek Seç</Text>
              <FlatList
                data={foodList}
                keyExtractor={(item) => item._id}
                style={{ maxHeight: 250 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelectedFood(item)}>
                    <Text
                      style={[
                        styles.foodOption,
                        selectedFood?._id === item._id && {
                          backgroundColor: "#4A90E2",
                          color: "#FFF",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TextInput
                style={styles.input}
                placeholder="Gramaj (örn. 150)"
                value={gramInput}
                onChangeText={setGramInput}
                keyboardType="numeric"
                placeholderTextColor="#AAA"
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={addFoodToMeal}
              >
                <Text style={styles.modalButtonText}>Ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, padding: 20, justifyContent: "center" },
  caloriesSection: {
    marginBottom: 25,
    alignItems: "center",
  },
  targetLabel: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  targetInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    fontSize: 16,
    marginBottom: 15,
    color: "#000",
    width: "80%",
  },
  totalCaloriesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginVertical: 10,
    textAlign: "center",
  },
  mealSection: {
    backgroundColor: "#2C3E50",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 5,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  foodItem: { fontSize: 16, color: "#FFF", marginVertical: 2 },
  emptyText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  addButton: { alignSelf: "flex-end", marginTop: 10 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  foodOption: {
    padding: 12,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    color: "#000",
  },
  modalButton: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: { color: "#FFF", fontWeight: "bold" },
  modalCancel: { alignItems: "center", marginTop: 10 },
  modalCancelText: { color: "#4A90E2", fontWeight: "bold" },
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

export default CaloriesScreen;
