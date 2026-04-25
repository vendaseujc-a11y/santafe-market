'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Check, Loader, Image as ImageIcon } from 'lucide-react'

interface SelfieValidatorProps {
  onVerified: (hash: string) => void
  onClose?: () => void
  produtoId?: string
}

export function SelfieValidator({ onVerified, onClose }: SelfieValidatorProps) {
  const [step, setStep] = useState<'camera' | 'preview' | 'verifying'>('camera')
  const [selfie, setSelfie] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (step === 'camera') {
      startCamera()
    }
    return () => stopCamera()
  }, [step])

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
      setError('Não foi possível acessar a câmera. Permita o acesso e tente novamente.')
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

  const verify = async () => {
    if (!selfie) return

    setStep('verifying')
    setLoading(true)
    setError(null)

    try {
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2)

      const response = await fetch('/api/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfie,
          sessaoId: sessionId,
          userAgent: navigator.userAgent,
        })
      })

      const data = await response.json()

      if (data.success) {
        onVerified(data.hash)
      } else {
        setError(data.error || 'Erro na verificação. Tente novamente.')
        setStep('preview')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm text-center">
        Para sua segurança, tire uma selfie para validar sua identidade antes de contatar o vendedor.
      </p>

      {step === 'camera' && (
        <>
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 border-4 border-white/50 rounded-full" />
            </div>
          </div>

          <button onClick={takePhoto} className="btn-ipê w-full">
            <Camera className="w-5 h-5" />
            Tirar Foto
          </button>
        </>
      )}

      {step === 'preview' && selfie && (
        <>
          <div className="rounded-xl overflow-hidden aspect-[4/3]">
            <img src={selfie} alt="Sua selfie" className="w-full h-full object-cover" />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={retake} className="btn-secondary flex-1">
              <X className="w-5 h-5" />
              Refazer
            </button>
            <button onClick={verify} className="btn-whatsapp flex-1">
              <Check className="w-5 h-5" />
              Validar
            </button>
          </div>
        </>
      )}

      {step === 'verifying' && (
        <div className="text-center py-8">
          <Loader className="w-12 h-12 mx-auto text-sertão-600 animate-spin mb-4" />
          <p className="text-gray-600">Validando sua identidade...</p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
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