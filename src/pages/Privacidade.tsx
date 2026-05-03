import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLATFORM_NAME, PRIVACY_EMAIL, SUPPORT_PHONE } from '@/lib/constants';

export default function Privacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8 text-foreground">
            {/* Introdução */}
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                A <strong>{PLATFORM_NAME}</strong> está comprometida com a proteção da privacidade e dos dados pessoais de seus clientes, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais ao utilizar nossos serviços de limpeza residencial e comercial.
              </p>
            </section>

            {/* Dados Coletados */}
            <section>
              <h2 className="text-xl font-semibold mb-4">2. Dados Coletados</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">2.1 Dados Fornecidos por Você</h3>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Nome completo</li>
                    <li>Telefone/WhatsApp</li>
                    <li>Email (opcional)</li>
                    <li>Endereço completo (rua, número, bairro, cidade, CEP)</li>
                    <li>Informações sobre os serviços solicitados</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2.2 Dados Coletados Automaticamente</h3>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Endereço IP</li>
                    <li>Dados de geolocalização (para cálculo de frete)</li>
                    <li>Informações do dispositivo e navegador</li>
                    <li>Histórico de navegação no site</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Finalidade */}
            <section>
              <h2 className="text-xl font-semibold mb-4">3. Finalidade do Tratamento</h2>
              <p className="text-muted-foreground mb-2">Utilizamos seus dados pessoais para:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Processar e executar seus agendamentos de serviços</li>
                <li>Calcular fretes e planejar logística de atendimento</li>
                <li>Comunicar sobre o status do serviço</li>
                <li>Enviar confirmações, recibos e notas fiscais</li>
                <li>Prestar suporte ao cliente</li>
                <li>Melhorar nossos serviços e experiência do usuário</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Prevenir fraudes e garantir segurança</li>
              </ul>
            </section>

            {/* Base Legal */}
            <section>
              <h2 className="text-xl font-semibold mb-4">4. Base Legal (LGPD)</h2>
              <p className="text-muted-foreground">
                O tratamento dos seus dados pessoais está fundamentado nas seguintes bases legais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li><strong>Art. 7º, V:</strong> Execução de contrato ou procedimentos preliminares</li>
                <li><strong>Art. 7º, VI:</strong> Exercício regular de direitos em processos</li>
                <li><strong>Art. 7º, IX:</strong> Legítimo interesse</li>
                <li><strong>Art. 7º, II:</strong> Cumprimento de obrigação legal</li>
              </ul>
            </section>

            {/* Compartilhamento */}
            <section>
              <h2 className="text-xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-2">
                Seus dados podem ser compartilhados apenas com:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Técnicos da {PLATFORM_NAME} responsáveis pelo seu atendimento</li>
                <li>Prestadores de serviços (processamento de pagamentos, hospedagem)</li>
                <li>Autoridades públicas quando exigido por lei</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-semibold">
                Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.
              </p>
            </section>

            {/* Segurança */}
            <section>
              <h2 className="text-xl font-semibold mb-4">6. Segurança dos Dados</h2>
              <p className="text-muted-foreground mb-2">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Criptografia de dados sensíveis em repouso</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Autenticação multifator para equipe administrativa</li>
                <li>Auditoria e registro de todas as ações no sistema</li>
                <li>Backup automático diário</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            {/* Retenção */}
            <section>
              <h2 className="text-xl font-semibold mb-4">7. Período de Retenção</h2>
              <p className="text-muted-foreground mb-2">
                Mantemos seus dados pelo período necessário para cumprir as finalidades descritas:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Dados de agendamento:</strong> 5 anos (obrigação fiscal)</li>
                <li><strong>Carrinhos abandonados:</strong> 90 dias</li>
                <li><strong>Leads não convertidos:</strong> 2 anos</li>
                <li><strong>Logs de auditoria:</strong> 2 anos</li>
                <li><strong>Comunicações:</strong> 3 anos</li>
              </ul>
            </section>

            {/* Direitos do Titular */}
            <section>
              <h2 className="text-xl font-semibold mb-4">8. Seus Direitos (Art. 18 LGPD)</h2>
              <p className="text-muted-foreground mb-2">
                Você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Confirmação e acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Anonimização/bloqueio/eliminação:</strong> Solicitar anonimização ou exclusão</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos</li>
                <li><strong>Revogação do consentimento:</strong> Quando aplicável</li>
                <li><strong>Oposição:</strong> Opor-se ao tratamento em determinadas situações</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold mb-4">9. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground mb-2">
                Utilizamos cookies para melhorar sua experiência:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Cookies essenciais:</strong> Necessários para funcionamento do site</li>
                <li><strong>Cookies de desempenho:</strong> Análise de uso e performance</li>
                <li><strong>Cookies funcionais:</strong> Lembrar preferências</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Você pode gerenciar cookies nas configurações do seu navegador.
              </p>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="text-xl font-semibold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground">
                Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos sobre alterações significativas por email ou aviso no site. A data da última atualização estará sempre indicada no topo desta página.
              </p>
            </section>

            {/* Contato */}
            <section>
              <h2 className="text-xl font-semibold mb-4">11. Contato e Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento dos seus dados:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">{PRIVACY_EMAIL}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Telefone</p>
                    <p className="text-muted-foreground">{SUPPORT_PHONE || 'Telefone não configurado'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Endereço</p>
                    <p className="text-muted-foreground">
                      Belo Horizonte, MG - Brasil
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Prazo de resposta:</strong> até 15 dias úteis
                </p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
