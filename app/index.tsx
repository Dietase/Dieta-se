import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
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

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!email || !senha) {
      setErrorMessage('Preencha todos os campos');
      return;
    }

    try {
      const data = await api.noAuth.post('/auth.php?endpoint=login', {
        email,
        senha,
      });

      if (data?.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.id.toString());

        if (!data.termos_aceitos) {
          router.replace('/termos');
        } else if (!data.essenciais_completas) {
          router.replace('/perguntasEssenciais');
        } else if (!data.perguntas_completas) {
          router.replace('/perguntasPerfil');
        } else {
          router.replace('/home');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao fazer login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Image
            style={styles.logo}
            source={require('./../assets/images/Logo.png')}
          />

          {errorMessage !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.items}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#888"
                returnKeyType="next"
              />
            </View>

            <View style={styles.items}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                placeholder="Senha"
                placeholderTextColor="#888"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Entrar</Text>
            </Pressable>
          </View>

          <View style={styles.goto}>
            <Text style={styles.gotoText}>Não possui cadastro? </Text>
            <Link href="/signup">
              <Text style={styles.gotoTextLink}>Registre-se</Text>
            </Link>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  items: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dadada',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000000',
    fontSize: 16,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 20,
    backgroundColor: '#007912',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  goto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  gotoText: {
    fontSize: 16,
    color: '#333',
  },
  gotoTextLink: {
    fontSize: 16,
    color: '#3392FF',
    fontWeight: '600',
  },
});
