import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#FFFFFF" },      // cabeçalho branco
        headerTintColor: "#333333",                      // texto escuro
        tabBarStyle: { backgroundColor: "#FFFFFF" },     // barra de abas branca
        tabBarActiveTintColor: "#555555",                // ícone ativo cinza médio
        tabBarInactiveTintColor: "#CCCCCC",              // ícone inativo cinza claro
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Galeria",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}