import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../components/api';

interface JejumData {
  horaInicio: string;
  duracaoHoras: number;
  duracaoMinutos: number;
}

export default function Jejum() {
  const [loading, setLoading] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [jejumStarted, setJejumStarted] = useState(false);
  const [jejumTime, setJejumTime] = useState({ hours: 9, minutes: 0 });
  const [tempoRestante, setTempoRestante] = useState('00:00:00');
  const [horaProximaRefeicao, setHoraProximaRefeicao] = useState('--:--');

  useEffect(() => {
    carregarStatusJejum();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (jejumStarted) {
      calcularTempoRestante();
      interval = setInterval(() => {
        calcularTempoRestante();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jejumStarted]);

  const carregarStatusJejum = async () => {
    try {
      const data = await api.get('/jejum.php');

      if (data.mensagem && !data.erro) {
        const jejumAtivo = data.jejum_ativo;

        if (jejumAtivo === null || jejumAtivo === false) {
          setTermsAccepted(false);
          setShowTerms(false);
        } else {
          setTermsAccepted(true);
          await verificarSessaoJejum();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar jejum:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarSessaoJejum = async () => {
    try {
      const jejumData = await AsyncStorage.getItem('jejumData');
      if (jejumData) {
        const data: JejumData = JSON.parse(jejumData);
        const horaInicio = new Date(data.horaInicio);
        const agora = new Date();
        const duracaoMs =
          (data.duracaoHoras * 60 + data.duracaoMinutos) * 60 * 1000;
        const fimJejum = new Date(horaInicio.getTime() + duracaoMs);

        if (agora < fimJejum) {
          setJejumTime({
            hours: data.duracaoHoras,
            minutes: data.duracaoMinutos,
          });
          setJejumStarted(true);
        } else {
          await AsyncStorage.removeItem('jejumData');
          setJejumStarted(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  const calcularTempoRestante = async () => {
    try {
      const jejumData = await AsyncStorage.getItem('jejumData');
      if (!jejumData) return;

      const data: JejumData = JSON.parse(jejumData);
      const horaInicio = new Date(data.horaInicio);
      const agora = new Date();
      const duracaoMs =
        (data.duracaoHoras * 60 + data.duracaoMinutos) * 60 * 1000;
      const fimJejum = new Date(horaInicio.getTime() + duracaoMs);
      const diff = fimJejum.getTime() - agora.getTime();

      if (diff <= 0) {
        await AsyncStorage.removeItem('jejumData');
        setJejumStarted(false);
        setTempoRestante('00:00:00');
        setHoraProximaRefeicao('--:--');
        return;
      }

      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);

      setTempoRestante(
        `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
      );

      const horaRefeicao = fimJejum.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setHoraProximaRefeicao(horaRefeicao);
    } catch (error) {
      console.error('Erro ao calcular tempo:', error);
    }
  };

  const handleStartJejum = async () => {
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }

    try {
      const agora = new Date();
      const jejumData: JejumData = {
        horaInicio: agora.toISOString(),
        duracaoHoras: jejumTime.hours,
        duracaoMinutos: jejumTime.minutes,
      };

      await AsyncStorage.setItem('jejumData', JSON.stringify(jejumData));

      setJejumStarted(true);
      Alert.alert(
        '✅ Jejum Iniciado',
        `Sua próxima refeição será em ${jejumTime.hours}h${jejumTime.minutes > 0 ? jejumTime.minutes + 'min' : ''}`
      );
    } catch (error) {
      console.error('Erro ao iniciar jejum:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o jejum');
    }
  };

  const handleStopJejum = () => {
    setShowStopModal(true);
  };

  const confirmarPararJejum = async () => {
    try {
      await AsyncStorage.removeItem('jejumData');
      setJejumStarted(false);
      setTempoRestante('00:00:00');
      setHoraProximaRefeicao('--:--');
      setShowStopModal(false);
    } catch (error) {
      console.error('Erro ao parar jejum:', error);
      Alert.alert('Erro', 'Não foi possível parar o jejum');
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const data = await api.put('/jejum.php', { jejum_ativo: 1 });

      if (data.mensagem && !data.erro) {
        setTermsAccepted(true);
        setShowTerms(false);
        handleStartJejum();
      }
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
    }
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    router.back();
  };

  const handleDesativarJejum = () => {
    setShowDeactivateModal(true);
  };

  const confirmarDesativarJejum = async () => {
    try {
      const data = await api.put('/jejum.php', { jejum_ativo: 0 });

      if (data.mensagem && !data.erro) {
        await AsyncStorage.removeItem('jejumData');
        setTermsAccepted(false);
        setJejumStarted(false);
        setShowDeactivateModal(false);
        router.push('/home');
      }
    } catch (error) {
      console.error('Erro ao desativar jejum:', error);
      setShowDeactivateModal(false);
    }
  };

  const adjustTime = (type: 'hours' | 'minutes', increment: number) => {
    setJejumTime(prev => {
      let newHours = prev.hours;
      let newMinutes = prev.minutes;

      if (type === 'hours') {
        newHours = Math.max(0, Math.min(23, prev.hours + increment));
      } else {
        newMinutes = Math.max(0, Math.min(59, prev.minutes + increment));
      }

      return { hours: newHours, minutes: newMinutes };
    });
  };

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⏰ Jejum</Text>
        <View style={styles.placeholder} />
      </View>

      {}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {}
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>
              ⏰ Controle de Jejum Intermitente
            </Text>
            <Text style={styles.cardSubtitle}>
              Gerencie seu tempo de jejum e controle suas refeições
            </Text>
          </View>

          {}
          {!jejumStarted && (
            <>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Duração do Jejum:</Text>

                <View style={styles.timePickerContainer}>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity onPress={() => adjustTime('hours', 1)}>
                      <Text style={styles.arrowButton}>▲</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDisplay}>
                      {formatTime(jejumTime.hours)}
                    </Text>
                    <TouchableOpacity onPress={() => adjustTime('hours', -1)}>
                      <Text style={styles.arrowButton}>▼</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeLabel}>horas</Text>
                  </View>

                  <Text style={styles.timeSeparator}>:</Text>

                  <View style={styles.timeColumn}>
                    <TouchableOpacity onPress={() => adjustTime('minutes', 1)}>
                      <Text style={styles.arrowButton}>▲</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDisplay}>
                      {formatTime(jejumTime.minutes)}
                    </Text>
                    <TouchableOpacity onPress={() => adjustTime('minutes', -1)}>
                      <Text style={styles.arrowButton}>▼</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeLabel}>minutos</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>
                    Fazer refeições a cada {jejumTime.hours}h
                    {jejumTime.minutes > 0 && `${jejumTime.minutes}min`}
                  </Text>
                </View>
              </View>

              {}
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartJejum}
              >
                <Text style={styles.startButtonIcon}>▶</Text>
                <Text style={styles.startButtonText}>Iniciar Jejum</Text>
              </TouchableOpacity>
            </>
          )}

          {}
          {jejumStarted && (
            <>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Jejum em Andamento</Text>

                <View style={styles.clockContainer}>
                  <View style={styles.clockCircle}>
                    <Text style={styles.clockText}>⏰</Text>
                  </View>
                </View>

                <View style={styles.timeRemainingBox}>
                  <Text style={styles.timeRemainingLabel}>Tempo Restante:</Text>
                  <Text style={styles.timeRemainingValue}>{tempoRestante}</Text>
                </View>

                <View style={styles.nextMealBox}>
                  <Text style={styles.nextMealIcon}>🍽️</Text>
                  <View style={styles.nextMealInfo}>
                    <Text style={styles.nextMealLabel}>Próxima Refeição:</Text>
                    <Text style={styles.nextMealTime}>
                      {horaProximaRefeicao}
                    </Text>
                  </View>
                </View>
              </View>

              {}
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopJejum}
              >
                <Text style={styles.stopButtonIcon}>⏹</Text>
                <Text style={styles.stopButtonText}>Parar Jejum</Text>
              </TouchableOpacity>
            </>
          )}

          {}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>
              💡 Dicas sobre Jejum Intermitente
            </Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💧</Text>
              <Text style={styles.tipText}>
                Mantenha-se hidratado durante o jejum
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>⚠️</Text>
              <Text style={styles.tipText}>
                Consulte seu nutricionista antes de iniciar
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🎯</Text>
              <Text style={styles.tipText}>
                Seja consistente com seus horários
              </Text>
            </View>
          </View>

          {}
          {termsAccepted && (
            <TouchableOpacity
              onPress={handleDesativarJejum}
              style={styles.deactivateButton}
            >
              <Text style={styles.deactivateIcon}>🔒</Text>
              <Text style={styles.deactivateButtonText}>
                Desativar funcionalidade de jejum
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showStopModal}
        onRequestClose={() => setShowStopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⏹️</Text>
            </View>

            <Text style={styles.modalTitle}>Parar Jejum</Text>

            <Text style={styles.termsText}>
              Deseja realmente parar o jejum? O contador será resetado.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: '#F44336' }]}
                onPress={confirmarPararJejum}
              >
                <Text style={styles.acceptButtonText}>Parar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => setShowStopModal(false)}
              >
                <Text style={styles.declineButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeactivateModal}
        onRequestClose={() => setShowDeactivateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⚠️</Text>
            </View>

            <Text style={styles.modalTitle}>Desativar Jejum</Text>

            <Text style={styles.termsText}>
              Deseja desativar completamente a funcionalidade de jejum? Você
              precisará aceitar os termos novamente para reativar.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: '#F44336' }]}
                onPress={confirmarDesativarJejum}
              >
                <Text style={styles.acceptButtonText}>Desativar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => setShowDeactivateModal(false)}
              >
                <Text style={styles.declineButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTerms}
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⚠️</Text>
            </View>

            <Text style={styles.modalTitle}>Termo de Ciência</Text>

            <ScrollView
              style={styles.termsScroll}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.termsText}>
                A funcionalidade de jejum vem desativada por padrão, pois, se
                mal utilizada, pode gerar resultados indesejáveis. Por exemplo,
                o efeito sanfona.
              </Text>
              <Text style={styles.termsText}>
                Antes de ativá-la, certifique-se de que o jejum foi recomendado
                por seu nutricionista e de que você está ciente de que a
                responsabilidade pelo uso da funcionalidade é inteiramente sua.
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptTerms}
              >
                <Text style={styles.acceptButtonText}>✓ Prosseguir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={handleDeclineTerms}
              >
                <Text style={styles.declineButtonText}>← Voltar ao início</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 25,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 15,
  },
  mainCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  timeColumn: {
    alignItems: 'center',
  },
  arrowButton: {
    fontSize: 24,
    color: '#4CAF50',
    padding: 8,
    fontWeight: 'bold',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginVertical: 5,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginHorizontal: 15,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  clockContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  clockCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  clockText: {
    fontSize: 60,
  },
  timeRemainingBox: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  timeRemainingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeRemainingValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4CAF50',
    fontFamily: 'monospace',
  },
  nextMealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
  },
  nextMealIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  nextMealInfo: {
    flex: 1,
  },
  nextMealLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nextMealTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  startButtonIcon: {
    fontSize: 20,
    color: 'white',
    marginRight: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  stopButtonIcon: {
    fontSize: 20,
    color: 'white',
    marginRight: 10,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deactivateIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  deactivateButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  termsScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  modalButtons: {
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
