'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { Modal, QRCodeModal } from '@/components/client'
import { Plus, Edit, Trash2, Check, QrCode, Eye, Search } from 'lucide-react'

const CATEGORIAS = [
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'vestuario', label: 'Vestuário' },
  { value: 'outros', label: 'Outros' },
]

export default function ProdutosPage() {
  const [user, setUser] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('')
  const [deleteModal, setDeleteModal] = useState<any>(null)
  const [qrModal, setQrModal] = useState<any>(null)
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
      await fetchProdutos(user.id)
    }
    
    checkAuth()
  }, [])

  const fetchProdutos = async (userId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('vendedor_id', userId)
      .order('created_at', { ascending: false })
    
    setProdutos(data || [])
    setLoading(false)
  }

  const handleExcluir = async (produto: any) => {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', produto.id)
    
    if (!error) {
      setProdutos(prev => prev.filter(p => p.id !== produto.id))
    }
    setDeleteModal(null)
  }

  const handleMarcarVendido = async (produto: any) => {
    const newStatus = produto.status === 'ativo' ? 'vendido' : 'ativo'
    const { error } = await supabase
      .from('produtos')
      .update({ status: newStatus })
      .eq('id', produto.id)
    
    if (!error) {
      setProdutos(prev => prev.map(p => 
        p.id === produto.id ? { ...p, status: newStatus } : p
      ))
    }
  }

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(search.toLowerCase())
    const matchesFiltro = !filtro || p.status === filtro
    return matchesSearch && matchesFiltro
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container-page py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/dashboard" className="text-sm text-sertão-600 hover:text-sertão-700 mb-2 inline-block">
                ← Voltar ao Painel
              </Link>
              <h1 className="text-2xl font-bold text-sertão-900">Meus Anúncios</h1>
            </div>
            <Link href="/dashboard/produtos/novo" className="btn-primary">
              <Plus className="w-5 h-5" />
              Novo Anúncio
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anúncios..."
                className="input pl-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input md:w-48"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="vendido">Vendidos</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-static p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 skeleton w-3/4" />
                      <div className="h-6 skeleton w-1/2" />
                      <div className="h-4 skeleton w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProdutos.length > 0 ? (
            <div className="space-y-4">
              {filteredProdutos.map((produto) => (
                <div key={produto.id} className="card-static p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {produto.imagens?.[0] ? (
                        <img src={produto.imagens[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{produto.titulo}</h3>
                          <span className={`badge ${produto.status === 'ativo' ? 'badge-novo' : 'badge-vendido'}`}>
                            {produto.status === 'ativo' ? 'Ativo' : 'Vendido'}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-sertão-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(Number(produto.preco))}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <span className="capitalize">{CATEGORIAS.find(c => c.value === produto.categoria)?.label}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {produto.visualizacoes || 0} visualizações
                        </span>
                        <span>
                          Criado em {new Intl.DateTimeFormat('pt-BR').format(new Date(produto.created_at))}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/produtos/${produto.id}/editar`} className="btn-secondary text-sm py-2">
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleMarcarVendido(produto)}
                          className={`btn-secondary text-sm py-2 ${produto.status === 'vendido' ? 'text-green-600 border-green-600' : ''}`}
                        >
                          <Check className="w-4 h-4" />
                          {produto.status === 'ativo' ? 'Marcar Vendido' : 'Reativar'}
                        </button>
                        <button
                          onClick={() => setQrModal({ slug: produto.slug, titulo: produto.titulo })}
                          className="btn-ghost text-sm py-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Divulgar
                        </button>
                        <button
                          onClick={() => setDeleteModal(produto)}
                          className="btn-ghost text-sm py-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card-static">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">
                {search ? 'Nenhum resultado encontrado' : 'Nenhum anúncio ainda'}
              </h3>
              <p className="text-gray-500 mb-4">
                {search ? 'Tente outro termo de busca' : 'Comece a vender criando seu primeiro anúncio!'}
              </p>
              {!search && (
                <Link href="/dashboard/produtos/novo" className="btn-primary">
                  <Plus className="w-5 h-5" />
                  Criar Anúncio
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Excluir Anúncio"
      >
        <p className="mb-4">Tem certeza que deseja excluir "{deleteModal?.titulo}"?</p>
        <p className="text-sm text-red-500 mb-4">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button onClick={() => handleExcluir(deleteModal)} className="btn-primary bg-red-500 hover:bg-red-600">
            <Trash2 className="w-5 h-5" />
            Excluir
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!qrModal}
        onClose={() => setQrModal(null)}
        title="Divulgar Anúncio"
      >
        <QRCodeModal slug={qrModal?.slug} titulo={qrModal?.titulo} />
      </Modal>

      <Footer />
    </div>
  )
}