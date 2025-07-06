import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import io from "socket.io-client";
import { useNavigation, useRoute } from "@react-navigation/native";
import { handleLogout } from "../utils/logout";

const apiUrl = "http://192.168.135.53:5000";

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [role, setRole] = useState(""); // 👈 Rolü burada tut
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Oturum süresi doldu", "Lütfen tekrar giriş yapın.");
          navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
          return;
        }

        const userData = await axios.get(`${apiUrl}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;

        setCurrentUserId(userData.data._id);
        setRole(userData.data.role); // 👈 Rolü burada set et

        const msgRes = await axios.get(`${apiUrl}/api/messages/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;
        setMessages(msgRes.data);

        socketRef.current = io(apiUrl, {
          transports: ["websocket"],
          forceNew: true,
        });
        socketRef.current.emit("register", userData.data._id);

        socketRef.current.on("newMessage", (msg) => {
          if (
            (msg.senderId === userId && msg.receiverId === userData.data._id) ||
            (msg.senderId === userData.data._id && msg.receiverId === userId)
          ) {
            setMessages((prev) => [...prev, msg]);
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        });
      } catch (err) {
        if (err.message === "Network Error") {
          Alert.alert("Ağ Hatası", "Sunucuya erişilemiyor.");
        } else {
          Alert.alert("Hata", err.response?.data?.message || err.message);
        }
        console.error("Chat açılırken hata:", err);
      }
    })();
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, navigation]);

  const handleSend = () => {
    if (!inputText.trim() || !currentUserId) return;
  
    const msg = {
      senderId: currentUserId,
      receiverId: userId,
      text: inputText.trim(),
    };
  
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", msg);
    }
  
    setInputText(""); // sadece inputu temizle, listeye ekleme
  };
  

  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={isMe ? styles.myText : styles.otherText}>{item.text}</Text>
          <Text style={styles.timeText}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString().slice(0, 5)
              : ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#4A90E2"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{username || "Sohbet"}</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          ref={flatListRef}
          contentContainerStyle={styles.flatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={styles.emptyText}>Henüz mesaj yok.</Text>}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={[styles.inputBar, { marginBottom: 70 }]}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Mesaj yaz..."
              placeholderTextColor="#AAA"
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* ALT NAVIGATION BAR */}
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
            onPress={() =>
              navigation.navigate(role === "trainer" ? "TrainerHome" : "Home")
            }
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
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: "#444",
    marginBottom: 5,
  },
  headerText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 10,
  },
  flatList: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "flex-end",
  },
  emptyText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 3,
    maxWidth: "85%",
  },
  messageRight: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  messageLeft: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 2,
    maxWidth: 260,
    minWidth: 50,
  },
  myBubble: {
    backgroundColor: "#FFD700",
    alignSelf: "flex-end",
  },
  otherBubble: {
    backgroundColor: "#2C3E50",
    alignSelf: "flex-start",
  },
  myText: { color: "#1E1E1E", fontSize: 16 },
  otherText: { color: "#FFF", fontSize: 16 },
  timeText: {
    fontSize: 11,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    backgroundColor: "#182846",
    borderTopWidth: 0.5,
    borderColor: "#444",
  },
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#000",
    height: 44,
    marginRight: 7,
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
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

export default ChatScreen;
