import Link from 'next/link'
import { Package, Search, Plus, User, MapPin, Eye, Calendar, Shield, TrendingUp, Crown } from 'lucide-react'
import { Toast, Modal, QRCodeModal, SelfieValidator } from './client'

export { Toast, Modal, QRCodeModal, SelfieValidator }

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-sertao rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-sertão-600">SantaFé</span>
              <span className="font-heading font-bold text-lg text-ipê-400">Market</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Área do Membro</span>
              <span className="sm:hidden">Membro</span>
            </Link>
            <Link href="/premium" className="btn-premium text-sm py-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Clube Premium</span>
              <span className="sm:hidden">Premium</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="bg-sertão-900 text-white mt-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-ipê-400 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-sertão-900" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg">SantaFé</span>
                <span className="font-heading font-bold text-lg text-ipê-400">Market</span>
              </div>
            </div>
            <p className="text-sertão-200 text-sm">
              Marketplace local seguro para Santa Fé do Sul. Conectando vizinhos com confiança.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sertão-300 text-sm">
              <li><Link href="/?categoria=produtos" className="hover:text-ipê-400 transition-colors">Produtos em Gerais</Link></li>
              <li><Link href="/?categoria=eletronicos" className="hover:text-ipê-400 transition-colors">Eletrônicos</Link></li>
              <li><Link href="/?categoria=servicos" className="hover:text-ipê-400 transition-colors">Serviços</Link></li>
              <li><Link href="/?categoria=veiculos" className="hover:text-ipê-400 transition-colors">Veículos</Link></li>
              <li><Link href="/?categoria=vestuario" className="hover:text-ipê-400 transition-colors">Vestuário</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Segurança</h4>
            <p className="text-sertão-300 text-sm">
              Todos os compradores são validados com selfie para sua segurança.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Conexão Segura</span>
            </div>
          </div>
        </div>

        <div className="border-t border-sertão-700 mt-8 pt-8 text-center text-sertão-400 text-sm">
          <p>© {new Date().getFullYear()} SantaFé Marketplace. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export function SearchBar() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="input pl-12"
          />
        </div>

        <select className="input">
          <option value="">Todas as categorias</option>
          <option value="produtos">Produtos em Gerais</option>
          <option value="eletronicos">Eletrônicos</option>
          <option value="servicos">Serviços</option>
          <option value="veiculos">Veículos</option>
          <option value="vestuario">Vestuário</option>
          <option value="outros">Outros</option>
        </select>
      </div>
    </div>
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
}

const CATEGORY_ICONS: Record<string, string> = {
  eletronicos: '📱',
  servicos: '🔧',
  veiculos: '🚗',
  vestuario: '👕',
  outros: '📦',
}

export function ProductCard({ produto }: ProductCardProps) {
  const imagem = produto.imagens?.[0]
  const isNovo = new Date(produto.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  const categoryIcon = CATEGORY_ICONS[produto.categoria || 'outros']

  const preco = typeof produto.preco === 'number'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)
    : produto.preco

  return (
    <article className="card group">
      <div className="relative aspect-square overflow-hidden bg-white rounded-t-xl">
        {imagem ? (
          <img
            src={imagem}
            alt={produto.titulo}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-white">
            {categoryIcon}
          </div>
        )}
        {isNovo && (
          <span className="absolute top-3 left-3 badge-ipê">Novo</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
          {produto.titulo}
        </h3>

        <p className="text-2xl font-bold text-sertão-600 mb-3">
          {preco}
        </p>

        <Link
          href={`/anuncio/${produto.slug}`}
          className="btn-ipê w-full"
        >
          Conhecer o Produto
        </Link>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card-static">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-6 skeleton w-3/4" />
        <div className="h-8 skeleton w-1/2" />
        <div className="h-12 skeleton" />
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
    <div className="text-center">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}