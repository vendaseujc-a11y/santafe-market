'use client'

import { Crown, Check, Star, Gift, MessageCircle, TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'

const beneficios = [
  { icon: TrendingUp, titulo: 'Produtos em Destaque', descricao: 'Seus anúncios aparecem em primeiro lugar nas buscas' },
  { icon: Shield, titulo: 'Selo Verificado', descricao: ' distintivo de vendedor premium para mais confiança' },
  { icon: Gift, titulo: 'Anúncios Ilimitados', descricao: 'Publique quantos produtos quiser sem limites' },
  { icon: Star, titulo: 'Suporte Prioritário', descricao: 'Atendimento rápidovia WhatsApp' },
]

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-sertão-900">
      <div className="container-page py-6">
        <Link href="/" className="text-white hover:text-ipê-400 transition-colors">
          ← Voltar ao Marketplace
        </Link>
      </div>

      <main className="container-page pb-16">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-yellow-400 rounded-full flex items-center justify-center mb-6">
            <Crown className="w-10 h-10 text-sertão-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Clube Premium
          </h1>
          <p className="text-xl text-sertão-300 max-w-2xl mx-auto">
            Torne-se um vendedor premium e tenha muito mais visibilidade e recursos exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {beneficios.map((item, index) => (
            <div key={index} className="bg-sertão-800 rounded-2xl p-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-sertão-900" />
              </div>
              <h3 className="text-white font-semibold mb-2">{item.titulo}</h3>
              <p className="text-sertão-300 text-sm">{item.descricao}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-sertão-900 mb-4">
            Em breve: Assinatura Premium
          </h2>
          <p className="text-sertão-800 mb-6">
            Estamos preparando algo especial para você. Em Breve, voce podera assinar premium e ter todos esses beneficios!
          </p>
          <div className="inline-flex items-center gap-2 bg-sertão-900 text-white px-6 py-3 rounded-xl">
            <MessageCircle className="w-5 h-5" />
            <span>Fique atento às novidades!</span>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/login" className="btn-secondary text-white border-white hover:bg-white/10">
            Já sou membro - Fazer Login
          </Link>
        </div>
      </main>
    </div>
  )
}