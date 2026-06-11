'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Check, Loader, Image as ImageIcon } from 'lucide-react'

interface SelfieValidatorProps {
  onVerified: (hash: string) => void
  onClose?: () => void
  produtoId?: string
}

export function SelfieValidator({ onVerified, onClose }: SelfieValidatorProps) {
  const [step, setStep] = useState<'challenge' | 'verifying'>('challenge')
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const options = [
    { id: 'car', emoji: '🚗', label: 'Carro', isCorrect: false },
    { id: 'cactus', emoji: '🌵', label: 'Cacto', isCorrect: true },
    { id: 'snow', emoji: '❄️', label: 'Floco de Neve', isCorrect: false }
  ]

  const DUMMY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

  const handleSelect = async (opt: typeof options[0]) => {
    setSelected(opt.id)
    if (!opt.isCorrect) {
      setError('Ops! Selecione a planta típica do site para continuar.')
      return
    }

    setError(null)
    setStep('verifying')
    setLoading(true)

    try {
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2)

      const response = await fetch('/api/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfie: DUMMY_PNG,
          sessaoId: sessionId,
          userAgent: navigator.userAgent,
        })
      })

      const data = await response.json()

      if (data.success) {
        onVerified(data.hash)
      } else {
        setError(data.error || 'Erro na verificação. Tente novamente.')
        setStep('challenge')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      setStep('challenge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 py-2">
      {step === 'challenge' && (
        <div className="space-y-5 animate-fade-in">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-semibold text-sertão-900 font-heading">
              Verificação Humana Antigolpe
            </h4>
            <p className="text-gray-500 text-sm">
              Para liberar o WhatsApp do anunciante com segurança, selecione a <strong>planta típica do site</strong>:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
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
            <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm text-center font-medium border border-red-100">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {step === 'verifying' && (
        <div className="text-center py-10 space-y-4 animate-fade-in">
          <div className="relative w-16 h-16 mx-auto">
            <Loader className="w-16 h-16 text-sertão-600 animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">🌵</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sertão-900">Validando que você é humano...</p>
            <p className="text-gray-400 text-xs">Isso leva apenas um instante</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface QRCodeModalProps {
  slug: string
  title: string
}

export function QRCodeModal({ slug, title }: QRCodeModalProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const productUrl = `${siteUrl}/anuncio/${slug}`

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const response = await fetch(`/api/qr/${slug}`)
        const data = await response.json()
        setQrUrl(data.qrCode)
      } catch (err) {
        console.error('Error fetching QR code:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQR()
  }, [slug])

  const copyLink = async () => {
    await navigator.clipboard.writeText(productUrl)
  }

  return (
    <div className="space-y-4 text-center">
      <h4 className="font-semibold">{title}</h4>

      <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block">
        {loading ? (
          <div className="w-48 h-48 flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-sertão-600" />
          </div>
        ) : qrUrl ? (
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-gray-400">
            Erro ao carregar QR
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Escaneie ou compartilhe o link abaixo
      </p>

      <div className="space-y-2">
        <input
          type="text"
          value={productUrl}
          readOnly
          className="input text-sm"
        />
        <button onClick={copyLink} className="btn-secondary w-full">
          Copiar Link
        </button>
      </div>
    </div>
  )
}

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-sertão-600 text-white',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-slide-up ${styles[type]} flex items-center gap-3`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}