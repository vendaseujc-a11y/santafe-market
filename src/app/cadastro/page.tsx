'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState } from 'react'
import { Package, Mail, Lock, Eye, EyeOff, Phone, User, Key } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components'

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    codigoAcesso: '',
  })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatarTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.codigoAcesso) {
      setError('Código de acesso é obrigatório')
      setLoading(false)
      return
    }

    const codigo = formData.codigoAcesso.toUpperCase()
    const codigoValido = /^[A-Z0-9]{4,8}$/.test(codigo)

    if (!codigoValido) {
      setError('Código de acesso inválido')
      setLoading(false)
      return
    }

    const validateResponse = await fetch('/api/validar-codigo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    })
    const validateData = await validateResponse.json()

    if (!validateData.valido) {
      setError(validateData.error || 'Código de acesso inválido')
      setLoading(false)
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.senha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome,
            telefone: formData.telefone
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already')) {
          setError('Este e-mail já está cadastrado')
        } else {
          setError(signUpError.message)
        }
      } else if (data.user) {
        await fetch('/api/validar-codigo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo, userId: data.user.id, utilizar: true })
        })
        
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
              <span className="text-4xl text-white">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-sertão-900 mb-2">Cadastro Realizado!</h1>
            <p className="text-gray-500">Redirecionando para seu painel...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto gradient-sertao rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-sertão-900">Cadastre-se como Vendedor</h1>
            <p className="text-gray-500 mt-2">Publique seus produtos gratuitamente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nome"
                  placeholder="Seu nome"
                  className="input pl-12"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  className="input pl-12"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  className="input pl-12"
                  value={formData.telefone}
                  onChange={(e) => {
                    e.target.value = formatarTelefone(e.target.value)
                    handleChange(e)
                  }}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Formato: (00) 00000-0000</p>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="senha"
                  placeholder="Mínimo 8 caracteres"
                  className="input pl-12 pr-12"
                  value={formData.senha}
                  onChange={handleChange}
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

            <div>
              <label className="label">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="confirmarSenha"
                  placeholder="Repita a senha"
                  className="input pl-12"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Código de Acesso</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="codigoAcesso"
                  placeholder="Código fornecido pelo admin"
                  className="input pl-12 uppercase"
                  value={formData.codigoAcesso}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Código necessário para se cadastrar</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Ao cadastrar, você concorda com nossos{' '}
              <Link href="/termos" className="text-sertão-600 hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="text-sertão-600 hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="block text-sm text-sertão-600 hover:text-sertão-700">
              Já tem conta? <span className="font-semibold">Entrar</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}