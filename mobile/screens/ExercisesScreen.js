import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleLogout } from "../utils/logout";

const apiUrl = "http://192.168.135.53:5000"; // IP adresini kontrol et!

const muscleGroups = [
  "Chest", "Biceps", "Forearms", "Shoulders", "Abdominals",
  "Quads", "Triceps", "Calves", "Traps", "Glutes", "Lats"
];

const ExercisesScreen = () => {
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState([]);
  const navigation = useNavigation();

  // Egzersizleri çek
  useEffect(() => {
    if (selectedMuscle) {
      (async () => {
        try {
          const token = await AsyncStorage.getItem("authToken");
          if (!token) {
            Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
            navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
            return;
          }
          const res = await axios.get(
            `${apiUrl}/api/exercises?muscle=${selectedMuscle}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setExercises(res.data);
        } catch (err) {
          const msg = err.response?.data?.message || err.message || "Egzersizler alınamadı.";
          Alert.alert("Hata", msg);
          setExercises([]);
        }
      })();
    }
  }, [selectedMuscle, navigation]);

  // Günlük yapılan egzersizleri çek
  useEffect(() => {
    fetchLoggedExercises();
  }, []);

  const fetchLoggedExercises = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      const res = await axios.get(`${apiUrl}/api/exerciselogs/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoggedExercises(res.data.exercises || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Egzersiz geçmişi alınamadı.";
      Alert.alert("Hata", msg);
      setLoggedExercises([]);
    }
  };

  // Egzersizi kaydet
  const handleSaveExercise = async () => {
    if (!sets || isNaN(sets)) {
      Alert.alert("Geçersiz Giriş", "Lütfen geçerli bir set sayısı girin.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
        navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        return;
      }
      await axios.post(
        `${apiUrl}/api/exerciselogs`,
        {
          exerciseId: selectedExercise._id,
          sets: Number(sets),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoggedExercises(prev => [
        ...prev,
        {
          name: selectedExercise.name,
          sets: Number(sets),
        },
      ]);

      Alert.alert("Başarılı", "Egzersiz kaydedildi.");
      setSelectedExercise(null);
      setSets("");
      fetchLoggedExercises();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Egzersiz kaydedilemedi.";
      Alert.alert("Hata", msg);
    }
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!selectedMuscle ? (
          <View style={styles.grid}>
            {muscleGroups.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                style={styles.gridItem}
                onPress={() => setSelectedMuscle(muscle)}
              >
                <Ionicons name="barbell" size={30} color="#4A90E2" style={{ marginBottom: 8 }} />
                <Text style={styles.gridItemText}>{muscle}</Text>
              </TouchableOpacity>
            ))}

            {loggedExercises.length > 0 && (
              <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                  📌 Bugün Yapılan Egzersizler:
                </Text>
                {loggedExercises.map((ex, index) => (
                  <Text key={index} style={{ color: "#CCC", fontSize: 16 }}>
                    {ex.name} - {ex.sets} set
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.exerciseList}>
            <TouchableOpacity onPress={() => setSelectedMuscle(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
              <Text style={styles.backText}>Geri</Text>
            </TouchableOpacity>
            <Text style={styles.header}>{selectedMuscle} Egzersizleri</Text>
            {exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exerciseItem}
                onPress={() => {
                  setSelectedExercise(exercise);
                  setShowFullDescription(false);
                }}
              >
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedExercise} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedExercise && (
              <>
                <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                {selectedExercise.videoUrl ? (
                  <Video
                    source={{ uri: selectedExercise.videoUrl }}
                    useNativeControls
                    resizeMode="contain"
                    style={{ width: 300, height: 200, marginBottom: 10 }}
                  />
                ) : (
                  <Text style={{ color: "#FFF", marginBottom: 10, textAlign: "center" }}>
                    Video mevcut değil.
                  </Text>
                )}
                <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                  <Text
                    style={styles.modalText}
                    numberOfLines={showFullDescription ? undefined : 3}
                  >
                    {selectedExercise.description}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.modalText}>Ekipman: {selectedExercise.equipment}</Text>
                <TextInput
                  placeholder="Set sayısı girin"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={sets}
                  onChangeText={setSets}
                  style={styles.input}
                />
                <TouchableOpacity onPress={handleSaveExercise} style={styles.saveButton}>
                  <Text style={{ color: "#FFF" }}>Kaydet</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedExercise(null)} style={styles.modalClose}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
  scroll: { flexGrow: 1, alignItems: "center", paddingBottom: 60, paddingTop: 30 },
  header: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingHorizontal: 20 },
  gridItem: {
    backgroundColor: "#333",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    margin: 6,
    minWidth: "40%",
    alignItems: "center",
  },
  gridItemText: { color: "#FFF", fontSize: 16, fontWeight: "600", textAlign: "center" },
  exerciseList: { width: "90%" },
  exerciseItem: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
  },
  exerciseName: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#FFF", fontSize: 16, marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#333", borderRadius: 15, padding: 20, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF", marginBottom: 10 },
  modalText: { fontSize: 16, color: "#EEE", textAlign: "center", marginBottom: 10 },
  modalClose: { marginTop: 15 },
  input: {
    backgroundColor: "#444",
    color: "#FFF",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    textAlign: "center",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
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
});

export default ExercisesScreen;
