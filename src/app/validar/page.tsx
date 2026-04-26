'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, Check, X, Loader, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ValidarPage() {
  const [step, setStep] = useState<'camera' | 'preview' | 'verifying' | 'success'>('camera')
  const [selfie, setSelfie] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hash, setHash] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [contato, setContato] = useState<{link: string, telefone: string} | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const produtoId = searchParams.get('produto') || searchParams.get('id')
  const providedHash = searchParams.get('hash')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
        .select('*, perfis!vendedores(telefone)')
        .eq('id', produtoId)
        .single()
      
      if (data) {
        setProduto(data)
      }
    }
    
    fetchProduto()
  }, [produtoId])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setSelfie(imageData)
      setStep('preview')
      stopCamera()
    }
  }

  const retake = () => {
    setSelfie(null)
    setStep('camera')
    startCamera()
  }

  const verifyIdentity = async () => {
    if (!selfie) return

    setStep('verifying')
    setError(null)

    try {
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2)

      const response = await fetch('/api/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId,
          selfie,
          sessaoId: sessionId,
          userAgent: navigator.userAgent,
        })
      })

      const data = await response.json()

      if (data.success) {
        setHash(data.hash)
        
        if (produto?.perfis?.telefone) {
          const telefone = produto.perfis.telefone.replace(/\D/g, '')
          const message = `Olá, vi seu anúncio "${produto.titulo}" no ${siteUrl}/anuncio/${produto.slug}. Minha identidade foi validada (ID: ${data.hash}). Tenho interesse!`
          setContato({
            link: `https://wa.me/${telefone}?text=${encodeURIComponent(message)}`,
            telefone
          })
        }
        
        setStep('success')

        window.location.href = `/validar?id=${produtoId}&hash=${data.hash}`
      } else {
        setError(data.error || 'Erro na verificação. Tente novamente.')
        setStep('preview')
      }
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.')
      setStep('preview')
    }
  }

  const openWhatsApp = () => {
    if (contato?.link) {
      window.open(contato.link, '_blank')
    }
  }

  useEffect(() => {
    if (step === 'camera') {
      startCamera()
    }
    return () => stopCamera()
  }, [step])

  return (
    <div className="min-h-screen bg-sertão-900 flex flex-col">
      <div className="container-page py-6">
        <Link href="/" className="text-white hover:text-ipê-400 transition-colors">
          ← Voltar ao Marketplace
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Validação de Identidade
          </h1>

          {step === 'camera' && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-white/50 rounded-full" />
                </div>
              </div>

              <p className="text-sertão-200 text-sm text-center">
                Posicione seu rosto dentro do círculo
              </p>

              <button onClick={takePhoto} className="btn-ipê w-full">
                <Camera className="w-5 h-5" />
                Tirar Selfie
              </button>
            </div>
          )}

          {step === 'preview' && selfie && (
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                <img src={selfie} alt="Sua selfie" className="w-full h-full object-cover" />
              </div>

              {error && (
                <div className="bg-red-500 text-white rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={retake} className="btn-secondary flex-1">
                  <X className="w-5 h-5" />
                  Refazer
                </button>
                <button onClick={verifyIdentity} className="btn-whatsapp flex-1">
                  <Check className="w-5 h-5" />
                  Validar
                </button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center">
              <Loader className="w-16 h-16 mx-auto mb-6 text-ipê-400 animate-spin" />
              <p className="text-white text-lg">Validando sua identidade...</p>
              <p className="text-sertão-300 text-sm mt-2">Aguarde um momento</p>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
                <Check className="w-10 h-10 text-white" />
              </div>

              <div>
                <p className="text-white text-xl font-semibold">Identidade Validada!</p>
                <p className="text-sertão-300 text-sm mt-2">
                  ID de verificação: <span className="font-mono">{hash}</span>
                </p>
              </div>

              {contato ? (
                <button onClick={openWhatsApp} className="btn-whatsapp w-full text-lg py-4">
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </button>
              ) : (
                <div className="bg-sertão-800 rounded-xl p-4">
                  <p className="text-sertão-300 text-sm">
                    Anunciante não tem WhatsApp cadastrado
                  </p>
                </div>
              )}

              <Link href={produto?.slug ? `/anuncio/${produto.slug}` : '/'} className="btn-secondary w-full">
                Voltar ao Anúncio
              </Link>
            </div>
          )}
        </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}