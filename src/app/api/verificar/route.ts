import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { produtoId, selfie, sessaoId, userAgent } = body

    if (!selfie) {
      return NextResponse.json({ error: 'Selfie é obrigatória' }, { status: 400 })
    }

    const cookieStore = await cookies()
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

    let selfieUrl = ''
    const verificationPath = `verificacoes/${uuidv4()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
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
        sessao_id: sessaoId || uuidv4(),
        produto_id: produtoId,
        selfie_url: selfieUrl,
        hash_validacao: hashValidacao,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: userAgent,
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