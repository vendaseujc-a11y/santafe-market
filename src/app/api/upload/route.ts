import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024
const uploadRateLimit = new Map<string, { count: number; timestamp: number }>()
const UPLOAD_RATE_LIMIT = 20
const UPLOAD_RATE_WINDOW = 60000

function checkUploadRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = uploadRateLimit.get(ip)
  
  if (!record || now - record.timestamp > UPLOAD_RATE_WINDOW) {
    uploadRateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= UPLOAD_RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'

  if (!checkUploadRateLimit(clientIP)) {
    return NextResponse.json({ 
      error: 'Limite de uploads excedido. Tente novamente mais tarde.' 
    }, { status: 429 })
  }

  try {
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Tipo de conteúdo inválido' }, { status: 415 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 10MB)' }, { status: 400 })
    }

    const allowedFolders = ['produtos', 'avatares', 'verificacoes']
    const safeFolder = allowedFolders.includes(folder || '') ? (folder || 'produtos') : 'produtos'

    const buffer = Buffer.from(await file.arrayBuffer())

    const metadata = await sharp(buffer).metadata()
    
    if (!metadata.width || !metadata.height || metadata.width > 4096 || metadata.height > 4096) {
      return NextResponse.json({ error: 'Dimensões da imagem inválidas' }, { status: 400 })
    }

    const processed = await sharp(buffer)
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer()

    const filename = `${safeFolder}/${uuidv4()}.jpg`
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    )

    const { error } = await supabase.storage
      .from(safeFolder)
      .upload(filename, processed, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(safeFolder)
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erro no processamento da imagem' }, { status: 500 })
  }
}