import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/superabase-server'

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    let codeGenerated = false
    let newCode = ''
    let attempts = 0
    const maxAttempts = 10
    
    while (!codeGenerated && attempts < maxAttempts) {
      newCode = generateUniqueCode()
      
      const { data: existing } = await supabase
        .from('codigos_acesso')
        .select('id')
        .eq('codigo', newCode)
        .maybeSingle()
      
      if (!existing) {
        codeGenerated = true
      }
      attempts++
    }
    
    if (!codeGenerated) {
      return NextResponse.json({ error: 'Falha ao gerar código único' }, { status: 500 })
    }
    
    const { data, error } = await supabase
      .from('codigos_acesso')
      .insert({
        codigo: newCode,
        limite_utilizacoes: 1,
        utilizado: false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Tabela não existe. Execute o SQL no Supabase.' }, { status: 500 })
    }
    
    return NextResponse.json({ codigo: data })
  } catch (error) {
    console.error('Error generating code:', error)
    return NextResponse.json({ error: 'Tabela codigos_acesso não existe no banco. Execute o SQL no Supabase SQL Editor.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    const { data, error } = await supabase
      .from('codigos_acesso')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ codigos: [], error: error.message }, { status: 200 })
    }
    
    return NextResponse.json({ codigos: data || [] })
  } catch (error) {
    console.error('Error fetching codes:', error)
    return NextResponse.json({ codigos: [] }, { status: 200 })
  }
}