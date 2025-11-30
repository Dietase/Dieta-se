import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TermosDeUso() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Termos de Uso</Text>
          <Text style={styles.subtitle}>Dieta-se</Text>
          <Text style={styles.date}>Última atualização: Outubro de 2025</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
          <Text style={styles.paragraph}>
            Ao acessar e utilizar o aplicativo Dieta-se, você concorda em
            cumprir e estar vinculado aos presentes Termos de Uso. Se você não
            concorda com estes termos, não utilize o aplicativo.
          </Text>

          <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
          <Text style={styles.paragraph}>
            O Dieta-se é um aplicativo de auxílio à alimentação saudável que
            oferece:
          </Text>
          <Text style={styles.listItem}>
            • Planejamento de dietas personalizadas baseadas em seus objetivos
          </Text>
          <Text style={styles.listItem}>
            • Registro e acompanhamento de refeições
          </Text>
          <Text style={styles.listItem}>
            • Contagem automática de calorias consumidas e gastas
          </Text>
          <Text style={styles.listItem}>
            • Monitoramento de progresso de peso e IMC
          </Text>
          <Text style={styles.listItem}>
            • Histórico de alimentação e sintomas
          </Text>
          <Text style={styles.listItem}>• Pedômetro integrado (opcional)</Text>
          <Text style={styles.listItem}>
            • Controle de jejum intermitente (opcional)
          </Text>

          <Text style={styles.sectionTitle}>
            3. Cadastro e Conta do Usuário
          </Text>
          <Text style={styles.paragraph}>
            3.1. Para utilizar o aplicativo, você deve fornecer informações
            verdadeiras, precisas e atualizadas durante o cadastro.
          </Text>
          <Text style={styles.paragraph}>
            3.2. Você é responsável por manter a confidencialidade de sua senha
            e por todas as atividades realizadas em sua conta.
          </Text>
          <Text style={styles.paragraph}>
            3.3. É necessário ter pelo menos 18 anos de idade para criar uma
            conta. Menores de 18 anos devem ter autorização dos pais ou
            responsáveis legais.
          </Text>

          <Text style={styles.sectionTitle}>4. Uso Adequado do Aplicativo</Text>
          <Text style={styles.paragraph}>Você concorda em NÃO:</Text>
          <Text style={styles.listItem}>
            • Usar o aplicativo para fins ilegais ou não autorizados
          </Text>
          <Text style={styles.listItem}>
            • Tentar obter acesso não autorizado ao sistema
          </Text>
          <Text style={styles.listItem}>
            • Transmitir vírus ou códigos maliciosos
          </Text>
          <Text style={styles.listItem}>
            • Compartilhar sua conta com terceiros
          </Text>
          <Text style={styles.listItem}>
            • Copiar, modificar ou distribuir o conteúdo do aplicativo sem
            autorização
          </Text>

          <Text style={styles.sectionTitle}>5. Informações de Saúde</Text>
          <Text style={styles.paragraph}>
            5.1. O Dieta-se NÃO substitui consultas médicas ou nutricionistas
            profissionais.
          </Text>
          <Text style={styles.paragraph}>
            5.2. As informações fornecidas são de caráter educativo e
            informativo.
          </Text>
          <Text style={styles.paragraph}>
            5.3. Recomendamos consultar um profissional de saúde antes de
            iniciar qualquer dieta ou programa alimentar.
          </Text>
          <Text style={styles.paragraph}>
            5.4. O aplicativo não se responsabiliza por decisões tomadas com
            base exclusivamente nas informações fornecidas.
          </Text>

          <Text style={styles.sectionTitle}>
            5.5. Funcionalidades Específicas
          </Text>
          <Text style={styles.paragraph}>
            5.5.1. Pedômetro: O aplicativo pode utilizar sensores do dispositivo
            para contar passos e calcular calorias gastas. Esta funcionalidade é
            opcional e pode ser desativada a qualquer momento.
          </Text>
          <Text style={styles.paragraph}>
            5.5.2. Jejum Intermitente: Esta funcionalidade requer aceite
            específico de termos de ciência antes da ativação, pois pode
            apresentar riscos se mal utilizada.
          </Text>
          <Text style={styles.paragraph}>
            5.5.3. Registro de Sintomas: Os sintomas reportados após refeições
            são utilizados apenas para seu controle pessoal e não constituem
            diagnóstico médico.
          </Text>

          <Text style={styles.sectionTitle}>
            6. Dados Pessoais e Privacidade
          </Text>
          <Text style={styles.paragraph}>
            6.1. Coletamos e processamos seus dados pessoais conforme descrito
            em nossa Política de Privacidade.
          </Text>
          <Text style={styles.paragraph}>
            6.2. Seus dados de saúde são tratados com confidencialidade e
            protegidos por medidas de segurança.
          </Text>
          <Text style={styles.paragraph}>
            6.3. Você pode solicitar a exclusão de seus dados a qualquer momento
            através da funcionalidade "Deletar Conta" no perfil.
          </Text>

          <Text style={styles.sectionTitle}>7. Propriedade Intelectual</Text>
          <Text style={styles.paragraph}>
            Todo o conteúdo do aplicativo, incluindo textos, gráficos, logos,
            ícones e software, é propriedade do Dieta-se e protegido por leis de
            propriedade intelectual.
          </Text>

          <Text style={styles.sectionTitle}>
            8. Limitação de Responsabilidade
          </Text>
          <Text style={styles.paragraph}>
            8.1. O aplicativo é fornecido "como está", sem garantias de qualquer
            tipo.
          </Text>
          <Text style={styles.paragraph}>
            8.2. Não nos responsabilizamos por danos diretos, indiretos,
            incidentais ou consequenciais resultantes do uso do aplicativo.
          </Text>
          <Text style={styles.paragraph}>
            8.3. Não garantimos que o serviço será ininterrupto, seguro ou livre
            de erros.
          </Text>
          <Text style={styles.paragraph}>
            8.4. Não somos responsáveis por imprecisões no pedômetro causadas
            por limitações dos sensores do dispositivo.
          </Text>

          <Text style={styles.sectionTitle}>9. Modificações nos Termos</Text>
          <Text style={styles.paragraph}>
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. As alterações entrarão em vigor imediatamente após
            publicação. O uso continuado do aplicativo após modificações
            constitui aceitação dos novos termos.
          </Text>

          <Text style={styles.sectionTitle}>10. Cancelamento e Suspensão</Text>
          <Text style={styles.paragraph}>
            10.1. Você pode cancelar sua conta a qualquer momento através da
            opção "Deletar Conta" nas configurações do perfil.
          </Text>
          <Text style={styles.paragraph}>
            10.2. Podemos suspender ou encerrar sua conta se houver violação
            destes termos.
          </Text>
          <Text style={styles.paragraph}>
            10.3. Após a exclusão da conta, todos os seus dados serão
            permanentemente removidos em até 90 dias.
          </Text>

          <Text style={styles.sectionTitle}>11. Lei Aplicável</Text>
          <Text style={styles.paragraph}>
            Estes termos são regidos pelas leis brasileiras, incluindo a Lei
            Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
          </Text>

          <Text style={styles.sectionTitle}>12. Contato</Text>
          <Text style={styles.paragraph}>
            Para dúvidas sobre estes Termos de Uso, entre em contato através do
            email: dietase.app@gmail.com
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao utilizar o Dieta-se, você declara ter lido, compreendido e
              concordado com estes Termos de Uso.
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 10,
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
