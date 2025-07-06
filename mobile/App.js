import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { UnreadProvider } from "./contexts/UnreadContext";
import AppNavigator from "./navigation/AppNavigator";


export default function App() {
  return (
    <UnreadProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </UnreadProvider>
  );
}
