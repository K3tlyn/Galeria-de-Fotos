import React, { useCallback, useState } from "react";
import {
  Alert, FlatList, Image, Modal, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase } from "@/database/db";
import PhotosRepository, { PhotoType } from "@/database/repositories/photos.repository";

const repo = new PhotosRepository();
const NUM_COLUMNS = 2;
const CARD_SIZE = (Dimensions.get("window").width - 48) / 2;

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoType | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Estados para preview da imagem
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  function loadPhotos() {
    try {
      setPhotos(repo.getAll());
    } catch {
      Alert.alert("Erro", "Falha ao carregar fotos");
    }
  }

  useFocusEffect(useCallback(() => {
    initDatabase();
    loadPhotos();
  }, []));

  const filtered = photos.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  async function takePhoto() {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) { Alert.alert("Permissão necessária", "Permita o acesso à câmera"); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.7 });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  }

  async function pickFromGallery() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert("Permissão necessária", "Permita o acesso à galeria"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.7 });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  }

  async function savePhoto() {
    if (!title.trim() || !selectedImage) {
      Alert.alert("Ops, algo deu errado", "Preencha o título e selecione uma foto");
      return;
    }
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        Alert.alert("Localização negada", canAskAgain
          ? "Permita o acesso à localização para salvar a posição da foto."
          : "Vá em Ajustes > Privacidade > Localização e permita o acesso ao app."
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
      repo.create({ title, image_uri: selectedImage, latitude, longitude });
      Alert.alert("Sucesso", latitude
        ? `Foto salva com localização!\nLat: ${latitude.toFixed(5)}\nLng: ${longitude?.toFixed(5)}`
        : "Foto salva sem localização."
      );
      setTitle("");
      setSelectedImage(null);
      setModalVisible(false);
      loadPhotos();
    } catch (e: any) {
      Alert.alert("Erro", `Falha ao tentar salvar foto: ${e?.message ?? e}`);
    }
  }

  function deletePhoto(id: number, title: string) {
    Alert.alert("Excluir foto", `Deseja remover "${title}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => { 
          repo.delete(id); 
          loadPhotos();
        } 
      },
    ]);
  }

  function openEditModal(photo: PhotoType) {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditModalVisible(true);
  }

  function saveEdit() {
    if (!editTitle.trim() || !editingPhoto) return;
    try {
      repo.update(editingPhoto.id!, editTitle.trim());
      Alert.alert("Atualizado", "Título atualizado com sucesso!");
      setEditModalVisible(false);
      setEditingPhoto(null);
      loadPhotos();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o título");
    }
  }

  function openImagePreview(uri: string) {
    setPreviewImageUri(uri);
    setPreviewVisible(true);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título..."
          placeholderTextColor="#AAAAAA"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#888888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id!.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {search ? "Nenhuma foto encontrada" : "Nenhuma foto ainda"}
            </Text>
            <Text style={styles.emptySubtext}>
              {search ? `Sem resultados para "${search}"` : "Toque em + para adicionar uma foto!"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onLongPress={() => openImagePreview(item.image_uri)}
            >
              <Image source={{ uri: item.image_uri }} style={styles.cardImg} />
            </TouchableOpacity>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.created_at!).toLocaleDateString("pt-BR")}
              </Text>
              
              {/* Linha com coordenadas, lápis e lixeira */}
              {item.latitude != null && item.longitude != null && (
                <View style={styles.coordsRow}>
                  <View style={styles.coordsTextContainer}>
                    <Text style={styles.cardCoords} numberOfLines={1}>
                      Lat: {item.latitude.toFixed(5)}
                    </Text>
                    <Text style={styles.cardCoords} numberOfLines={1}>
                      Lng: {item.longitude.toFixed(5)}
                    </Text>
                  </View>
                  <View style={styles.actionIcons}>
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => deletePhoto(item.id!, item.title)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {item.latitude == null && (
                <View style={styles.coordsRow}>
                  <Text style={styles.noLocation}>Sem localização</Text>
                  <View style={styles.actionIcons}>
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => deletePhoto(item.id!, item.title)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* Botão FAB quadrado */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal para adicionar nova foto */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Foto</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); setSelectedImage(null); setTitle(""); }}>
              <Ionicons name="close" size={24} color="#888888" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Título da foto..."
            placeholderTextColor="#AAAAAA"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.btn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              <Text style={styles.btnTxt}> Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#888888" }]} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={20} color="#FFFFFF" />
              <Text style={styles.btnTxt}> Galeria</Text>
            </TouchableOpacity>
          </View>

          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="camera" size={48} color="#CCCCCC" />
              <Text style={{ color: "#888888", marginTop: 8 }}>Nenhuma imagem selecionada</Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={savePhoto}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnTxt}> Salvar foto</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Modal para editar título */}
      <Modal visible={editModalVisible} animationType="fade" transparent={true}>
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <Text style={styles.editModalTitle}>Editar título</Text>
            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Novo título"
              placeholderTextColor="#AAAAAA"
              autoFocus
            />
            <View style={styles.editModalButtons}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]} 
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para preview da imagem com zoom */}
      <Modal visible={previewVisible} transparent={true} animationType="fade">
        <View style={styles.previewContainer}>
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setPreviewVisible(false)}>
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent
          >
            <Image
              source={{ uri: previewImageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  searchContainer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF", marginHorizontal: 16, marginVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: "#DDDDDD", paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1, height: 44, color: "#333333", fontSize: 15,
  },

  grid: { paddingHorizontal: 8, paddingBottom: 100 },
  card: {
    width: CARD_SIZE, margin: 8, backgroundColor: "#FFFFFF",
    borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#EEEEEE",
    shadowColor: "#000000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardImg: { width: "100%", height: CARD_SIZE, backgroundColor: "#EEEEEE" },
  cardInfo: { padding: 8 },
  cardTitle: { textAlign: "center", fontWeight: "600", fontSize: 13, color: "#333333" },
  cardDate: { textAlign: "center", fontSize: 11, color: "#888888", marginTop: 2 },
  
  coordsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  coordsTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardCoords: {
    fontSize: 10,
    color: "#666666",
    lineHeight: 14,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  noLocation: {
    fontSize: 10,
    color: "#999999",
    fontStyle: "italic",
    flex: 1,
  },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 120 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#555555", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#888888", marginTop: 8 },

  fab: {
    position: "absolute", 
    bottom: 32, 
    right: 24,
    width: 56, 
    height: 56,
    backgroundColor: "#333333",
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: "#000000", 
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    elevation: 4,
    borderRadius: 12,
  },

  modal: { flex: 1, backgroundColor: "#F5F5F5", padding: 20 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#333333" },

  input: {
    backgroundColor: "#FFFFFF", height: 50, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#DDDDDD", color: "#333333",
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  btn: {
    flex: 1, backgroundColor: "#666666", height: 46,
    borderRadius: 12, justifyContent: "center", alignItems: "center",
    flexDirection: "row",
  },
  btnTxt: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },

  preview: {
    width: "100%", height: 220, borderRadius: 14,
    marginBottom: 20, backgroundColor: "#EEEEEE",
  },
  previewPlaceholder: {
    width: "100%", height: 220, borderRadius: 14, marginBottom: 20,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDDDDD",
    justifyContent: "center", alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#333333", height: 52, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 4,
    flexDirection: "row",
  },
  saveBtnTxt: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  // Estilos do modal de edição
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333333",
    marginBottom: 20,
  },
  editModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  cancelButtonText: {
    color: "#666666",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Estilos do preview com zoom
  previewContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  scrollViewContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});