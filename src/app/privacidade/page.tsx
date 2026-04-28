import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade - SantaFé Marketplace',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-bold text-sertão-900 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-sertao max-w-none">
          <p className="text-gray-600 mb-6">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">1. Coleta de Informações</h2>
          <p className="text-gray-600 mb-6">
            Coletamos informações fornecidas por você durante o cadastro, incluindo nome, e-mail e telefone. Para verificação de identidade, coletamos selfies em vídeo de forma segura.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">2. Uso das Informações</h2>
          <p className="text-gray-600 mb-6">
            Utilizamos suas informações para: verificar sua identidade, contatar você sobre anúncios, melhorar nossos serviços e cumplir obrigações legais.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">3. Proteção de Dados</h2>
          <p className="text-gray-600 mb-6">
            Adotamos medidas de segurança para proteger suas informações pessoais. Selfies de verificação são armazenadas de forma criptografada e não são compartilhadas com terceiros.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">4. Compartilhamento</h2>
          <p className="text-gray-600 mb-6">
            Não compartilhamos suas informações pessoais com terceiros, Exceto quando necessário para verificação de identidade ou mediante ordem judicial.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">5. Seus Direitos</h2>
          <p className="text-gray-600 mb-6">
            Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos, entre em contato conosco.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">6. Contato</h2>
          <p className="text-gray-600 mb-6">
            Em caso de dúvidas sobre esta política, entre em contato através do nosso canal de suporte.
          </p>
        </div>
      </div>
    </div>
  )
}