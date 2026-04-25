import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/superabase-server'
import { Header, Footer } from '@/components'
import { MapPin, User, Calendar, Eye, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { VerificarETerceiro } from './VerificarETerceiro'
import { ShareButton, QrButton } from './AnuncioActions'

interface Props {
  params: { slug: string }
}

async function getProduto(slug: string) {
  const supabase = await createServerSupabase()
  
  const { data: produto } = await supabase
    .from('produtos')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'ativo')
    .single()

  if (produto) {
    await supabase.rpc('increment_views', { slug })
  }

  return produto
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const produto = await getProduto(params.slug)
  
  if (!produto) {
    return {
      title: 'Anúncio Não Encontrado',
    }
  }

  return {
    title: `${produto.titulo} - SantaFé Marketplace`,
    description: produto.descricao.slice(0, 160),
    openGraph: {
      title: produto.titulo,
      description: produto.descricao.slice(0, 150),
      images: produto.imagens?.[0] ? [produto.imagens[0]] : [],
    },
  }
}

export default async function AnuncioPage({ params }: Props) {
  const produto = await getProduto(params.slug)

  if (!produto) {
    notFound()
  }

  const imagens = produto.imagens || []
  const preco = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(produto.preco))

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(produto.created_at))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-sertão-600">Início</Link>
            <span>/</span>
            <Link href={`/?categoria=${produto.categoria}`} className="hover:text-sertão-600 capitalize">
              {produto.categoria}
            </Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-[200px]">{produto.titulo}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
                {imagens[0] ? (
                  <img
                    src={imagens[0]}
                    alt={produto.titulo}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-white">
                    📦
                  </div>
                )}
              </div>

              {imagens.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagens.map((img: string, index: number) => (
                    <button
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-white border-2 border-transparent hover:border-sertão-400 transition-colors"
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <span className="badge bg-sertão-100 text-sertão-700 capitalize mb-2">
                  {produto.categoria}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-sertão-900 mt-2">
                  {produto.titulo}
                </h1>
              </div>

              <div className="text-4xl md:text-5xl font-bold text-sertão-600">
                {preco}
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{produto.visualizacoes || 0} visualizações</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Publicado em {dataFormatada}</span>
                </div>
              </div>

              <div className="bg-sertão-50 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Sobre este anúncio</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {produto.descricao}
                </p>
              </div>

              {produto.localizacao && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{produto.localizacao}</span>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-sertao rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Anunciante</p>
                    <p className="text-sm text-gray-500">Vendedor Verificado</p>
                  </div>
                </div>
              </div>

              <VerificarETerceiro produto={produto} />

              <div className="flex gap-3">
                <ShareButton produto={produto} />
                <QrButton slug={produto.slug} titulo={produto.titulo} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}