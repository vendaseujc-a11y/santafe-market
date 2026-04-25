'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { Toast } from '@/components/client'
import { Upload, X, Loader } from 'lucide-react'

const CATEGORIAS = [
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'vestuario', label: 'Vestuário' },
  { value: 'outros', label: 'Outros' },
]

export default function EditarProdutoPage() {
  const [user, setUser] = useState<any>(null)
  const [produto, setProduto] = useState<any>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    categoria: '',
    localizacao: '',
  })
  const [imagens, setImagens] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      const { data: produto } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!produto) {
        router.push('/dashboard/produtos')
        return
      }

      if (produto.vendedor_id !== user.id) {
        router.push('/dashboard/produtos')
        return
      }

      setProduto(produto)
      setFormData({
        titulo: produto.titulo,
        descricao: produto.descricao,
        preco: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.preco)),
        categoria: produto.categoria,
        localizacao: produto.localizacao || '',
      })
      setImagens(produto.imagens || [])
      setLoading(false)
    }
    
    fetchData()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (newImages.length + files.length > 5) {
      setError('Máximo de 5 imagens')
      return
    }
    
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setNewImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeExistingImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const formatarPreco = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) return ''
    const cents = parseInt(digits) / 100
    return cents.toLocaleString('pt-BR')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!formData.titulo || !formData.descricao || !formData.preco || !formData.categoria) {
      setError('Preencha todos os campos obrigatórios')
      setSaving(false)
      return
    }

    try {
      let allImages = [...imagens]

      for (const file of newImages) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('folder', 'produtos')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (res.ok) {
          const data = await res.json()
          allImages.push(data.url)
        }
      }

      const updates = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco.replace(/\D/g, '')) / 100,
        categoria: formData.categoria,
        imagens: allImages,
        localizacao: formData.localizacao,
      }

      const { error: updateError } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', params.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      setToast({ message: 'Anúncio atualizado com sucesso!', type: 'success' })
      
      setTimeout(() => {
        router.push('/dashboard/produtos')
      }, 1500)
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-sertão-600" />
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
          <Link href="/dashboard/produtos" className="text-sm text-sertão-600 hover:text-sertão-700 mb-4 inline-block">
            ← Voltar para Meus Anúncios
          </Link>

          <h1 className="text-2xl font-bold text-sertão-900 mb-8">Editar Anúncio</h1>

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
              <label className="label">Fotos ({imagens.length + newImages.length}/5)</label>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {imagens.map((url, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {previews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 px-1 bg-sertão-600 text-white text-xs rounded">Novo</span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {imagens.length + newImages.length < 5 && (
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
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
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