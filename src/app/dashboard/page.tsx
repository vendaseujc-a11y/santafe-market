'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { Package, Eye, MessageSquare, TrendingUp, Plus, Edit, Trash2, Check, QrCode, AlertTriangle, X } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      let { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (!perfil) {
        const { data: newPerfil } = await supabase
          .from('perfis')
          .insert({
            id: user.id,
            nome: user.email?.split('@')[0] || 'Vendedor',
            telefone: '',
          })
          .select()
          .single()
        
        if (newPerfil) {
          perfil = newPerfil
        }
      }
      
      setPerfil(perfil)
      
      const { data: produtos } = await supabase
        .from('produtos')
        .select('*')
        .eq('vendedor_id', user.id)
        .order('created_at', { ascending: false })
      
      setProdutos(produtos || [])
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const stats = {
    total: produtos.length,
    ativos: produtos.filter(p => p.status === 'ativo').length,
    visualizacoes: produtos.reduce((acc, p) => acc + (p.visualizacoes || 0), 0),
  }

  const excluirConta = async () => {
    if (!user) return
    
    setDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch('/api/excluir-conta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email })
      })
      
      const data = await response.json()
      console.log('Resposta exclusão:', data)
      
      if (data.error) {
        setDeleteError(data.error)
        setDeleting(false)
        return
      }
      
      // Limpar tudo e redirecionar
      await supabase.auth.signOut()
      sessionStorage.clear()
      localStorage.clear()
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Erro ao excluir conta:', err)
      setDeleteError('Erro ao excluir conta. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-4xl">⏳</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container-page py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-sertão-900">Painel do Vendedor</h1>
              <p className="text-gray-500">Bem-vindo, {perfil?.nome || user?.email}</p>
            </div>
            <Link href="/dashboard/produtos/novo" className="btn-primary">
              <Plus className="w-5 h-5" />
              Novo Anúncio
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-static p-4">
              <Package className="w-8 h-8 text-sertão-600 mb-2" />
              <p className="text-2xl font-bold text-sertão-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total de Anúncios</p>
            </div>
            <div className="card-static p-4">
              <Check className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold text-sertão-900">{stats.ativos}</p>
              <p className="text-sm text-gray-500">Anúncios Ativos</p>
            </div>
            <div className="card-static p-4">
              <Eye className="w-8 h-8 text-ipê-400 mb-2" />
              <p className="text-2xl font-bold text-sertão-900">{stats.visualizacoes}</p>
              <p className="text-sm text-gray-500">Visualizações</p>
            </div>
            <div className="card-static p-4">
              <MessageSquare className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-sertão-900">0</p>
              <p className="text-sm text-gray-500">Mensagens</p>
            </div>
          </div>

<div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-sertão-900">Seus Anúncios</h2>
              <Link href="/dashboard/produtos" className="text-sm text-sertão-600 hover:text-sertão-700">
                Ver todos →
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Conta</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
<p className="text-gray-600 mb-6">
              Ao excluir sua conta, todos os seus anúncios e dados serão removidos permanentemente. 
              Você não poderÃ¡ recuperar esses dados depois.
            </p>

            {deleteError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={excluirConta}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}