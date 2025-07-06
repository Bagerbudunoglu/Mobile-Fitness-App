import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";

// Ekranlar
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CaloriesScreen from "../screens/CaloriesScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import TrainerHomeScreen from "../screens/TrainerHomeScreen";
import StudentListScreen from "../screens/StudentListScreen";
import StudentDetailScreen from "../screens/StudentDetailScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import MessagesScreen from "../screens/MessagesScreen";    // 👈 Messages ekranını import et
import ChatScreen from "../screens/ChatScreen";            // 👈 Eğer bire bir sohbet ekranı varsa

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { userRole } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Giriş ekranları */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

        {/* Üye (member) ekranları */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Calories" component={CaloriesScreen} />
        <Stack.Screen name="Exercises" component={ExercisesScreen} />

        {/* Antrenör (trainer) ekranları */}
        <Stack.Screen name="TrainerHome" component={TrainerHomeScreen} />
        <Stack.Screen name="StudentList" component={StudentListScreen} />
        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />

        {/* 👇 Mesajlar ekranları */}
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
