'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { Toast } from '@/components/client'
import { Upload, X, Image, Loader } from 'lucide-react'

const CATEGORIAS = [
  { value: 'promocao', label: 'Promoção' },
  { value: 'produtos', label: 'Produtos em Geral' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'vestuario', label: 'Vestuário' },
  { value: 'outros', label: 'Outros' },
]

export default function NovoProdutoPage() {
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    categoria: '',
    localizacao: 'Santa Fé do Sul - SP',
    whatsapp: '',
  })
  const [imagens, setImagens] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
        const { data: newPerfil, error: perfilError } = await supabase
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
    }
    
    checkAuth()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (imagens.length + files.length > 5) {
      setError('Máximo de 5 imagens')
      return
    }
    
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagens(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setImagens(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const formatarPreco = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) return ''
    const cents = parseInt(digits) / 100
    return cents.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const gerarSlug = (titulo: string): string => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.titulo || !formData.descricao || !formData.preco || !formData.categoria) {
      setError('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    try {
      const slug = gerarSlug(formData.titulo)
      const imagensUrls: string[] = []

      for (const file of imagens) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('folder', 'produtos')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (res.ok) {
          const data = await res.json()
          imagensUrls.push(data.url)
        }
      }

      const { data: produto, error: insertError } = await supabase
        .from('produtos')
        .insert({
          vendedor_id: user.id,
          slug,
          titulo: formData.titulo,
          descricao: formData.descricao,
          preco: parseFloat(formData.preco.replace(/\D/g, '')) / 100,
          categoria: formData.categoria,
          imagens: imagensUrls,
          localizacao: formData.localizacao,
          whatsapp: formData.whatsapp,
          status: 'ativo',
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.message.includes('unique')) {
          setError('Já existe um anúncio com este título. Altere o título.')
        } else {
          setError(insertError.message)
        }
        setLoading(false)
        return
      }

      setToast({ message: 'Anúncio publicado com sucesso!', type: 'success' })
      
      setTimeout(() => {
        router.push('/dashboard/produtos')
      }, 1500)
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container-page py-8">
          <Link href="/dashboard/produtos" className="text-sm text-sertão-600 hover:text-sertão-700 mb-4 inline-block">
            ← Voltar para Meus Anúncios
          </Link>

          <h1 className="text-2xl font-bold text-sertão-900 mb-8">Criar Novo Anúncio</h1>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">Título do Anúncio *</label>
              <input
                type="text"
                name="titulo"
                placeholder="Ex: iPhone 14 Pro Max 256GB"
                className="input"
                value={formData.titulo}
                onChange={handleChange}
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.titulo.length}/100 caracteres</p>
            </div>

            <div>
              <label className="label">Descrição *</label>
              <textarea
                name="descricao"
                placeholder="Descreva seu produto ou serviço em detalhes..."
                className="input min-h-[150px] resize-y"
                value={formData.descricao}
                onChange={handleChange}
                maxLength={2000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.descricao.length}/2000 caracteres</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Preço *</label>
                <input
                  type="text"
                  name="preco"
                  placeholder="R$ 0,00"
                  className="input"
                  value={formData.preco}
                  onChange={(e) => {
                    const formatted = formatarPreco(e.target.value)
                    setFormData(prev => ({ ...prev, preco: formatted }))
                  }}
                  required
                />
              </div>

              <div>
                <label className="label">Categoria *</label>
                <select
                  name="categoria"
                  className="input"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Localização</label>
              <input
                type="text"
                name="localizacao"
                placeholder="Bairro ou Cidade"
                className="input"
                value={formData.localizacao}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">WhatsApp para Contato</label>
              <input
                type="tel"
                name="whatsapp"
                placeholder="(55) 99999-9999"
                className="input"
                value={formData.whatsapp}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Número que será mostrado ao comprador após verificação</p>
            </div>

            <div>
              <label className="label">Fotos (até 5)</label>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {imagens.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-sertão-400 flex flex-col items-center justify-center transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Adicionar</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/produtos')}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar Anúncio'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}