import Link from 'next/link'
import { createServerSupabase } from '@/lib/superabase-server'
import { Header, Footer, SearchBar, ProductCard } from '@/components'
import { Plus, TrendingUp, Shield, MapPin } from 'lucide-react'
import { headers } from 'next/headers'

async function getProdutos(searchParams: { busca?: string; categoria?: string }) {
  try {
    const supabase = await createServerSupabase()
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('status', 'ativo')

    if (searchParams.categoria) {
      query = query.eq('categoria', searchParams.categoria)
    }

    if (searchParams.busca) {
      query = query.ilike('titulo', `%${searchParams.busca}%`)
    }

    const { data: produtos } = await query
      .order('created_at', { ascending: false })
      .limit(20)

    return produtos || []
  } catch (error) {
    console.error('Error fetching produtos:', error)
    return []
  }
}

export default async function IndexPage(props: { searchParams: Promise<{ busca?: string; categoria?: string }> }) {
  const searchParams = await props.searchParams
  const produtos = await getProdutos(searchParams)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="gradient-sertao text-white py-16 md:py-24">
          <div className="container-page">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
                O Marketplace de{' '}
                <span className="text-ipê-400">Santa Fé do Sul</span>
              </h1>
              <p className="text-xl md:text-2xl text-sertão-100 mb-8">
                Encontre produtos, serviços e oportunidades perto de você. 
                Compras seguras com verificação de identidade.
              </p>
              <Link href="/cadastro" className="btn-ipê text-lg px-8 py-4">
                <Plus className="w-5 h-5" />
                Quero Vender
              </Link>
            </div>
          </div>
        </section>

        <section className="container-page py-8 -mt-8">
          <SearchBar />
        </section>

        <section className="container-page py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-sertão-600" />
              <p className="text-2xl font-bold text-sertão-600">{produtos.length}</p>
              <p className="text-sm text-gray-500">Anúncios Ativos</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-sertão-600" />
              <p className="text-2xl font-bold text-sertão-600">100%</p>
              <p className="text-sm text-gray-500">Local</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-sertão-600" />
              <p className="text-2xl font-bold text-sertão-600">100%</p>
              <p className="text-sm text-gray-500">Verificado</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-ipê-400" />
              <p className="text-2xl font-bold text-ipê-400">Grátis</p>
              <p className="text-sm text-gray-500">Para Anunciar</p>
            </div>
          </div>

          <h2 className="section-title flex items-center gap-3">
            <span>Últimos Anúncios</span>
            <span className="w-8 h-1 bg-ipê-400 rounded-full"></span>
          </h2>

          {produtos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {produtos.map((produto: any) => (
                <ProductCard key={produto.id} produto={produto} small />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum anúncio ainda</h3>
              <p className="text-gray-500 mb-6">Seja o primeiro a anunciar na sua cidade!</p>
              <Link href="/cadastro" className="btn-primary">
                <Plus className="w-5 h-5" />
                Criar Anúncio
              </Link>
            </div>
          )}

          {produtos.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/login" className="btn-secondary">
                Ver todos os produtos
              </Link>
            </div>
          )}
        </section>

        <section className="bg-sertão-50 py-12">
          <div className="container-page">
            <h2 className="section-title text-center mb-8">Por que usar o SantaFé Market?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-sertao rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Compra Segura</h3>
                <p className="text-gray-600">
                  Todos os compradores passam por validação de selfie antes de contatar vendedores.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-ipê rounded-2xl flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-sertão-900" />
                </div>
                <h3 className="text-lg font-semibold mb-2">100% Local</h3>
                <p className="text-gray-600">
                  Anúncios exclusivos de Santa Fé do Sul e região. Encontre o que precisa perto de casa.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Anúncie Grátis</h3>
                <p className="text-gray-600">
                  Sem taxas de publicação. Divulgue seus produtos e serviços gratuitamente.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}