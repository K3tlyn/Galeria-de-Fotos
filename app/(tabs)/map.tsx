import React, { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View, Platform } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase } from "@/database/db";
import PhotosRepository, { PhotoType } from "@/database/repositories/photos.repository";

const repo = new PhotosRepository();

function spreadOverlapping(photos: PhotoType[]): (PhotoType & { displayLat: number; displayLng: number })[] {
  const seen = new Map<string, number>();
  return photos.map((p) => {
    const key = `${p.latitude!.toFixed(5)},${p.longitude!.toFixed(5)}`;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    const angle = (count * 137.5 * Math.PI) / 180;
    const radius = count === 0 ? 0 : 0.0002 * Math.sqrt(count);
    return {
      ...p,
      displayLat: p.latitude! + radius * Math.cos(angle),
      displayLng: p.longitude! + radius * Math.sin(angle),
    };
  });
}

export default function MapScreen() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mapKey, setMapKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      initDatabase();
      try {
        const all = repo.getAll();
        setPhotos(all.filter((p) => p.latitude != null && p.longitude != null));
      } catch (error) {
        console.error("Erro ao carregar fotos:", error);
      }
      setMapKey((k) => k + 1);
    }, [])
  );

  const spread = spreadOverlapping(photos);

  const initialRegion =
    photos.length > 0
      ? {
          latitude: photos[0].latitude!,
          longitude: photos[0].longitude!,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : {
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 10,
          longitudeDelta: 10,
        };

  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Nenhuma foto com localização</Text>
          <Text style={styles.emptyText}>
            Adicione fotos com localização na aba Galeria para vê-las aqui
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        key={mapKey}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {spread.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.displayLat,
              longitude: photo.displayLng,
            }}
            title={photo.title}
            description={new Date(photo.created_at!).toLocaleDateString("pt-BR")}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Image
                  source={{ uri: photo.image_uri }}
                  style={styles.calloutImg}
                  resizeMode="cover"
                />
                <Text style={styles.calloutTitle}>{photo.title}</Text>
                <Text style={styles.calloutDate}>
                  {new Date(photo.created_at!).toLocaleDateString("pt-BR")}
                </Text>
                <Text style={styles.calloutCoords}>
                  Lat: {photo.latitude?.toFixed(5)}
                </Text>
                <Text style={styles.calloutCoords}>
                  Lng: {photo.longitude?.toFixed(5)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  map: { flex: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    lineHeight: 20,
  },
  callout: {
    width: 180,
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  calloutImg: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#EEEEEE",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: "#333333",
    marginBottom: 2,
  },
  calloutDate: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 4,
  },
  calloutCoords: {
    fontSize: 10,
    color: "#888888",
    textAlign: "center",
  },
});