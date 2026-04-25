import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center bg-cream-50">
        <div className="text-center p-8">
          <div className="text-8xl font-bold text-sertão-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-sertão-900 mb-2">Página Não Encontrada</h1>
          <p className="text-gray-500 mb-8">
            A página que você procura não existe ou foi movida.
          </p>
          <Link href="/" className="btn-primary">
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
        </div>
      </body>
    </html>
  )
}