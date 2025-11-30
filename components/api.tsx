import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const RAILWAY_API = 'https://tcc-production-b4f7.up.railway.app/PHP';
const LOCAL_API = 'http://localhost/DietaseAPP/PHP';

let API_BASE = RAILWAY_API;

async function detectApiBase(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch(`https://tcc-production-b4f7.up.railway.app/test_api.php`, {
      signal: controller.signal,
      method: 'GET',
    });

    clearTimeout(timeoutId);
    console.log('✅ Usando Railway API!');
    return RAILWAY_API;
  } catch (error) {
    console.log('⚠️ Railway offline, usando API local...');
    return LOCAL_API;
  }
}

let apiBaseInitialized = false;

async function getApiBase(): Promise<string> {
  if (!apiBaseInitialized) {
    API_BASE = await detectApiBase();
    apiBaseInitialized = true;
  }
  return API_BASE;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

interface ApiRequestOptions {
  endpoint: string;
  method?: HttpMethod;
  body?: any;
  requiresAuth?: boolean;
  showErrorAlert?: boolean;
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    return null;
  }
}

export async function apiRequest({
  endpoint,
  method = 'GET',
  body = null,
  requiresAuth = true,
  showErrorAlert = true,
}: ApiRequestOptions): Promise<any> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (requiresAuth) {
      const token = await getToken();

      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const apiBase = await getApiBase();
    const response = await fetch(`${apiBase}${endpoint}`, options);

    const text = await response.text();

    if (!text.trim()) {
      throw new Error('Resposta vazia do servidor');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error('Resposta inválida do servidor');
    }

    if (!response.ok) {
      const errorMessage = data?.erro || `Erro ${response.status}`;
      throw new Error(errorMessage);
    }

    if (data?.erro) {
      throw new Error(data.erro);
    }

    return data;
  } catch (error: any) {
    if (showErrorAlert) {
      const userMessage = error.message || 'Erro desconhecido';

      const friendlyMessages: Record<string, string> = {
        'Network request failed': 'Sem conexão com a internet',
        'Token não encontrado': 'Sessão expirada. Faça login novamente.',
        'Resposta vazia do servidor': 'Servidor não respondeu corretamente',
        'The user aborted a request': 'Tempo de resposta excedido',
      };

      Alert.alert('Erro', friendlyMessages[userMessage] || userMessage);
    }

    throw error;
  }
}

export const api = {
  get: (endpoint: string, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'GET', showErrorAlert }),

  post: (endpoint: string, body: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'POST', body, showErrorAlert }),

  put: (endpoint: string, body: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'PUT', body, showErrorAlert }),

  delete: (endpoint: string, body?: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'DELETE', body, showErrorAlert }),

  patch: (endpoint: string, body: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'PATCH', body, showErrorAlert }),

  noAuth: {
    post: (endpoint: string, body: any, showErrorAlert = true) =>
      apiRequest({
        endpoint,
        method: 'POST',
        body,
        requiresAuth: false,
        showErrorAlert,
      }),
  },
};

export default api;
