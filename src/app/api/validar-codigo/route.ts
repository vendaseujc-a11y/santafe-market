import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/superabase-server'
import { validateCode } from '@/lib/security'

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now - record.timestamp > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'

  if (!checkRateLimit(clientIP)) {
    return NextResponse.json({ 
      error: 'Muitas tentativas. Tente novamente mais tarde.' 
    }, { status: 429 })
  }

  try {
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ valido: false, error: 'Tipo de conteúdo inválido' }, { status: 415 })
    }

    const body = await request.json()
    const { codigo, userId, utilizar } = body
    
    if (!codigo) {
      return NextResponse.json({ valido: false, error: 'Código é obrigatório' }, { status: 400 })
    }

    const validation = validateCode(codigo)
    if (!validation.valid) {
      return NextResponse.json({ valido: false, error: validation.error }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const codigoUpper = validation.sanitized!

    const { data: codigoData, error: codigoError } = await supabase
      .from('codigos_acesso')
      .select('*')
      .eq('codigo', codigoUpper)
      .single()

    if (codigoError || !codigoData) {
      return NextResponse.json({ valido: false, error: 'Código inválido' }, { status: 200 })
    }

    if (codigoData.utilizado) {
      return NextResponse.json({ valido: false, error: 'Código já foi utilizado' }, { status: 200 })
    }

    if (codigoData.utilizadas >= codigoData.limite_utilizacoes) {
      return NextResponse.json({ valido: false, error: 'Código expirado' }, { status: 200 })
    }

    if (utilizar && userId) {
      if (typeof userId !== 'string' || userId.length !== 36) {
        return NextResponse.json({ valido: false, error: 'ID de usuário inválido' }, { status: 400 })
      }

      await supabase
        .from('codigos_acesso')
        .update({ utilizado: true, utilizadas: codigoData.utilizadas + 1, usuario_id: userId })
        .eq('codigo', codigoUpper)
    }

    return NextResponse.json({ valido: true }, { status: 200 })
  } catch (error) {
    console.error('Error validating code:', error)
    return NextResponse.json({ valido: false, error: 'Erro ao validar código' }, { status: 500 })
  }
}