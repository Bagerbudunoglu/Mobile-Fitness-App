import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleLogout = async (navigation) => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userRole');

    console.log("✅ Çıkış yapıldı. Token ve rol temizlendi.");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (error) {
    console.error("❌ Çıkış hatası:", error.message);
  }
};
