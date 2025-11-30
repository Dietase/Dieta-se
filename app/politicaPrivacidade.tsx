import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PoliticaPrivacidade() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Política de Privacidade</Text>
          <Text style={styles.subtitle}>Dieta-se</Text>
          <Text style={styles.date}>Última atualização: Outubro de 2025</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.intro}>
            Esta Política de Privacidade descreve como o Dieta-se coleta, usa,
            armazena e protege suas informações pessoais, em conformidade com a
            Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
          </Text>

          <Text style={styles.sectionTitle}>1. Informações que Coletamos</Text>

          <Text style={styles.subsectionTitle}>1.1. Dados Cadastrais:</Text>
          <Text style={styles.listItem}>• Nome completo</Text>
          <Text style={styles.listItem}>• E-mail</Text>
          <Text style={styles.listItem}>• Data de nascimento</Text>
          <Text style={styles.listItem}>
            • Senha (armazenada de forma criptografada)
          </Text>

          <Text style={styles.subsectionTitle}>
            1.2. Dados de Saúde (Sensíveis):
          </Text>
          <Text style={styles.listItem}>
            • Peso, altura e IMC (calculado automaticamente)
          </Text>
          <Text style={styles.listItem}>
            • Histórico de progresso de peso (registros semanais)
          </Text>
          <Text style={styles.listItem}>• Sexo biológico e idade</Text>
          <Text style={styles.listItem}>
            • Alergias e restrições alimentares (celíaca, diabetes, hipertensão,
            etc.)
          </Text>
          <Text style={styles.listItem}>
            • Objetivos nutricionais (perder/ganhar/manter peso, ganhar massa)
          </Text>
          <Text style={styles.listItem}>
            • Tipo de dieta seguida (vegana, vegetariana, low carb, etc.)
          </Text>
          <Text style={styles.listItem}>
            • Registro de refeições e alimentos consumidos
          </Text>
          <Text style={styles.listItem}>
            • Sintomas pós-refeição (azia, enjoo, diarreia, etc.)
          </Text>
          <Text style={styles.listItem}>• Nível de atividade física</Text>
          <Text style={styles.listItem}>
            • Dados do pedômetro (contagem de passos)
          </Text>
          <Text style={styles.listItem}>
            • Horários e duração de jejum intermitente (se ativado)
          </Text>

          <Text style={styles.subsectionTitle}>1.3. Dados de Uso:</Text>
          <Text style={styles.listItem}>• Logs de acesso e navegação</Text>
          <Text style={styles.listItem}>• Interações com o aplicativo</Text>
          <Text style={styles.listItem}>
            • Dispositivo utilizado (modelo, sistema operacional)
          </Text>
          <Text style={styles.listItem}>
            • Token de autenticação (armazenado localmente no dispositivo)
          </Text>

          <Text style={styles.subsectionTitle}>
            1.4. Dados de Personalização:
          </Text>
          <Text style={styles.listItem}>
            • Avatar e cor de fundo escolhidos
          </Text>
          <Text style={styles.listItem}>
            • Preferências de ordenação de alimentos na tela inicial
          </Text>
          <Text style={styles.listItem}>• Configurações do aplicativo</Text>

          <Text style={styles.sectionTitle}>
            2. Como Usamos suas Informações
          </Text>
          <Text style={styles.paragraph}>
            Utilizamos seus dados pessoais para:
          </Text>
          <Text style={styles.listItem}>
            • Personalizar sua experiência no aplicativo
          </Text>
          <Text style={styles.listItem}>
            • Criar e ajustar planos alimentares baseados no seu perfil e
            objetivos
          </Text>
          <Text style={styles.listItem}>
            • Calcular sua Taxa Metabólica Basal (TMB) e necessidades calóricas
          </Text>
          <Text style={styles.listItem}>
            • Fornecer recomendações de alimentos compatíveis com suas
            restrições
          </Text>
          <Text style={styles.listItem}>
            • Gerar gráficos de progresso de peso e IMC
          </Text>
          <Text style={styles.listItem}>
            • Calcular calorias gastas baseado em passos (se pedômetro ativo)
          </Text>
          <Text style={styles.listItem}>
            • Gerenciar períodos de jejum intermitente (se ativado)
          </Text>
          <Text style={styles.listItem}>
            • Manter histórico de refeições e sintomas
          </Text>
          <Text style={styles.listItem}>
            • Melhorar nossos serviços e funcionalidades
          </Text>
          <Text style={styles.listItem}>
            • Cumprir obrigações legais e regulatórias
          </Text>

          <Text style={styles.sectionTitle}>
            3. Base Legal para Processamento
          </Text>
          <Text style={styles.paragraph}>
            Processamos seus dados pessoais com base em:
          </Text>
          <Text style={styles.listItem}>
            • Consentimento explícito para dados de saúde (aceite dos termos)
          </Text>
          <Text style={styles.listItem}>
            • Execução de contrato para prestação dos serviços
          </Text>
          <Text style={styles.listItem}>
            • Legítimo interesse para melhorias do aplicativo
          </Text>
          <Text style={styles.listItem}>
            • Cumprimento de obrigações legais
          </Text>

          <Text style={styles.sectionTitle}>4. Compartilhamento de Dados</Text>
          <Text style={styles.paragraph}>
            4.1. NÃO vendemos, alugamos ou comercializamos seus dados pessoais.
          </Text>
          <Text style={styles.paragraph}>
            4.2. Podemos compartilhar dados apenas com:
          </Text>
          <Text style={styles.listItem}>
            • Prestadores de serviços essenciais (hospedagem na Railway)
          </Text>
          <Text style={styles.listItem}>
            • Autoridades legais, quando exigido por lei
          </Text>
          <Text style={styles.listItem}>
            • Profissionais de saúde, mediante sua autorização expressa
          </Text>

          <Text style={styles.sectionTitle}>
            5. Armazenamento Local de Dados
          </Text>
          <Text style={styles.paragraph}>
            5.1. Alguns dados são armazenados localmente no seu dispositivo para
            funcionamento offline:
          </Text>
          <Text style={styles.listItem}>
            • Token de autenticação (AsyncStorage)
          </Text>
          <Text style={styles.listItem}>• Preferências de avatar e cores</Text>
          <Text style={styles.listItem}>
            • Status do pedômetro (ativo/inativo)
          </Text>
          <Text style={styles.listItem}>
            • Dados temporários de jejum em andamento
          </Text>
          <Text style={styles.paragraph}>
            5.2. Estes dados locais são removidos automaticamente quando você
            faz logout ou deleta sua conta.
          </Text>

          <Text style={styles.sectionTitle}>6. Segurança dos Dados</Text>
          <Text style={styles.paragraph}>
            Implementamos medidas técnicas e organizacionais para proteger seus
            dados:
          </Text>
          <Text style={styles.listItem}>
            • Criptografia de dados em trânsito (HTTPS)
          </Text>
          <Text style={styles.listItem}>
            • Senhas armazenadas com hash seguro (bcrypt)
          </Text>
          <Text style={styles.listItem}>• Autenticação via tokens JWT</Text>
          <Text style={styles.listItem}>
            • Controles de acesso restrito ao banco de dados
          </Text>
          <Text style={styles.listItem}>• Monitoramento de segurança</Text>
          <Text style={styles.listItem}>• Backups regulares</Text>

          <Text style={styles.sectionTitle}>7. Retenção de Dados</Text>
          <Text style={styles.paragraph}>
            7.1. Mantemos seus dados pelo tempo necessário para prestação dos
            serviços.
          </Text>
          <Text style={styles.paragraph}>
            7.2. Dados de saúde são retidos enquanto sua conta estiver ativa.
          </Text>
          <Text style={styles.paragraph}>
            7.3. Após solicitação de exclusão da conta, dados são
            permanentemente removidos em até 90 dias.
          </Text>
          <Text style={styles.paragraph}>
            7.4. Você pode atualizar seu peso apenas uma vez por semana para
            manter a integridade dos dados de progresso.
          </Text>

          <Text style={styles.sectionTitle}>8. Seus Direitos (LGPD)</Text>
          <Text style={styles.paragraph}>Você tem direito a:</Text>
          <Text style={styles.listItem}>
            • Confirmação da existência de tratamento de dados
          </Text>
          <Text style={styles.listItem}>
            • Acesso aos seus dados pessoais (tela de Perfil)
          </Text>
          <Text style={styles.listItem}>
            • Correção de dados incompletos ou desatualizados (Editar Perfil)
          </Text>
          <Text style={styles.listItem}>
            • Anonimização, bloqueio ou eliminação de dados (Deletar Conta)
          </Text>
          <Text style={styles.listItem}>• Portabilidade dos dados</Text>
          <Text style={styles.listItem}>
            • Informação sobre compartilhamento de dados
          </Text>
          <Text style={styles.listItem}>• Revogação do consentimento</Text>
          <Text style={styles.listItem}>• Oposição a tratamento realizado</Text>

          <Text style={styles.sectionTitle}>9. Permissões do Aplicativo</Text>
          <Text style={styles.paragraph}>
            9.1. Sensores de Movimento: Utilizado apenas se você ativar o
            pedômetro. Pode ser desativado a qualquer momento.
          </Text>
          <Text style={styles.paragraph}>
            9.2. Armazenamento Local: Para salvar preferências e dados de
            autenticação.
          </Text>
          <Text style={styles.paragraph}>
            9.3. Conexão com Internet: Necessária para sincronizar dados com o
            servidor.
          </Text>

          <Text style={styles.sectionTitle}>10. Funcionalidades Opcionais</Text>
          <Text style={styles.paragraph}>
            10.1. Pedômetro: Requer aceite de termos específicos antes da
            ativação. Os dados de passos ficam apenas no seu dispositivo até
            serem enviados ao servidor para cálculo de calorias.
          </Text>
          <Text style={styles.paragraph}>
            10.2. Jejum Intermitente: Funcionalidade desativada por padrão.
            Requer aceite de termo de ciência sobre riscos antes da ativação.
          </Text>

          <Text style={styles.sectionTitle}>11. Dados de Menores</Text>
          <Text style={styles.paragraph}>
            11.1. O aplicativo não é destinado a menores de 18 anos sem
            autorização dos responsáveis legais.
          </Text>
          <Text style={styles.paragraph}>
            11.2. Dados de menores requerem consentimento específico dos
            responsáveis legais.
          </Text>

          <Text style={styles.sectionTitle}>
            12. Transferência e Armazenamento
          </Text>
          <Text style={styles.paragraph}>
            12.1. Seus dados são armazenados em servidores hospedados pela
            Railway.
          </Text>
          <Text style={styles.paragraph}>
            12.2. Garantimos proteção adequada conforme LGPD para qualquer
            transferência de dados.
          </Text>

          <Text style={styles.sectionTitle}>13. Alterações nesta Política</Text>
          <Text style={styles.paragraph}>
            Podemos atualizar esta política periodicamente. Notificaremos você
            sobre mudanças significativas através do aplicativo ou por e-mail.
          </Text>

          <Text style={styles.sectionTitle}>
            14. Encarregado de Dados (DPO)
          </Text>
          <Text style={styles.paragraph}>
            Nosso Encarregado de Proteção de Dados pode ser contatado em:
          </Text>
          <Text style={styles.paragraph}>
            E-mail: dietase.app@gmail.com{'\n'}
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade.
          </Text>

          <Text style={styles.sectionTitle}>15. Autoridade Nacional</Text>
          <Text style={styles.paragraph}>
            Você pode apresentar reclamação à Autoridade Nacional de Proteção de
            Dados (ANPD) caso considere que seus direitos não foram respeitados.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao utilizar o Dieta-se, você declara ter lido e compreendido esta
              Política de Privacidade e consente com o tratamento de seus dados
              conforme descrito.
            </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
  },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 10,
    color: '#555',
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 5,
    color: '#555',
    paddingLeft: 10,
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
});
