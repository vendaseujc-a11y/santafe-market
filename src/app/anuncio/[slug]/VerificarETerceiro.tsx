'use client'

import { useState } from 'react'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { Modal, SelfieValidator } from '@/components/client'

interface VerificarETerceiroProps {
  produto: {
    id: string
    slug: string
    titulo: string
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
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-700 font-semibold mb-2">Identidade Verificada!</p>
        <p className="text-green-600 text-sm mb-3">
          Sua identidade foi validada com sucesso. Entre em contato com o anunciante.
        </p>
        <a 
          href={`${siteUrl}/validar?id=${produto.id}&hash=${verifiedHash}`}
          className="btn-whatsapp w-full text-lg py-4"
        >
          <MessageCircle className="w-6 h-6" />
          Contatar Anunciante
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