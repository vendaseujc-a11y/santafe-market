import slugify from 'slugify'

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function isNew(date: string | Date): boolean {
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() - new Date(date).getTime() < sevenDays
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function generateValidationHash(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`.toUpperCase()
}

export async function processImage(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default

  return sharp(buffer)
    .resize(1024, 1024, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toBuffer()
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}