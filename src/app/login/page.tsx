'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Package, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto gradient-sertao rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-sertão-900">Entrar no Portal do Vendedor</h1>
            <p className="text-gray-500 mt-2">Acesse seu painel de anúncios</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="input pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/cadastro" className="block text-sm text-sertão-600 hover:text-sertão-700">
              Não tem conta? <span className="font-semibold">Cadastre-se</span>
            </Link>
            <Link href="/admin" className="block text-sm text-gray-500 hover:text-gray-700">
              Área Admin
            </Link>
            <Link href="/#esqueci-senha" className="block text-sm text-gray-500 hover:text-gray-700">
              Esqueceu a senha?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}