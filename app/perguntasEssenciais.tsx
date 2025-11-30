import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import api from '../components/api';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function heightPercent(percentage: number) {
  return windowHeight * (percentage / 100);
}

function widthPercent(percentage: number) {
  return windowWidth * (percentage / 100);
}

export default function PerguntasEssenciais() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');

  const handleAvancar = () => {
    setErrorMessage('');

    if (etapa === 1 && !sexo) {
      setErrorMessage('Por favor, selecione seu sexo biológico');
      return;
    }

    if (etapa === 2 && !dataNascimento) {
      setErrorMessage('Por favor, informe sua data de nascimento');
      return;
    }

    if (etapa === 3 && (!altura || parseFloat(altura) <= 0)) {
      setErrorMessage('Por favor, informe uma altura válida');
      return;
    }

    if (etapa === 4 && (!peso || parseFloat(peso) <= 0)) {
      setErrorMessage('Por favor, informe um peso válido');
      return;
    }

    if (etapa === 4) {
      enviarDados();
    } else {
      setEtapa(etapa + 1);
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

  const enviarDados = async () => {
    try {
      const data = await api.post('/perguntas/perguntas_essenciais.php', {
        sexo_biologico: sexo,
        data_nascimento: formatarDataParaBanco(dataNascimento),
        altura: altura,
        peso: peso,
      });

      if (data?.mensagem) {
        router.push('/perguntasPerfil');
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || 'Erro ao enviar dados. Tente novamente.'
      );
    }
  };

  const handleVoltar = () => {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      setErrorMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* ETAPA 1: SEXO BIOLÓGICO */}
          {etapa === 1 && (
            <>
              <Text style={styles.pergunta}>
                Qual é o seu{'\n'}sexo biológico?
              </Text>

              <Pressable
                style={[styles.opcao, sexo === 'm' && styles.opcaoSelecionada]}
                onPress={() => setSexo('m')}
              >
                <View style={styles.radio}>
                  {sexo === 'm' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Masculino 👨</Text>
              </Pressable>

              <Pressable
                style={[styles.opcao, sexo === 'f' && styles.opcaoSelecionada]}
                onPress={() => setSexo('f')}
              >
                <View style={styles.radio}>
                  {sexo === 'f' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Feminino 👩</Text>
              </Pressable>
            </>
          )}

          {}
          {etapa === 2 && (
            <>
              <Text style={styles.pergunta}>
                Qual é a sua{'\n'}data de nascimento?
              </Text>

              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#747474"
                value={dataNascimento}
                onChangeText={text => {
                  let formatted = text.replace(/\D/g, '');
                  if (formatted.length >= 2) {
                    formatted =
                      formatted.slice(0, 2) + '/' + formatted.slice(2);
                  }
                  if (formatted.length >= 5) {
                    formatted =
                      formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
                  }
                  setDataNascimento(formatted);
                }}
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.dica}>💡 Exemplo: 15/03/1990</Text>
            </>
          )}

          {/* ETAPA 3: ALTURA */}
          {etapa === 3 && (
            <>
              <Text style={styles.pergunta}>
                Qual é a sua{'\n'}altura em centímetros?
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputNumero}
                  placeholder="170"
                  placeholderTextColor="#747474"
                  value={altura}
                  onChangeText={setAltura}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.unidade}>cm</Text>
              </View>
            </>
          )}

          {}
          {etapa === 4 && (
            <>
              <Text style={styles.pergunta}>
                Qual é o seu{'\n'}peso em quilogramas?
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputNumero}
                  placeholder="70,5"
                  placeholderTextColor="#747474"
                  value={peso}
                  onChangeText={text => {
                    const pesoFormatado = text.replace(',', '.');
                    setPeso(pesoFormatado);
                  }}
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <Text style={styles.unidade}>kg</Text>
              </View>
            </>
          )}

          {errorMessage ? (
            <Text style={styles.erro}>{errorMessage}</Text>
          ) : null}

          <View style={styles.botoesContainer}>
            {etapa > 1 && (
              <Pressable style={styles.botaoVoltar} onPress={handleVoltar}>
                <Text style={styles.botaoVoltarTexto}>← Voltar</Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.botaoAvancar,
                etapa === 1 && styles.botaoAvancarFull,
              ]}
              onPress={handleAvancar}
            >
              <Text style={styles.botaoTexto}>
                {etapa === 4 ? 'Finalizar' : 'Avançar'}
              </Text>
            </Pressable>
          </View>

          {}
          <View style={styles.progressoContainer}>
            <View style={[styles.bolinha, etapa >= 1 && styles.bolinhaAtiva]} />
            <View style={[styles.bolinha, etapa >= 2 && styles.bolinhaAtiva]} />
            <View style={[styles.bolinha, etapa >= 3 && styles.bolinhaAtiva]} />
            <View style={[styles.bolinha, etapa >= 4 && styles.bolinhaAtiva]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: windowHeight,
  },
  formulario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ecfcec',
    width: widthPercent(85),
    borderRadius: 20,
    padding: 30,
    elevation: 5,
  },
  pergunta: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 30,
    lineHeight: 32,
  },
  opcao: {
    backgroundColor: '#ffffff',
    color: '#747474',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  opcaoSelecionada: {
    backgroundColor: '#C8E6C9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelecionado: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  opcaoTexto: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007912',
    minWidth: 100,
    textAlign: 'center',
  },
  unidade: {
    fontSize: 24,
    color: '#000000',
    marginLeft: 10,
    fontWeight: '500',
  },
  dica: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  erro: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  botaoVoltar: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  botaoVoltarTexto: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoAvancar: {
    flex: 1,
    backgroundColor: '#007912',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  botaoAvancarFull: {
    flex: 1,
  },
  botaoTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C8E6C9',
  },
  bolinhaAtiva: {
    backgroundColor: '#007912',
  },
});
