import Link from 'next/link'
import { Package, Search, Plus, User, MapPin, Eye, Calendar, Shield, TrendingUp, Crown, MessageCircle } from 'lucide-react'
import { Toast, Modal, QRCodeModal, SelfieValidator } from './client'

export { Toast, Modal, QRCodeModal, SelfieValidator }

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-cream-100/60 shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 gradient-sertao rounded-xl flex items-center justify-center shadow-md shadow-sertão-600/10 group-hover:scale-105 transition-transform duration-300">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-extrabold text-xl text-sertão-700 tracking-tight">SantaFé</span>
              <span className="font-heading font-extrabold text-xl text-ipê-500 tracking-tight ml-0.5">Market</span>
            </div>
          </Link>

          <form action="/" method="get" className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sertão-500/60" />
              <input
                type="text"
                name="busca"
                placeholder="Buscar produtos e serviços locais..."
                className="w-full pl-10 pr-4 py-2 bg-cream-50/60 border border-cream-200/80 rounded-xl text-sm focus:outline-none focus:border-sertão-500 focus:ring-2 focus:ring-sertão-500/10 transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
          </form>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4 border-cream-300 text-sertão-700 hover:bg-cream-100/50 flex items-center gap-2">
              <User className="w-4 h-4 text-sertão-600" />
              <span className="hidden sm:inline font-medium">Área do Membro</span>
              <span className="sm:hidden font-medium">Entrar</span>
            </Link>
            <Link href="/premium" className="btn-premium text-sm py-2 px-4 shadow-lg shadow-ipê-500/10 hover:shadow-ipê-500/20 flex items-center gap-2">
              <Crown className="w-4 h-4 text-sertão-900" />
              <span className="hidden sm:inline font-bold">Clube Premium</span>
              <span className="sm:hidden font-bold">Premium</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="bg-sertão-950 text-white mt-20 border-t border-sertão-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-ipê-400 rounded-xl flex items-center justify-center shadow-lg shadow-ipê-500/10">
                <Package className="w-5 h-5 text-sertão-950" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg tracking-tight">SantaFé</span>
                <span className="font-heading font-extrabold text-lg text-ipê-400 tracking-tight ml-0.5">Market</span>
              </div>
            </div>
            <p className="text-sertão-200/80 text-sm leading-relaxed">
              O marketplace oficial de Santa Fé do Sul. Conectando o cerrado paulista a negócios locais de forma moderna e segura.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-ipê-300 mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-sertão-200 text-sm">
              <li><Link href="/?categoria=promocao" className="hover:text-ipê-400 hover:translate-x-1 inline-block transition-all duration-200">🏷️ Promoção</Link></li>
              <li><Link href="/?categoria=produtos" className="hover:text-ipê-400 hover:translate-x-1 inline-block transition-all duration-200">📦 Produtos Gerais</Link></li>
              <li><Link href="/?categoria=eletronicos" className="hover:text-ipê-400 hover:translate-x-1 inline-block transition-all duration-200">📱 Eletrônicos</Link></li>
              <li><Link href="/?categoria=servicos" className="hover:text-ipê-400 hover:translate-x-1 inline-block transition-all duration-200">🔧 Serviços</Link></li>
              <li><Link href="/?categoria=veiculos" className="hover:text-ipê-400 hover:translate-x-1 inline-block transition-all duration-200">🚗 Veículos</Link></li>
              <li><Link href="/?categoria=vestuario" className="hover:text-ipê-400 hover:translate-x-1 inline-block transition-all duration-200">👕 Vestuário</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-ipê-300 mb-4">Segurança Máxima</h4>
            <p className="text-sertão-200/80 text-sm leading-relaxed mb-4">
              Cada transação e clique são resguardados por autenticação humana inteligente baseada em anti-golpes.
            </p>
            <div className="flex items-center gap-2.5 bg-sertão-900/60 p-2.5 rounded-xl border border-sertão-800/40 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-green-400">Verificação Humana Ativa</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-ipê-300 mb-4">Suporte & Contato</h4>
            <Link 
              href="https://wa.me/5555999999999" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-green-500/10 hover:scale-102 hover:shadow-green-500/20 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Suporte via WhatsApp
            </Link>
          </div>
        </div>

        <div className="border-t border-sertão-900/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-sertão-300">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/seguranca" className="hover:text-white transition-colors">Segurança</Link>
          </div>
          <p className="text-sertão-400 text-xs">
            © {new Date().getFullYear()} SantaFé Marketplace. Desenvolvido para o futuro do comércio local.
          </p>
        </div>
      </div>
    </footer>
  )
}

export function SearchBar() {
  return (
    <form action="/" method="get" className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 md:p-5 border border-cream-200/60 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sertão-500" />
          <input
            type="text"
            name="busca"
            placeholder="O que você está procurando em Santa Fé?"
            className="input pl-12 border-cream-200/80 focus:border-sertão-500 focus:ring-sertão-500/15"
          />
        </div>

        <div className="flex gap-2">
          <select 
            name="categoria" 
            className="input border-cream-200/80 focus:border-sertão-500 focus:ring-sertão-500/15 flex-1"
          >
            <option value="">Categorias</option>
            <option value="promocao">🏷️ Promoção</option>
            <option value="produtos">📦 Geral</option>
            <option value="eletronicos">📱 Eletrônicos</option>
            <option value="servicos">🔧 Serviços</option>
            <option value="veiculos">🚗 Veículos</option>
            <option value="vestuario">👕 Vestuário</option>
            <option value="outros">📦 Outros</option>
          </select>
          <button type="submit" className="btn-primary px-6 shadow-md shadow-sertão-600/15 hover:scale-102 duration-300">
            Buscar
          </button>
        </div>
      </div>
    </form>
  )
}

interface ProductCardProps {
  produto: {
    id: string
    slug: string
    titulo: string
    preco: number | string
    imagens?: string[]
    categoria?: string
    created_at: string
  }
  small?: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  promocao: '🏷️',
  produtos: '📦',
  eletronicos: '📱',
  servicos: '🔧',
  veiculos: '🚗',
  vestuario: '👕',
  outros: '📦',
}

export function ProductCard({ produto, small }: ProductCardProps) {
  const imagem = produto.imagens?.[0]
  const isNovo = new Date(produto.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  const categoryIcon = CATEGORY_ICONS[produto.categoria || 'outros']

  const preco = typeof produto.preco === 'number'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)
    : produto.preco

  if (small) {
    return (
      <Link href={`/anuncio/${produto.slug}`} className="block group">
        <div className="bg-white rounded-xl shadow-sm border border-cream-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="relative aspect-square bg-cream-50/40 overflow-hidden">
            {imagem ? (
              <img 
                src={imagem} 
                alt={produto.titulo} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl bg-cream-50">{categoryIcon}</div>
            )}
            {isNovo && (
              <span className="absolute top-2 left-2 text-[10px] bg-ipê-400 text-sertão-950 font-bold px-2 py-0.5 rounded-full shadow-sm">Novo</span>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-sertão-600 transition-colors">{produto.titulo}</h3>
            <p className="text-sm font-extrabold text-sertão-600 mt-1">{preco}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <article className="card group hover:-translate-y-2 hover:shadow-xl hover:shadow-sertão-600/5 duration-300 flex flex-col h-full border border-cream-200/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-50/20 rounded-t-2xl">
        {imagem ? (
          <img
            src={imagem}
            alt={produto.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-cream-50">
            {categoryIcon}
          </div>
        )}
        {isNovo && (
          <span className="absolute top-3.5 left-3.5 badge-ipê bg-ipê-400 text-sertão-950 font-bold px-3 py-1 rounded-full text-xs shadow-md">Novo</span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-sertão-500 uppercase tracking-wider mb-1">
          {produto.categoria}
        </span>
        <h3 className="font-heading font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-sertão-600 transition-colors flex-1">
          {produto.titulo}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-4">
          <p className="text-2xl font-extrabold text-sertão-600">
            {preco}
          </p>
        </div>

        <Link
          href={`/anuncio/${produto.slug}`}
          className="btn-ipê w-full py-3 shadow-md shadow-ipê-500/10 hover:shadow-ipê-500/20 transition-all duration-300 font-bold"
        >
          Conhecer o Produto
        </Link>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card-static border border-cream-200/40">
      <div className="aspect-square skeleton rounded-t-2xl" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton w-1/4" />
        <div className="h-6 skeleton w-3/4" />
        <div className="h-8 skeleton w-1/2" />
        <div className="h-10 skeleton" />
      </div>
    </div>
  )
}

export function FeatureCard({ icon: Icon, title, description, colorClass }: {
  icon: typeof Shield
  title: string
  description: string
  colorClass: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-cream-200/30 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-md ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-sertão-950 mb-2 font-heading">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}