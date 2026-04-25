import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/superabase-server'

export async function POST(request: NextRequest) {
  try {
    const { codigo, userId, utilizar } = await request.json()
    
    if (!codigo) {
      return NextResponse.json({ valido: false, error: 'Código é obrigatório' }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const codigoUpper = codigo.toUpperCase()

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
      await supabase
        .from('codigos_acesso')
        .update({ utilizado: true, utilizadas: codigoData.utilizadas + 1, usuario_id: userId })
        .eq('codigo', codigoUpper)
    }

    return NextResponse.json({ valido: true, codigo: codigoData }, { status: 200 })
  } catch (error) {
    console.error('Error validating code:', error)
    return NextResponse.json({ valido: false, error: 'Erro ao validar código' }, { status: 500 })
  }
}