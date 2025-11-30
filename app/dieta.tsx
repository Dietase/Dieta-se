import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../components/api';

export default function DietaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [restricoes, setRestricoes] = useState([]);
  const [recomendados, setRecomendados] = useState([]);
  const [alimentosPermitidos, setAlimentosPermitidos] = useState([]);
  const [dietaSalva, setDietaSalva] = useState([]);
  const [avisoOrdenacao, setAvisoOrdenacao] = useState('');
  const [meta, setMeta] = useState('');

  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [alimentosSelecionados, setAlimentosSelecionados] = useState([]);

  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [ordenacaoHome, setOrdenacaoHome] = useState('carboidrato_g');

  useEffect(() => {
    carregarDieta();
  }, []);

  useEffect(() => {
    if (termoBusca.length >= 1) {
      buscarAlimentos();
    } else {
      setResultadosBusca([]);
    }
  }, [termoBusca]);

  useEffect(() => {
    if (categoriaFiltro) {
      buscarPorCategoria();
    } else {
      setResultadosBusca([]);
    }
  }, [categoriaFiltro]);

  const carregarDieta = async () => {
    try {
      setLoading(true);
      const data = await api.get('/dieta.php');

      if (data.restricoes) {
        setRestricoes(data.restricoes);
        setRecomendados(data.recomendados);
        setMeta(data.meta?.tipo || data.meta || '');
        setAlimentosPermitidos(data.alimentos_permitidos || []);
        setDietaSalva(data.dieta_salva || []);
        setAlimentosSelecionados((data.dieta_salva || []).map(a => a.id));

        const categoriasUnicas = [
          ...new Set((data.alimentos_permitidos || []).map(a => a.categoria)),
        ].sort();
        setCategorias(categoriasUnicas);

        if (data.ordenacao_home) {
          setOrdenacaoHome(data.ordenacao_home);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dieta:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarPorCategoria = () => {
    const resultados = alimentosPermitidos.filter(
      alimento => alimento.categoria === categoriaFiltro
    );
    setResultadosBusca(resultados);
    setTermoBusca('');
  };

  const buscarAlimentos = () => {
    const termo = termoBusca.toLowerCase();
    const resultados = alimentosPermitidos.filter(alimento =>
      alimento.nome.toLowerCase().includes(termo)
    );
    setResultadosBusca(resultados.slice(0, 20));
    setCategoriaFiltro('');
  };

  const toggleAlimento = alimentoId => {
    if (alimentosSelecionados.includes(alimentoId)) {
      setAlimentosSelecionados(
        alimentosSelecionados.filter(id => id !== alimentoId)
      );
    } else {
      setAlimentosSelecionados([...alimentosSelecionados, alimentoId]);
    }
  };

  const salvarDieta = async () => {
    try {
      setSalvando(true);
      setAvisoOrdenacao('');

      const data = await api.post('/dieta.php', {
        alimentos_selecionados: alimentosSelecionados,
        ordenacao_home: ordenacaoHome,
      });

      if (data.dieta_atualizada) {
        setDietaSalva(data.dieta_atualizada);

        if (data.aviso_ordenacao) {
          setAvisoOrdenacao(data.aviso_ordenacao);
        }

        Alert.alert('Sucesso', 'Dieta salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar dieta:', error);
      alert('❌ Erro ao salvar dieta');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const emojiPorCategoria = {
    'Alimentos preparados': '🍝',
    'Bebidas (alcoólicas e não alcoólicas)': '🍷',
    'Carnes e derivados': '🥩',
    'Cereais e derivados': '🌽',
    'Frutas e derivados': '🍎',
    'Gorduras e óleos': '🧈',
    'Leguminosas e derivados': '🥜',
    'Leite e derivados': '🥛',
    'Nozes e sementes': '🌰',
    'Outros alimentos industrializados': '🍮',
    'Ovos e derivados': '🥚',
    'Pescados e frutos do mar': '🐟',
    'Produtos açucarados': '🍫',
    'Verduras e derivados': '🥬',
  };

  const formatarMeta = meta => {
    const metas = {
      perder: 'Quero perder peso! ',
      ganhar: 'Quero ganhar peso! ',
      manter: 'Quero manter meu peso! ',
      massa: 'Quero ganhar massa muscular!',
    };
    return metas[meta] || 'Meta não definida';
  };

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
        <Text style={styles.headerTitle}>🍽️ Minha Dieta</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.editarDietaWidget}>
          <Text style={styles.widgetTitle}>Editar Dieta</Text>

          {}
          {avisoOrdenacao && (
            <View style={styles.avisoContainer}>
              <Text style={styles.avisoIcon}>⚠️</Text>
              <Text style={styles.avisoTexto}>{avisoOrdenacao}</Text>
            </View>
          )}

          {}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.buscaInput}
              placeholder="Digite o nome do alimento..."
              placeholderTextColor="#888"
              value={termoBusca}
              onChangeText={setTermoBusca}
            />
            <TouchableOpacity style={styles.searchIcon}>
              <Text>🔍</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.espacamentoBusca} />

          {}
          {categoriaFiltro && (
            <View style={styles.categoriaHeader}>
              <TouchableOpacity
                style={styles.voltarCategoria}
                onPress={() => setCategoriaFiltro('')}
              >
                <Text style={styles.voltarTexto}>← Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.categoriaTitulo}>{categoriaFiltro}</Text>
            </View>
          )}

          {/* Lista de Categorias */}
          {!categoriaFiltro && !termoBusca && (
            <ScrollView
              style={styles.categoriasScroll}
              showsVerticalScrollIndicator={false}
            >
              {categorias.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoriaItem}
                  onPress={() => setCategoriaFiltro(cat)}
                >
                  <Text style={styles.categoriaNome}>
                    {emojiPorCategoria[cat] || '📂'} {cat}
                  </Text>
                  <Text style={styles.categoriaIcon}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Lista de resultados */}
          {resultadosBusca.length > 0 && (
            <ScrollView
              style={styles.resultadosScroll}
              showsVerticalScrollIndicator={true}
            >
              {resultadosBusca.map(alimento => {
                const isSelected = alimentosSelecionados.includes(alimento.id);
                return (
                  <TouchableOpacity
                    key={alimento.id}
                    style={[
                      styles.resultadoItem,
                      isSelected && styles.resultadoItemSelecionado,
                    ]}
                    onPress={() => toggleAlimento(alimento.id)}
                  >
                    <View style={styles.resultadoInfo}>
                      <Text style={styles.resultadoNome}>{alimento.nome}</Text>
                      <Text style={styles.resultadoKcal}>
                        {parseFloat(alimento.energia_kcal).toFixed(0)} Kcal
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelecionado,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Contador */}
          {alimentosSelecionados.length > 0 && (
            <View style={styles.contadorContainer}>
              <Text style={styles.contadorTexto}>
                ✓ {alimentosSelecionados.length} alimento(s) selecionado(s)
              </Text>
            </View>
          )}
        </View>

        {/* Card de Recomendações */}
        <View style={styles.recomendacoesCard}>
          <View style={styles.metaSection}>
            <Text style={styles.metaIcon}>🎯</Text>
            <Text style={styles.metaText}>META: {formatarMeta(meta)}</Text>
          </View>

          <View style={styles.restricaoSection}>
            <Text style={styles.restricaoIcon}>🚫</Text>
            <View style={styles.restricaoContent}>
              <Text style={styles.restricaoTitle}>Restrição Alimentar:</Text>
              {restricoes.length > 0 ? (
                restricoes.map((item, index) => (
                  <Text key={index} style={styles.restricaoText}>
                    ✕ {item}
                  </Text>
                ))
              ) : (
                <Text style={styles.restricaoText}>
                  Nenhuma restrição alimentar foi registrada.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.recomendadosSection}>
            <Text style={styles.recomendadosIcon}>✅</Text>
            <View style={styles.recomendadosContent}>
              <Text style={styles.recomendadosTitle}>Recomendações:</Text>
              {recomendados.length > 0 ? (
                recomendados.map((item, index) => (
                  <Text key={index} style={styles.recomendadosText}>
                    {item}
                  </Text>
                ))
              ) : (
                <Text style={styles.recomendadosText}>
                  Nenhum distúrbio ou tipo de dieta foi registrado.
                </Text>
              )}
            </View>
          </View>

          {/* Exibir na Tela Inicial */}
          <View style={styles.exibirSection}>
            <Text style={styles.exibirTitle}>
              Exibir alimentos na tela inicial por:
            </Text>

            <TouchableOpacity
              style={[
                styles.radioOption,
                ordenacaoHome === 'carboidrato_g' && styles.radioOptionSelected,
              ]}
              onPress={() => setOrdenacaoHome('carboidrato_g')}
            >
              <View style={styles.radioCircle}>
                {ordenacaoHome === 'carboidrato_g' && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioText}>Mais carboidratos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                ordenacaoHome === 'proteina_g' && styles.radioOptionSelected,
              ]}
              onPress={() => setOrdenacaoHome('proteina_g')}
            >
              <View style={styles.radioCircle}>
                {ordenacaoHome === 'proteina_g' && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioText}>Mais proteína</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                ordenacaoHome === 'energia_kcal' && styles.radioOptionSelected,
              ]}
              onPress={() => setOrdenacaoHome('energia_kcal')}
            >
              <View style={styles.radioCircle}>
                {ordenacaoHome === 'energia_kcal' && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioText}>Mais calóricos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                ordenacaoHome === 'lipideos_g' && styles.radioOptionSelected,
              ]}
              onPress={() => setOrdenacaoHome('lipideos_g')}
            >
              <View style={styles.radioCircle}>
                {ordenacaoHome === 'lipideos_g' && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioText}>Mais lipídeos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmarButton}
              onPress={salvarDieta}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmarButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSpacer: {
    width: 40,
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: 15,
  },
  editarDietaWidget: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  avisoContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  avisoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  avisoTexto: {
    fontSize: 12,
    color: '#856404',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  buscaInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    padding: 5,
  },
  espacamentoBusca: {
    height: 20,
  },
  categoriasScroll: {
    maxHeight: 300,
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoriaNome: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  categoriaIcon: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  voltarCategoria: {
    marginRight: 10,
  },
  voltarTexto: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  categoriaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resultadosScroll: {
    maxHeight: 300,
    marginTop: 10,
  },
  resultadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultadoItemSelecionado: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  resultadoInfo: {
    flex: 1,
  },
  resultadoNome: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  resultadoKcal: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxSelecionado: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contadorContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  contadorTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  recomendacoesCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  metaIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  metaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  restricaoSection: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  restricaoIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  restricaoContent: {
    flex: 1,
  },
  restricaoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 5,
  },
  restricaoText: {
    fontSize: 12,
    color: '#C62828',
    marginBottom: 3,
  },
  recomendadosSection: {
    flexDirection: 'row',
  },
  recomendadosIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  recomendadosContent: {
    flex: 1,
  },
  recomendadosTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  recomendadosText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 3,
  },
  exibirSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  exibirTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  radioOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  confirmarButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});
