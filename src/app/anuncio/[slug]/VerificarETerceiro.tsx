'use client'

import { useState } from 'react'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { Modal, SelfieValidator } from '@/components/client'

interface VerificarETerceiroProps {
  produto: {
    id: string
    slug: string
    titulo: string
    whatsapp?: string
  }
}

export function VerificarETerceiro({ produto }: VerificarETerceiroProps) {
  const [showValidator, setShowValidator] = useState(false)
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null)

  const handleVerified = (hash: string) => {
    setVerifiedHash(hash)
    setShowValidator(false)
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  if (verifiedHash) {
    const whatsappNum = produto.whatsapp?.replace(/\D/g, '') || '5511999999999'
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=Olá! Estou interessado no seu anúncio: ${produto.titulo}`
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <p className="text-green-700 font-semibold">Identidade Verificada!</p>
        </div>
        <p className="text-green-600 text-sm mb-3">
          Sua identidade foi validada. Entre em contato com o anunciante.
        </p>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp w-full text-lg py-4"
        >
          <MessageCircle className="w-6 h-6" />
          Contatar no WhatsApp
        </a>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowValidator(true)}
        className="btn-whatsapp w-full text-lg py-4"
      >
        <ExternalLink className="w-6 h-6" />
        Comprar via WhatsApp
      </button>

      <Modal
        isOpen={showValidator}
        onClose={() => setShowValidator(false)}
        title="Validar Identidade"
      >
        <SelfieValidator
          onVerified={handleVerified}
        onClose={() => setShowValidator(false)}
        />
      </Modal>
    </>
  )
}