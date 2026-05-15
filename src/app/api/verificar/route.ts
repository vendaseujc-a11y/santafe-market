import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid'

const verifyRateLimit = new Map<string, { count: number; timestamp: number }>()
const VERIFY_RATE_LIMIT = 5
const VERIFY_RATE_WINDOW = 60000

function checkVerifyRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = verifyRateLimit.get(ip)
  
  if (!record || now - record.timestamp > VERIFY_RATE_WINDOW) {
    verifyRateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= VERIFY_RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'

  if (!checkVerifyRateLimit(clientIP)) {
    return NextResponse.json({ 
      error: 'Muitas tentativas de verificação. Tente novamente mais tarde.' 
    }, { status: 429 })
  }

  try {
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Tipo de conteúdo inválido' }, { status: 415 })
    }

    const body = await request.json()
    const { produtoId, selfie, sessaoId, userAgent } = body

    if (!selfie || typeof selfie !== 'string') {
      return NextResponse.json({ error: 'Selfie inválida' }, { status: 400 })
    }

    if (selfie.length > 5000000) {
      return NextResponse.json({ error: 'Selfie muito grande' }, { status: 400 })
    }

    if (!selfie.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Formato de imagem inválido' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    )

    let produto = null
    if (produtoId) {
      if (typeof produtoId !== 'string' || produtoId.length !== 36) {
        return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 })
      }

      const { data } = await supabase
        .from('produtos')
        .select('*, perfis!vendedores(telefone)')
        .eq('id', produtoId)
        .single()
      
      produto = data
    }

    const hashValidacao = `SF${Date.now().toString(36).toUpperCase()}${uuidv4().substring(0, 4).toUpperCase()}`

    const selfieBase64 = selfie.replace(/^data:image\/\w+;base64,/, '')
    const selfieBuffer = Buffer.from(selfieBase64, 'base64')

    if (selfieBuffer.length > 5242880) {
      return NextResponse.json({ error: 'Selfie muito grande (máx 5MB)' }, { status: 400 })
    }

    let selfieUrl = ''
    const verificationPath = `verificacoes/${uuidv4()}.jpg`
    
    const { error: uploadError } = await supabase.storage
      .from('verificacoes')
      .upload(verificationPath, selfieBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('verificacoes')
        .getPublicUrl(verificationPath)
      
      selfieUrl = publicUrl
    }

    const { error: insertError } = await supabase
      .from('verificacoes')
      .insert({
        sessao_id: sessaoId && typeof sessaoId === 'string' && sessaoId.length >= 10 ? sessaoId : uuidv4(),
        produto_id: produtoId,
        selfie_url: selfieUrl,
        hash_validacao: hashValidacao,
        ip_address: clientIP,
        user_agent: userAgent && typeof userAgent === 'string' ? userAgent.substring(0, 500) : 'unknown',
      })

    if (insertError) {
      console.error('Insert verification error:', insertError)
    }

    let whatsappLink = null
    if (produto?.perfis?.telefone) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const message = `Olá, vi seu anúncio "${produto?.titulo}" no ${siteUrl}/anuncio/${produto?.slug}. Minha identidade foi validada (ID: ${hashValidacao}). Tenho interesse!`
      const encodedMessage = encodeURIComponent(message)
      const telefone = produto.perfis.telefone.replace(/\D/g, '')
      whatsappLink = `https://wa.me/${telefone}?text=${encodedMessage}`
    }

    return NextResponse.json({
      success: true,
      hash: hashValidacao,
      whatsappLink,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Erro na verificação' }, { status: 500 })
  }
}