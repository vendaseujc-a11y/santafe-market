import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'produtos'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.type.startsWith('image/')) {
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

      const filename = `${folder}/${uuidv4()}.jpg`
      
      const cookieStore = await cookies()
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

      const { data, error } = await supabase.storage
        .from(folder)
        .upload(filename, processed, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(filename)

      return NextResponse.json({ url: publicUrl })
    }

    return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erro no processamento da imagem' }, { status: 500 })
  }
}