import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    console.log('Iniciando exclusão para:', userId, email)

    // Excluir produtos
    await fetch(`${supabaseUrl}/rest/v1/produtos?vendedor_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('Produtos excluídos')
    
    // Excluir perfil
    await fetch(`${supabaseUrl}/rest/v1/perfis?id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('Perfil excluído')
    
    // Limpar referência em codigos_acesso
    await fetch(`${supabaseUrl}/rest/v1/codigos_acesso?usuario_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario_id: null }),
    })
    console.log('Código liberado')
    
    // Excluir usuário do auth via Management API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })
    
    const authResult = await authResponse.text()
    console.log('Auth response:', authResponse.status, authResult)
    
    if (!authResponse.ok && !authResult.includes('not found')) {
      return NextResponse.json({ 
        error: 'Erro ao excluir autenticação',
        details: authResult 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: error.message || 'Erro ao excluir conta' }, { status: 500 })
  }
}