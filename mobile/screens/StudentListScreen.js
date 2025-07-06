import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const apiUrl = "http://192.168.135.53:5000"; // 🔥 Sunucu IP'ni güncel tut

const StudentListScreen = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Öğrencileri çek
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/api/trainer/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      Alert.alert("Hata", "Öğrenci listesi alınamadı.");
      setStudents([]);
      console.error("❌ Öğrenci çekme hatası:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Aşağı çek - tazele
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents().finally(() => setRefreshing(false));
  }, [fetchStudents]);

  const renderStudent = ({ item }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => navigation.navigate("StudentDetail", { studentId: item._id })}
    >
      <Text style={styles.studentName}>{item.username}</Text>
      <Text style={styles.studentEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Öğrencilerim</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz öğrenci yok.</Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyText: {
    color: "#AAA",
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
  studentCard: {
    backgroundColor: "#2C3E50",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },
  studentName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  studentEmail: {
    color: "#CCC",
    fontSize: 14,
    marginTop: 5,
  },
});
export default StudentListScreen;
