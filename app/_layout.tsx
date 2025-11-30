import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="termos"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="termosDeUso"
        options={{
          title: 'Termos de Uso',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="politicaPrivacidade"
        options={{
          title: 'Política de Privacidade',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="perguntasEssenciais"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="perguntasPerfil"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
          title: '',
          headerStyle: {
            backgroundColor: '#ecfcec',
          },
        }}
      />
      <Stack.Screen
        name="verPerfil"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editarPerfil"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dieta"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="refeicoes"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="progresso"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorias"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="historico"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="jejum"
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
