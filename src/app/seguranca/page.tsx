'use client'

import { useState } from 'react'
import { Shield, Lock, Eye, AlertTriangle, UserCheck, Phone, Mail } from 'lucide-react'
import { Header, Footer } from '@/components'

export default function SegurancaPage() {
  const [aceito, setAceito] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleAceitar = () => {
    localStorage.setItem('politicasAceitas', 'true')
    setEnviado(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container-page py-12">
          <h1 className="text-3xl font-bold text-sertão-900 mb-4">Políticas de Segurança</h1>
          <p className="text-gray-600 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Shield className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verificação de Identidade</h3>
              <p className="text-gray-600">
                Todos os compradores passam por verificação de selfie em vídeo antes de contatar vendedores.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <Lock className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dados Criptografados</h3>
              <p className="text-gray-600">
                Suas informações pessoais e selfies são armazenadas com criptografia de nível bancário.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <Eye className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Proteção Contra Fraudes</h3>
              <p className="text-gray-600">
                Monitoramos atividades suspeitas e suspendemos contas que violam nossas políticas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <AlertTriangle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dicas de Segurança</h3>
              <p className="text-gray-600">
                Nunca compartilhe senhas, códigos ou informações bancárias com terceiros.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Atenção: Golpes Comuns
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Nunca passe dados bancários</strong> pelo WhatsApp ou chat. O site NÃO solicita essa informação.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Cuidado com preços muito baixos</strong> que parecem bons demais.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Verifique a identidade</strong> do comprador antes de fechar negócio.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Não clique em links</strong> suspeitos enviados por mensaje.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Use apenas o chat oficial</strong> do site para negociações.</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              Como Denunciar
            </h2>
            <p className="text-gray-700 mb-4">
              Se você identificar alguma atividade suspeita ou suspeita de golpe, denuncie imediatamente:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span>WhatsApp: (55) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span>E-mail: seguranca@santafe.market</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-sertão-900 mb-4">Termo de aceite</h2>
            <p className="text-gray-600 mb-4">
              Ao usar o SantaFé Marketplace, você declara ter lido e concordar com as nossas políticas de segurança.
            </p>
            
            {enviado ? (
              <div className="bg-green-100 border border-green-400 text-green-700 rounded-xl p-4">
                Obrigado! Você aceitou nuestras políticas de segurança.
              </div>
            ) : (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceito}
                  onChange={(e) => setAceito(e.target.checked)}
                  className="w-5 h-5 mt-1 rounded text-green-600"
                />
                <span className="text-gray-700">
                  Eu li e aceito as Políticas de Segurança do SantaFé Marketplace.
                </span>
              </label>
            )}

            {aceito && !enviado && (
              <button
                onClick={handleAceitar}
                className="btn-primary mt-4"
              >
                Confirmar Aceite
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}