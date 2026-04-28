import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - SantaFé Marketplace',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-bold text-sertão-900 mb-8">Termos de Uso</h1>
        
        <div className="prose prose-sertao max-w-none">
          <p className="text-gray-600 mb-6">
           Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">1. Introdução</h2>
          <p className="text-gray-600 mb-6">
            Bem-vindo ao SantaFé Marketplace. Ao usar este site, você concorda com os seguintes termos de uso. Se não concordar com qualquer parte destes termos, não utilize o site.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">2. Verificação de Identidade</h2>
          <p className="text-gray-600 mb-6">
            Para garantir a segurança de todas as transações, exigimos que compradores validem sua identidade através de selfie com vídeo antes de contatar vendedores. Este processo ajuda a prevenir fraudes e golpes.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">3. Responsabilidades do Vendedor</h2>
          <p className="text-gray-600 mb-6">
            Os vendedores são responsáveis por fornecer informações verdadeiras sobre seus produtos, manter seus anúncios atualizados e responder às consultas dos compradores de forma profissional.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">4. Responsabilidades do Comprador</h2>
          <p className="text-gray-600 mb-6">
            Os compradores devem interagir de forma respeitosa com os vendedores, realizar a verificação de identidade antes de contatar anúncios e evitar práticas fraudulentas.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">5. Proibições</h2>
          <p className="text-gray-600 mb-6">
            É proibido publicar contenido illegítimo, enganoso ou fraudulento. Qualquer violação destes termos pode resultar em suspensão ou cancelamento da conta.
          </p>

          <h2 className="text-xl font-semibold text-sertão-900 mb-4">6. Isenção de Responsabilidade</h2>
          <p className="text-gray-600 mb-6">
            O SantaFé Marketplace é uma plataforma de conexão entre compradores e vendedores. Não garantimos a qualidade, segurança ou legalidade dos produtos anunciados. Transactions são realizadas diretamente entre as partes.
          </p>
        </div>
      </div>
    </div>
  )
}