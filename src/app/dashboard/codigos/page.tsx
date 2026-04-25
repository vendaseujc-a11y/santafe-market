'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { Key, Copy, Plus, ArrowLeft, AlertTriangle } from 'lucide-react'

export default function CodigosPage() {
  const [codigos, setCodigos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const isAdmin = sessionStorage.getItem('admin_logged') === 'true'
      
      if (!isAdmin) {
        router.push('/admin')
        return
      }
      
      carregarCodigos()
    }
    
    checkAuth()
  }, [])

  const carregarCodigos = async () => {
    const response = await fetch('/api/codigos')
    const data = await response.json()
    setCodigos(data.codigos || [])
    setLoading(false)
  }

  const gerarCodigo = async () => {
    setGerando(true)
    setErro(null)
    try {
      const response = await fetch('/api/codigos', { method: 'POST' })
      const data = await response.json()
      
      if (data.codigo) {
        setCodigos([data.codigo, ...codigos])
      } else {
        setErro(data.error || 'Erro ao gerar código')
      }
    } catch (err) {
      setErro('Erro ao gerar código')
    } finally {
      setGerando(false)
    }
  }

  const generateLocalCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const gerarCodigoLocal = async () => {
    const novoCodigo = generateLocalCode()
    
    try {
      const response = await fetch('/api/codigos', { method: 'POST' })
      const data = await response.json()
      
      if (data.codigo) {
        setCodigos([data.codigo, ...codigos])
      } else {
        const codigoItem = {
          id: Date.now().toString(),
          codigo: novoCodigo,
          utilizado: false,
          created_at: new Date().toISOString()
        }
        setCodigos([codigoItem, ...codigos])
      }
    } catch (err) {
      const codigoItem = {
        id: Date.now().toString(),
        codigo: novoCodigo,
        utilizado: false,
        created_at: new Date().toISOString()
      }
      setCodigos([codigoItem, ...codigos])
    }
  }

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-4xl">⏳</div>
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
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-sertão-900">Códigos de Acesso</h1>
              <p className="text-gray-500">Gerencie os códigos para novos vendedores</p>
            </div>
          </div>

          <div className="card-static p-6 mb-8">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">{erro}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-sertão-900">Gerar Novo Código</h2>
                <p className="text-gray-500 text-sm">Cada código pode ser usado apenas uma vez</p>
              </div>
              <button
                onClick={() => {
                  gerarCodigoLocal()
                }}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Gerar Código
              </button>
            </div>
          </div>

          <div className="card-static overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-sertão-900">Códigos Gerados</h2>
            </div>
            
            {codigos.length > 0 ? (
              <div className="divide-y">
                {codigos.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-sertão-600" />
                      <div>
                        <p className="font-mono font-bold text-lg text-sertão-900">
                          {item.codigo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${item.utilizado ? 'badge-vendido' : 'badge-novo'}`}>
                        {item.utilizado ? 'Usado' : 'Disponível'}
                      </span>
                      <button
                        onClick={() => copiarCodigo(item.codigo)}
                        className="btn-ghost p-2"
                        title="Copiar código"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum código gerado ainda</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}