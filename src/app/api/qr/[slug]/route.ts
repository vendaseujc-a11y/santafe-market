import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface Props {
  params: { slug: string }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const url = `${siteUrl}/anuncio/${params.slug}`

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#2D5016',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    return NextResponse.json({ qrCode: qrCodeDataUrl })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Erro na geração do QR Code' }, { status: 500 })
  }
}