import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../components/api';

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagemTemp, setImagemTemp] = useState<number | null>(null);
  const [avatarBackgroundColorTemp, setAvatarBackgroundColorTemp] =
    useState('#FFFFFF');
  const [perfil, setPerfil] = useState({
    nome: '',
    altura: 0,
    peso: 0,
    imc: 0,
    idade: 0,
    tipo_dieta: '',
    restricoes_alimentares: '',
  });

  const [imagem, setImagem] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('imagem');
  const [avatarBackgroundColor, setAvatarBackgroundColor] = useState('#FFFFFF');

  const preSelectedImages = [
    require('./img/avatar1.png'),
    require('./img/avatar2.png'),
    require('./img/avatar3.png'),
    require('./img/avatar4.png'),
    require('./img/avatar5.png'),
    require('./img/avatar6.png'),
  ];

  const avatarColors = [
    { name: 'Branco', color: '#FFFFFF' },
    { name: 'Verde Claro', color: '#A8E6CF' },
    { name: 'Azul Claro', color: '#A8D8EA' },
    { name: 'Rosa Claro', color: '#FFB6C1' },
    { name: 'Amarelo', color: '#FFE156' },
    { name: 'Roxo Claro', color: '#DDA0DD' },
    { name: 'Laranja', color: '#FFB347' },
    { name: 'Cinza', color: '#C0C0C0' },
    { name: 'Vermelho', color: '#FF6B6B' },
    { name: 'Verde', color: '#4CAF50' },
    { name: 'Azul', color: '#4A90E2' },
    { name: 'Rosa Pink', color: '#FF69B4' },
  ];

  const carregarAvatar = async () => {
    try {
      const imagemSalva = await AsyncStorage.getItem('avatarImagem');
      const corSalva = await AsyncStorage.getItem('avatarCor');

      if (imagemSalva !== null && imagemSalva !== '') {
        setImagem(parseInt(imagemSalva));
      }
      if (corSalva !== null) {
        setAvatarBackgroundColor(corSalva);
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  useEffect(() => {
    carregarPerfil();
    carregarAvatar();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const carregarPerfil = async () => {
    try {
      setLoading(true);

      const data = await api.get('/perfil.php');

      if (data.nome) {
        setPerfil({
          nome: data.nome,
          altura: data.altura,
          peso: parseFloat(data.peso),
          imc: parseFloat(data.imc),
          idade: data.idade,
          tipo_dieta: formatarTipoDieta(data.tipo_dieta),
          restricoes_alimentares: formatarRestricoes(
            data.restricoes_alimentares
          ),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarTipoDieta = (tipo: string) => {
    if (
      !tipo ||
      tipo === 'nenhuma' ||
      tipo === 'Nenhum tipo de dieta foi registrado.'
    ) {
      return 'Nenhum tipo de dieta foi registrado.';
    }

    const tipos = {
      low_carb: 'Low Carb',
      cetogenica: 'Cetogênica',
      mediterranea: 'Mediterrânea',
      vegana: 'Vegana',
      vegetariana: 'Vegetariana',
      paleolitica: 'Paleolítica',
      dieta_das_zonas: 'Dieta das Zonas',
    };
    return tipos[tipo] || tipo;
  };

  const formatarRestricoes = (restricao: string) => {
    if (
      !restricao ||
      restricao.toLowerCase() === 'nenhum' ||
      restricao.toLowerCase() === 'nenhuma'
    ) {
      return 'Nenhuma restrição alimentar foi registrada.';
    }
    return restricao;
  };

  const getStatusIMC = (imc: number) => {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso Ideal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidade';
  };

  const pickImage = () => {
    setImagemTemp(imagem);
    setAvatarBackgroundColorTemp(avatarBackgroundColor);
    setActiveTab('imagem');
    setModalVisible(true);
  };

  const selectImage = (imageIndex: number) => {
    setImagemTemp(imageIndex);
  };

  const selectAvatarColor = (color: string) => {
    setAvatarBackgroundColorTemp(color);
  };

  const confirmarAvatar = async () => {
    setImagem(imagemTemp);
    setAvatarBackgroundColor(avatarBackgroundColorTemp);
    setModalVisible(false);

    try {
      await AsyncStorage.setItem(
        'avatarImagem',
        imagemTemp !== null ? imagemTemp.toString() : ''
      );
      await AsyncStorage.setItem('avatarCor', avatarBackgroundColorTemp);
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backButtonBackground} />
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="white" />
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {}
          <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: avatarBackgroundColor },
              ]}
            >
              <Image
                style={styles.avatarImage}
                source={
                  imagem !== null
                    ? preSelectedImages[imagem]
                    : require('./img/proxy-image.jpg')
                }
              />
            </View>
            <View style={styles.editIcon}>
              <Text style={styles.editIconText}>✏️</Text>
            </View>
          </TouchableOpacity>

          {}
          <Text style={styles.nomeUsuario}>{perfil.nome}</Text>

          {}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📏</Text>
              <Text style={styles.infoLabel}>Altura:</Text>
              <Text style={styles.infoValue}>{perfil.altura / 100}m</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🎂</Text>
              <Text style={styles.infoLabel}>Idade:</Text>
              <Text style={styles.infoValue}>{perfil.idade} anos</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⚖️</Text>
              <Text style={styles.infoLabel}>Peso:</Text>
              <Text style={styles.infoValue}>{perfil.peso}kg</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📊</Text>
              <Text style={styles.infoLabel}>IMC:</Text>
              <Text style={styles.infoValue}>{perfil.imc.toFixed(1)}</Text>
              <Text style={styles.infoSubtext}>{getStatusIMC(perfil.imc)}</Text>
            </View>
          </View>

          {}
          <View style={styles.restricaoCard}>
            <Text style={styles.restricaoIcon}>🚫</Text>
            <View style={styles.restricaoContent}>
              <Text style={styles.restricaoLabel}>Restrição Alimentar:</Text>
              <Text style={styles.restricaoValue}>
                {perfil.restricoes_alimentares} {}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.alimentacaoCard}>
            <Text style={styles.alimentacaoIcon}>🍽️</Text>
            <View style={styles.alimentacaoContent}>
              <Text style={styles.alimentacaoLabel}>Tipo de Alimentação:</Text>
              <Text style={styles.alimentacaoValue}>{perfil.tipo_dieta}</Text>
            </View>
          </View>

          {}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              router.push('/editarPerfil');
            }}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Sair da Conta',
                'Tem certeza que deseja sair da sua conta?',
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel',
                  },
                  {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                      await AsyncStorage.clear();
                      router.replace('/');
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✨ Personalizar Avatar</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'imagem' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('imagem')}
              >
                <Text style={styles.tabIcon}>🖼️</Text>
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'imagem' && styles.tabButtonTextActive,
                  ]}
                >
                  Imagens
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'cor' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('cor')}
              >
                <Text style={styles.tabIcon}>🎨</Text>
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'cor' && styles.tabButtonTextActive,
                  ]}
                >
                  Cor de Fundo
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 'imagem' ? (
                <View style={styles.imageGrid}>
                  {preSelectedImages.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectImage(index)}
                      style={styles.imageOption}
                    >
                      <View
                        style={[
                          styles.thumbnailContainer,
                          { backgroundColor: avatarBackgroundColorTemp },
                          imagemTemp === index && styles.thumbnailSelected,
                        ]}
                      >
                        <Image source={img} style={styles.thumbnailImg} />
                        {imagemTemp === index && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.colorGrid}>
                  {avatarColors.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectAvatarColor(item.color)}
                      style={styles.colorOption}
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: item.color },
                          avatarBackgroundColorTemp === item.color &&
                            styles.colorCircleSelected,
                        ]}
                      >
                        {avatarBackgroundColorTemp === item.color && (
                          <Text style={styles.colorCheckmark}>✓</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.colorName,
                          avatarBackgroundColorTemp === item.color &&
                            styles.colorNameSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={confirmarAvatar}
              >
                <Text style={styles.saveButtonText}>✓ Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕ Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    width: '100%',
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#007912',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  backButtonBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#ecfcec',
    zIndex: 9,
  },
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 85,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#4CAF50',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  editIconText: {
    fontSize: 18,
  },
  nomeUsuario: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSubtext: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
  },
  restricaoCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  restricaoIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  restricaoContent: {
    flex: 1,
  },
  restricaoLabel: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restricaoValue: {
    fontSize: 14,
    color: '#C62828',
  },
  alimentacaoCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  alimentacaoIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  alimentacaoContent: {
    flex: 1,
  },
  alimentacaoLabel: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  alimentacaoValue: {
    fontSize: 14,
    color: '#1976D2',
  },
  editButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
    paddingTop: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 10,
  },
  imageOption: {
    margin: 5,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailSelected: {
    borderColor: '#4CAF50',
    borderWidth: 4,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 10,
  },
  colorOption: {
    alignItems: 'center',
    margin: 8,
    width: 85,
  },
  colorCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  colorCircleSelected: {
    borderWidth: 5,
    borderColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
  },
  colorCheckmark: {
    fontSize: 30,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  colorName: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    color: '#666',
  },
  colorNameSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
