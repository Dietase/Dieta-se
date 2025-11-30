import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import PedometerComponent from '../components/Pedometer';
import api from '../components/api';

const CaloriasScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [passos, setPassos] = useState(0);
  const [dadosCalorias, setDadosCalorias] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (!loading) {
      enviarDados();
    }
  }, [passos]);

  const enviarDados = async () => {
    try {
      const data = await api.post('/calorias/calorias.php', { passos }, false);

      if (data.mensagem && data.tmb !== undefined) {
        setDadosCalorias(data);
        setPassos(data.passos || 0);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };

  const handleStepsUpdate = (steps: number) => {
    setPassos(steps);
  };

  const carregarHistorico = async () => {
    try {
      const data = await api.get('/calorias/calorias_historico.php', false);

      if (data.dados) {
        setHistorico(data.dados);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      await enviarDados();
      await carregarHistorico();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!dadosCalorias) {
    return (
      <View style={styles.container}>
        {}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔥 Calorias</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              ⚠️ Complete o questionário para ver seus dados
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const caloriasIngeridas = dadosCalorias?.calorias_ingeridas || 0;
  const caloriasGastas = dadosCalorias?.calorias_gastas || 0;
  const saldoCalorico = caloriasIngeridas - caloriasGastas;

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔥 Calorias</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.mainCard}>
          {}
          <View style={styles.graficoSection}>
            <GraficoCircularBalanco
              consumidas={caloriasIngeridas}
              gastas={caloriasGastas}
            />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🍽️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Alimentos</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {Math.round(caloriasIngeridas)} Kcal
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚶</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Andando</Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {passos.toLocaleString('pt-BR')} passos (
                    {Math.round(caloriasGastas)} Kcal)
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, styles.finaisRow]}>
                <Text style={styles.infoIcon}>▶️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Calorias finais</Text>
                  <Text
                    style={[
                      styles.infoValueFinais,
                      { color: saldoCalorico > 0 ? '#ef4444' : '#10b981' },
                    ]}
                    numberOfLines={1}
                  >
                    {saldoCalorico > 0 ? '+' : ''}
                    {Math.round(saldoCalorico)} Kcal
                  </Text>
                  <Text style={styles.infoSubtext}>
                    {saldoCalorico > 0
                      ? 'Superávit (ganho)'
                      : 'Déficit (perda)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contagem Calórica */}
          <View style={styles.contagemSection}>
            <Text style={styles.contagemTitle}>🔥 Contagem Calórica</Text>
            <Text style={styles.contagemSubtitle}>
              Seu limite diário ideal:
            </Text>

            <View style={styles.contagemValores}>
              <View style={styles.contagemItem}>
                <Text style={styles.contagemLabel}>Meta</Text>
                <Text style={styles.contagemValor}>
                  {Math.round(dadosCalorias.objetivo_minimo)} -{' '}
                  {Math.round(dadosCalorias.objetivo_maximo)}
                </Text>
                <Text style={styles.contagemUnidade}>kcal/dia</Text>
              </View>

              <View style={styles.contagemDivisor} />

              <View style={styles.contagemItem}>
                <Text style={styles.contagemLabel}>Gasto Estimado</Text>
                <Text style={[styles.contagemValor, { color: '#f97316' }]}>
                  {Math.round(dadosCalorias.estimativa_gasto_diario)}
                </Text>
                <Text style={styles.contagemUnidade}>kcal/dia</Text>
              </View>
            </View>

            <View style={styles.avisoMinimo}>
              <Text style={styles.avisoTexto}>
                ⚠️ Limite mínimo seguro:{' '}
                <Text style={styles.avisoValor}>
                  {Math.round(dadosCalorias.limite_minimo_seguro)} kcal
                </Text>
              </Text>
              <Text style={styles.avisoSubtexto}>
                Nunca consuma menos que isso!
              </Text>
              <Text style={styles.avisoSubtexto}>
                📊 Estes limites são calculados com base no seu TMB (Taxa
                Metabólica Basal) de {Math.round(dadosCalorias.tmb)} kcal
              </Text>
            </View>
          </View>

          {}
          {historico && historico.length > 0 ? (
            <View style={styles.graficoHistoricoWrapper}>
              <Text style={styles.graficoHistoricoTitulo}>
                📈 Histórico Semanal
              </Text>
              <Text style={styles.graficoHistoricoSubtitulo}>
                Calorias finais por dia (consumidas - gastas)
              </Text>
              <GraficoHistoricoSaldo historico={historico} />
            </View>
          ) : null}

          {}
          <View
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
            }}
          >
            <PedometerComponent onStepsChange={handleStepsUpdate} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const GraficoCircularBalanco = ({ consumidas, gastas }) => {
  const caloriasConsumidas = Number(consumidas) || 0;
  const caloriasGastas = Number(gastas) || 0;

  const total = caloriasConsumidas + caloriasGastas;
  const percentualConsumidas =
    total > 0 ? (caloriasConsumidas / total) * 100 : 50;
  const anguloConsumidas = (percentualConsumidas / 100) * 360;

  const corConsumidas = total === 0 ? '#9CA3AF' : '#3b82f6';
  const corGastas = total === 0 ? '#D1D5DB' : '#10b981';

  return (
    <View style={styles.graficoCircular}>
      <View
        style={[
          styles.circuloCompacto,
          {
            borderTopColor: anguloConsumidas >= 90 ? corConsumidas : corGastas,
            borderRightColor:
              anguloConsumidas >= 180 ? corConsumidas : corGastas,
            borderBottomColor:
              anguloConsumidas >= 270 ? corConsumidas : corGastas,
            borderLeftColor: corConsumidas,
          },
        ]}
      >
        <Text style={styles.circuloTexto}>
          {total === 0 ? '0' : Math.round(percentualConsumidas)}%
        </Text>
        <Text style={styles.circuloLabel}>
          {total === 0 ? 'nenhum dado' : 'consumidas'}
        </Text>
      </View>

      <View style={styles.legendaCompacta}>
        <View style={styles.legendaItem}>
          <View
            style={[styles.legendaBolinha, { backgroundColor: corConsumidas }]}
          />
          <Text style={styles.legendaTexto}>Consumidas</Text>
        </View>
        <View style={styles.legendaItem}>
          <View
            style={[styles.legendaBolinha, { backgroundColor: corGastas }]}
          />
          <Text style={styles.legendaTexto}>Gastas</Text>
        </View>
      </View>
    </View>
  );
};

const GraficoHistoricoSaldo = ({ historico }) => {
  if (!historico || !Array.isArray(historico) || historico.length === 0) {
    return (
      <View style={styles.graficoVazio}>
        <Text style={styles.graficoVazioTexto}>
          📊 Nenhum histórico disponível ainda
        </Text>
        <Text style={styles.graficoVazioSubtexto}>
          Registre suas refeições e ande mais para ver o gráfico aqui
        </Text>
      </View>
    );
  }

  const temDadosSignificativos = historico.some(h => {
    const calorias = Number(h.calorias_ingeridas) || 0;
    const gastas = Number(h.calorias_gastas) || 0;
    return calorias > 0 || gastas > 0;
  });

  if (!temDadosSignificativos) {
    return (
      <View style={styles.graficoVazio}>
        <Text style={styles.graficoVazioTexto}>
          📊 Nenhum histórico disponível ainda
        </Text>
        <Text style={styles.graficoVazioSubtexto}>
          Registre suas refeições e ande mais para ver o gráfico aqui
        </Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 60;

  const labels = historico.map(h => {
    const data = new Date(h.data_registro);
    return data
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .substring(0, 3);
  });

  const dataSaldo = historico.map(h =>
    Math.round(Number(h.saldo_calorico) || 0)
  );
  const linhaZero = Array(historico.length).fill(0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataSaldo,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: linhaZero,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.3})`,
        strokeWidth: 1,
        withDots: false,
        strokeDashArray: [5, 5],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6',
      fill: '#fff',
    },
  };

  return (
    <View style={styles.graficoHistoricoContainer}>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={200}
        chartConfig={chartConfig}
        bezier={false}
        style={styles.lineChartCompacto}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
      <View style={styles.legendaGrafico}>
        <Text style={styles.legendaGraficoTexto}>
          📊 Acima de zero = ganho de peso | Abaixo de zero = perda de peso
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ecfcec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  scrollView: {
    flex: 1,
    paddingTop: 15,
  },
  mainCard: {
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorCard: {
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  graficoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  graficoCircular: {
    marginRight: 20,
  },
  circuloCompacto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  circuloLabel: {
    fontSize: 10,
    color: '#666',
  },
  legendaCompacta: {
    marginTop: 10,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendaBolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendaTexto: {
    fontSize: 11,
    color: '#666',
  },
  infoSection: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  finaisRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoValueFinais: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  contagemSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contagemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  contagemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  contagemValores: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contagemItem: {
    flex: 1,
    alignItems: 'center',
  },
  contagemLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
  },
  contagemValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  contagemUnidade: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  contagemDivisor: {
    width: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  avisoMinimo: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  avisoTexto: {
    fontSize: 12,
    color: '#666',
  },
  avisoValor: {
    fontWeight: 'bold',
    color: '#ef4444',
  },
  avisoSubtexto: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  graficoHistoricoWrapper: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  graficoHistoricoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  graficoHistoricoSubtitulo: {
    fontSize: 11,
    color: '#666',
    marginBottom: 15,
  },
  graficoHistoricoContainer: {
    alignItems: 'center',
  },
  lineChartCompacto: {
    borderRadius: 10,
  },
  legendaGrafico: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  legendaGraficoTexto: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  graficoVazio: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  graficoVazioTexto: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 5,
  },
  graficoVazioSubtexto: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default CaloriasScreen;
