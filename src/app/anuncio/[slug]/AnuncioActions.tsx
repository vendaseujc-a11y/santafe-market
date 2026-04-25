'use client'

import { useState } from 'react'
import { Share2, QrCode } from 'lucide-react'
import { Modal, QRCodeModal } from '@/components/client'

interface ShareButtonProps {
  produto: {
    slug: string
    titulo: string
    descricao: string
  }
}

export function ShareButton({ produto }: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const share = async () => {
    setLoading(true)
    const url = `${siteUrl}/anuncio/${produto.slug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: produto.titulo,
          text: produto.descricao.slice(0, 100),
          url,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
    setLoading(false)
  }

  return (
    <button onClick={share} className="btn-secondary" disabled={loading}>
      <Share2 className="w-5 h-5" />
      {loading ? 'Copiado!' : 'Compartilhar'}
    </button>
  )
}

interface QrButtonProps {
  slug: string
  titulo: string
}

export function QrButton({ slug, titulo }: QrButtonProps) {
  const [showQR, setShowQR] = useState(false)

  return (
    <>
      <button onClick={() => setShowQR(true)} className="btn-secondary">
        <QrCode className="w-5 h-5" />
        QR Code
      </button>

      <Modal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="QR Code do Anúncio"
      >
        <QRCodeModal slug={slug} title={titulo} />
      </Modal>
    </>
  )
}