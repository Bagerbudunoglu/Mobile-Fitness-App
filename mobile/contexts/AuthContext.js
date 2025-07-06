import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context nesnesi oluşturuyoruz
export const AuthContext = createContext();

// Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        if (role) {
          setUserRole(role);
        }
      } catch (error) {
        console.error("Rol yüklenirken hata:", error);
      }
    };

    loadRole();
  }, []);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
