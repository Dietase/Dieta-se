import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../components/api';

export default function EditarPerfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [altura, setAltura] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [tipoDieta, setTipoDieta] = useState('');
  const [disturbios, setDisturbios] = useState({
    celíaca: false,
    diabetes: false,
    hipercolesterolemia: false,
    hipertensão: false,
    sii: false,
    intolerancia_lactose: false,
  });

  const [mostrarModalDeletar, setMostrarModalDeletar] = useState(false);
  const [senhaConfirmarDelete, setSenhaConfirmarDelete] = useState('');

  const tiposDieta = [
    { value: 'nenhuma', label: 'Nenhuma' },
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'cetogenica', label: 'Cetogênica' },
    { value: 'mediterranea', label: 'Mediterrânea' },
    { value: 'vegana', label: 'Vegana' },
    { value: 'vegetariana', label: 'Vegetariana' },
    { value: 'paleolitica', label: 'Paleolítica' },
    { value: 'dieta_das_zonas', label: 'Dieta das Zonas' },
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const formatarDataParaExibicao = dataBanco => {
      const [ano, mes, dia] = dataBanco.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    try {
      setLoading(true);

      const data = await api.get('/perfil.php');

      if (data.nome) {
        setNome(data.nome);
        setDataNascimento(formatarDataParaExibicao(data.data_nascimento));
        setAltura(data.altura.toString());

        const tipoDietaRecebido = data.tipo_dieta || 'nenhuma';
        setTipoDieta(tipoDietaRecebido.toLowerCase());

        if (data.disturbios && data.disturbios.toLowerCase() !== 'nenhum') {
          const disturbiosArray = data.disturbios
            .split(',')
            .map(d => d.trim().toLowerCase());

          setDisturbios({
            celíaca:
              disturbiosArray.includes('celíaca') ||
              disturbiosArray.includes('celiaca'),
            diabetes: disturbiosArray.includes('diabetes'),
            hipercolesterolemia: disturbiosArray.includes(
              'hipercolesterolemia'
            ),
            hipertensão:
              disturbiosArray.includes('hipertensão') ||
              disturbiosArray.includes('hipertensao'),
            sii:
              disturbiosArray.includes('sii') ||
              disturbiosArray.includes('síndrome do intestino irritável'),
            intolerancia_lactose:
              disturbiosArray.includes('intolerância à lactose') ||
              disturbiosArray.includes('intolerancia_lactose') ||
              disturbiosArray.includes('intolerancia à lactose'),
          });
        } else {
          setDisturbios({
            celíaca: false,
            diabetes: false,
            hipercolesterolemia: false,
            hipertensão: false,
            sii: false,
            intolerancia_lactose: false,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  function formatarDataParaBanco(data: string): string {
    const partes = data.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return data;
  }

  const salvarAlteracoes = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    if (!dataNascimento || dataNascimento.length !== 10) {
      Alert.alert(
        'Erro',
        'Data de nascimento é obrigatória e deve estar completa'
      );
      return;
    }

    if (!altura || altura.trim() === '') {
      Alert.alert('Erro', 'Altura é obrigatória');
      return;
    }

    if (!tipoDieta || tipoDieta === '') {
      Alert.alert('Erro', 'Selecione um tipo de dieta');
      return;
    }

    await continuarSalvamento();
  };

  const continuarSalvamento = async () => {
    if (novaSenha) {
      if (!senhaAtual) {
        Alert.alert('Erro', 'Digite sua senha atual para alterá-la');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }
      if (novaSenha.length < 6) {
        Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    try {
      setSalvando(true);

      const mapeamentoNomes = {
        celíaca: 'celíaca',
        diabetes: 'diabetes',
        hipercolesterolemia: 'hipercolesterolemia',
        hipertensão: 'hipertensão',
        sii: 'sii',
        intolerancia_lactose: 'intolerância à lactose',
      };

      const disturbiosSelecionados = Object.keys(disturbios)
        .filter(key => disturbios[key])
        .map(key => mapeamentoNomes[key] || key)
        .join(', ');

      const body = {
        nome: nome.trim(),
        data_nascimento: formatarDataParaBanco(dataNascimento),
        altura: parseInt(altura),
        tipo_dieta: tipoDieta,
        disturbios: disturbiosSelecionados || 'nenhum',
        ...(novaSenha && { senha_atual: senhaAtual, nova_senha: novaSenha }),
      };

      const data = await api.put('/perfil.php', body);

      if (data.mensagem) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSalvando(false);
    }
  };

  const deletarConta = async () => {
    if (!senhaConfirmarDelete) {
      Alert.alert('Erro', 'Digite sua senha para confirmar');
      return;
    }

    try {
      setDeletando(true);

      const data = await api.delete('/perfil.php', {
        senha: senhaConfirmarDelete,
      });

      await AsyncStorage.clear();
      setMostrarModalDeletar(false);

      Alert.alert('Conta Deletada', 'Sua conta foi removida com sucesso', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error: any) {
      setDeletando(false);
      Alert.alert('Erro', error.message || 'Não foi possível deletar a conta');
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
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#747474"
            value={dataNascimento}
            onChangeText={text => {
              let formatted = text.replace(/\D/g, '');
              if (formatted.length >= 2) {
                formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
              }
              if (formatted.length >= 5) {
                formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
              }
              setDataNascimento(formatted);
            }}
            keyboardType="numeric"
            maxLength={10}
          />

          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            value={altura}
            onChangeText={setAltura}
            placeholder="170"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tipo de Dieta</Text>
          {tiposDieta.map(tipo => (
            <TouchableOpacity
              key={tipo.value}
              style={[
                styles.radioOption,
                tipoDieta === tipo.value && styles.radioOptionSelected,
              ]}
              onPress={() => setTipoDieta(tipo.value)}
            >
              <View style={styles.radioCircle}>
                {tipoDieta === tipo.value && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioText}>{tipo.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Distúrbios/Doenças</Text>

          {Object.keys(disturbios).map(key => {
            const nomesFormatados = {
              celíaca: 'Celíaca',
              diabetes: 'Diabetes',
              hipercolesterolemia: 'Hipercolesterolemia',
              hipertensão: 'Hipertensão',
              sii: 'SII',
              intolerancia_lactose: 'Intolerância à Lactose',
            };

            return (
              <TouchableOpacity
                key={key}
                style={styles.checkboxOption}
                onPress={() =>
                  setDisturbios({ ...disturbios, [key]: !disturbios[key] })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    disturbios[key] && styles.checkboxChecked,
                  ]}
                >
                  {disturbios[key] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  {nomesFormatados[key] || key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Alterar Senha</Text>

          <Text style={styles.label}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="Digite sua senha atual"
            placeholderTextColor="#888"
            secureTextEntry
          />

          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#888"
            secureTextEntry
          />
          <Text style={styles.passwordHint}>
            ⚠️ A senha deve ter no mínimo 6 caracteres
          </Text>

          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Digite novamente"
            placeholderTextColor="#888"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.salvarButton}
          onPress={salvarAlteracoes}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.salvarButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deletarButton}
          onPress={() => setMostrarModalDeletar(true)}
        >
          <Text style={styles.deletarButtonText}>Deletar Conta</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {}
      {mostrarModalDeletar && (
        <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>⚠️ Deletar Conta</Text>
            <Text style={styles.modalText}>
              Esta ação é irreversível! Todos os seus dados serão perdidos.
            </Text>

            <Text style={styles.label}>Confirme sua senha:</Text>
            <TextInput
              style={styles.input}
              value={senhaConfirmarDelete}
              onChangeText={setSenhaConfirmarDelete}
              placeholder="Digite sua senha"
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelarButton}
                onPress={() => {
                  setMostrarModalDeletar(false);
                  setSenhaConfirmarDelete('');
                }}
              >
                <Text style={styles.modalCancelarText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeletarButton}
                onPress={deletarConta}
                disabled={deletando}
              >
                {deletando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalDeletarText}>Deletar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  passwordHint: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 5,
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
    paddingTop: 70,
  },
  card: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
  },
  salvarButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  salvarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deletarButton: {
    backgroundColor: '#FF5252',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deletarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5252',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalCancelarButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelarText: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalDeletarButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF5252',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalDeletarText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
