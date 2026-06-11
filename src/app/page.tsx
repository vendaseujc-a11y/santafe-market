import Link from 'next/link'
import { createServerSupabase } from '@/lib/superabase-server'
import { Header, Footer, SearchBar, ProductCard } from '@/components'
import { Plus, TrendingUp, Shield, MapPin, Sparkles } from 'lucide-react'

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
      .limit(30)

    return produtos || []
  } catch (error) {
    console.error('Error fetching produtos:', error)
    return []
  }
}

export default async function IndexPage(props: { searchParams: Promise<{ busca?: string; categoria?: string }> }) {
  const searchParams = await props.searchParams
  const produtos = await getProdutos(searchParams)

  const CATEGORY_CHIPS = [
    { label: '🏷️ Promoção', value: 'promocao' },
    { label: '📦 Geral', value: 'produtos' },
    { label: '📱 Eletrônicos', value: 'eletronicos' },
    { label: '🔧 Serviços', value: 'servicos' },
    { label: '🚗 Veículos', value: 'veiculos' },
    { label: '👕 Vestuário', value: 'vestuario' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-cream-50/50">
      <Header />

      <main className="flex-1">
        {/* Modern Sertão Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sertão-800 via-sertão-900 to-terra-900 text-white py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sertão-600/35 via-transparent to-transparent"></div>
          
          <div className="container-page relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-ipê-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Seguro, Local & Verificado por Inteligência Humana
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight leading-none text-balance">
                O Futuro do Marketplace em <span className="bg-gradient-to-r from-ipê-300 via-ipê-400 to-yellow-500 bg-clip-text text-transparent">Santa Fé do Sul</span>
              </h1>
              
              <p className="text-lg md:text-xl text-sertão-100 max-w-2xl mx-auto font-light leading-relaxed">
                Conectamos compradores e vendedores locais com verificação de identidade via selfie, eliminando golpes e aproximando vizinhos.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/cadastro" className="btn-ipê text-base px-8 py-4 shadow-lg shadow-ipê-400/15 hover:scale-102 transition-all duration-300 font-bold w-full sm:w-auto">
                  Vender agora no Sertão
                </Link>
                <Link href="/login" className="btn-secondary border-white text-white hover:bg-white/10 text-base px-8 py-4 w-full sm:w-auto font-medium">
                  Área do Vendedor
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Search Bar */}
        <section className="container-page relative -mt-8 z-20">
          <SearchBar />
          
          {/* Quick Filter Category Chips */}
          <div className="flex items-center justify-center flex-wrap gap-2.5 mt-5">
            {CATEGORY_CHIPS.map((chip) => (
              <Link
                key={chip.value}
                href={`/?categoria=${chip.value}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  searchParams.categoria === chip.value
                    ? 'bg-sertão-600 border-sertão-600 text-white shadow-md shadow-sertão-600/10'
                    : 'bg-white border-cream-200 text-sertão-700 hover:border-sertão-400 hover:bg-sertão-50/25'
                }`}
              >
                {chip.label}
              </Link>
            ))}
            {searchParams.categoria && (
              <Link href="/" className="text-xs font-semibold text-red-500 hover:text-red-600 underline ml-2">
                Limpar Filtro
              </Link>
            )}
          </div>
        </section>

        {/* Dynamic Analytics Dashboard Cards */}
        <section className="container-page py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            <div className="bg-white rounded-2xl p-6 border border-cream-200/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <TrendingUp className="w-8 h-8 text-sertão-600 mb-4" />
              <div>
                <p className="text-3xl font-extrabold text-sertão-950 font-heading">{produtos.length}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Anúncios Ativos Hoje</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-cream-200/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <MapPin className="w-8 h-8 text-sertão-600 mb-4" />
              <div>
                <p className="text-3xl font-extrabold text-sertão-950 font-heading">100%</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Foco Local & Região</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-cream-200/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <Shield className="w-8 h-8 text-sertão-600 mb-4" />
              <div>
                <p className="text-3xl font-extrabold text-sertão-950 font-heading">Antigolpe</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Validação de Identidade</p>
              </div>
            </div>
            <Link href="/cadastro" className="group bg-gradient-to-br from-sertão-600 to-sertão-850 rounded-2xl p-6 shadow-md shadow-sertão-600/10 flex flex-col justify-between hover:scale-102 transition-transform duration-300">
              <Plus className="w-8 h-8 text-ipê-400" />
              <div>
                <p className="text-xl font-bold text-white font-heading group-hover:text-ipê-300 transition-colors">Cadastre seu Anúncio</p>
                <p className="text-xs font-semibold text-sertão-200 mt-1">Rápido, fácil e grátis →</p>
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-sertão-950 font-heading flex items-center gap-3">
              Vitrine de Anúncios
              <span className="w-8 h-1 bg-ipê-400 rounded-full"></span>
            </h2>
            {searchParams.busca && (
              <span className="text-sm text-gray-500 bg-cream-100/50 px-3 py-1.5 rounded-lg border border-cream-200/60">
                Resultado para: <strong className="text-sertão-800">"{searchParams.busca}"</strong>
              </span>
            )}
          </div>

          {/* Products Grid */}
          {produtos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {produtos.map((produto: any) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-cream-200/40 p-8 max-w-xl mx-auto shadow-sm">
              <div className="text-6xl mb-4">🌵</div>
              <h3 className="text-xl font-bold text-sertão-950 mb-2 font-heading">Nenhum anúncio encontrado</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Não encontramos resultados para a sua pesquisa. Tente buscar outro termo ou mude de categoria.</p>
              <Link href="/" className="btn-primary inline-flex">
                Limpar filtros e ver vitrine
              </Link>
            </div>
          )}

          {produtos.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/login" className="btn-secondary px-8 border-sertão-600 text-sertão-700 hover:bg-sertão-50">
                Acessar o Painel de Anúncios
              </Link>
            </div>
          )}
        </section>

        {/* Trust & Modern Features */}
        <section className="bg-gradient-to-b from-cream-100/40 to-cream-50 py-16 border-y border-cream-200/20">
          <div className="container-page">
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
              <h2 className="text-3xl font-extrabold text-sertão-950 font-heading">Modernidade & Segurança no Interior</h2>
              <p className="text-gray-500 leading-relaxed">Combinamos a essência do cerrado com tecnologia de ponta para criar o ecossistema perfeito para negócios locais.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white p-8 rounded-2xl border border-cream-200/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 mx-auto mb-5 bg-sertão-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sertão-600/15">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-sertão-950 mb-2 font-heading">Compre Sem Medo</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Sem robôs ou golpes. Todo comprador realiza verificação facial rápida antes de contatar o anunciante.
                </p>
              </div>
              <div className="text-center bg-white p-8 rounded-2xl border border-cream-200/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 mx-auto mb-5 bg-ipê-400 rounded-2xl flex items-center justify-center shadow-lg shadow-ipê-500/15">
                  <MapPin className="w-7 h-7 text-sertão-950" />
                </div>
                <h3 className="text-lg font-bold text-sertão-950 mb-2 font-heading">Fortaleça o Comércio Local</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Anúncios e produtos focados 100% em Santa Fé do Sul. Compre de quem está perto de você.
                </p>
              </div>
              <div className="text-center bg-white p-8 rounded-2xl border border-cream-200/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 mx-auto mb-5 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/15">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-sertão-950 mb-2 font-heading">Gire a Economia</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Publique ofertas, serviços ou desapegos de forma gratuita e rápida direto da sua fazenda, loja ou casa.
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