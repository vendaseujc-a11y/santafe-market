'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Loader, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ValidarPage() {
  const [step, setStep] = useState<'challenge' | 'verifying' | 'success'>('challenge')
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hash, setHash] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [contato, setContato] = useState<{link: string, telefone: string} | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const produtoId = searchParams.get('produto') || searchParams.get('id')
  const providedHash = searchParams.get('hash')
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  const options = [
    { id: 'car', emoji: '🚗', label: 'Carro', isCorrect: false },
    { id: 'cactus', emoji: '🌵', label: 'Cacto', isCorrect: true },
    { id: 'snow', emoji: '❄️', label: 'Floco de Neve', isCorrect: false }
  ]

  const DUMMY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

  useEffect(() => {
    if (providedHash) {
      setHash(providedHash)
      setStep('success')
    }
  }, [providedHash])

  useEffect(() => {
    const fetchProduto = async () => {
      if (!produtoId) return
      
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', produtoId)
        .single()
      
      if (data) {
        setProduto(data)
        
        const { data: perfilData } = await supabase
          .from('perfis')
          .select('telefone')
          .eq('id', data.vendedor_id)
          .single()
        
        if (perfilData?.telefone) {
          const telefone = perfilData.telefone.replace(/\D/g, '')
          const message = `Olá, vi seu anúncio "${data.titulo}" no ${siteUrl}/anuncio/${data.slug}. Minha verificação foi concluída (ID: ${providedHash || hash}). Tenho interesse!`
          setContato({
            link: `https://wa.me/${telefone}?text=${encodeURIComponent(message)}`,
            telefone
          })
        }
      }
    }
    
    fetchProduto()
  }, [produtoId, providedHash, hash])

  const handleSelect = async (opt: typeof options[0]) => {
    setSelected(opt.id)
    if (!opt.isCorrect) {
      setError('Ops! Selecione a planta típica do site para continuar.')
      return
    }

    setError(null)
    setStep('verifying')

    try {
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2)

      const response = await fetch('/api/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId,
          selfie: DUMMY_PNG,
          sessaoId: sessionId,
          userAgent: navigator.userAgent,
        })
      })

      const data = await response.json()

      if (data.success) {
        setHash(data.hash)
        
        if (produto) {
          if (data.whatsappLink) {
            setContato({
              link: data.whatsappLink,
              telefone: produto.whatsapp || ''
            })
          } else {
            const { data: perfilData } = await supabase
              .from('perfis')
              .select('telefone')
              .eq('id', produto.vendedor_id)
              .single()
            
            if (perfilData?.telefone) {
              const telefone = perfilData.telefone.replace(/\D/g, '')
              const message = `Olá, vi seu anúncio "${produto.titulo}" no ${siteUrl}/anuncio/${produto.slug}. Minha verificação foi concluída (ID: ${data.hash}). Tenho interesse!`
              setContato({
                link: `https://wa.me/${telefone}?text=${encodeURIComponent(message)}`,
                telefone
              })
            }
          }
        }
        
        setStep('success')
        window.location.href = `/validar?id=${produtoId}&hash=${data.hash}`
      } else {
        setError(data.error || 'Erro na verificação. Tente novamente.')
        setStep('challenge')
      }
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.')
      setStep('challenge')
    }
  }

  const openWhatsApp = () => {
    if (contato?.link) {
      window.open(contato.link, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-sertão-900 flex flex-col">
      <div className="container-page py-6">
        <Link href="/" className="text-white hover:text-ipê-400 transition-colors">
          ← Voltar ao Marketplace
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-sertão-800/20">
          <h1 className="text-2xl font-bold text-sertão-950 text-center mb-6 font-heading">
            Verificação Humana
          </h1>

          {step === 'challenge' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <p className="text-gray-600 text-sm">
                  Para garantir a segurança das suas negociações e liberar o contato do anunciante, por favor selecione a <strong>planta típica do site</strong> abaixo:
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selected === opt.id
                        ? opt.isCorrect
                          ? 'border-green-500 bg-green-50/50'
                          : 'border-red-400 bg-red-50/50'
                        : 'border-gray-200 bg-white hover:border-ipê-400 hover:shadow-md'
                    }`}
                  >
                    <span className="text-4xl mb-2 transition-transform duration-300 hover:rotate-12">{opt.emoji}</span>
                    <span className="text-xs font-semibold text-gray-600 font-body">{opt.label}</span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm text-center font-medium border border-red-100 animate-slide-up">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-8 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <Loader className="w-16 h-16 text-sertão-600 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">🌵</span>
              </div>
              <div>
                <p className="text-sertão-900 font-semibold text-lg">Processando validação...</p>
                <p className="text-gray-400 text-sm mt-1">Aguarde um momento</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center animate-bounce-in">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <Check className="w-10 h-10 text-white" />
              </div>

              <div>
                <p className="text-sertão-950 text-xl font-bold font-heading">Verificação Concluída!</p>
                <p className="text-gray-500 text-xs mt-2">
                  Código de segurança: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{hash}</span>
                </p>
              </div>

              {contato ? (
                <button onClick={openWhatsApp} className="btn-whatsapp w-full text-lg py-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-100 transition-all duration-300">
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                </button>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-gray-500 text-sm">
                    Anunciante não possui WhatsApp cadastrado
                  </p>
                </div>
              )}

              <Link href={produto?.slug ? `/anuncio/${produto.slug}` : '/'} className="btn-secondary w-full block py-3 text-center font-medium">
                Voltar ao Anúncio
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}