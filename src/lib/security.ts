export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: string
}

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
  /data:/gi,
]

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '')
  }

  return sanitized
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email é obrigatório' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = email.trim().toLowerCase()

  if (sanitized.length > 254) {
    return { valid: false, error: 'Email muito longo' }
  }

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Email inválido' }
  }

  return { valid: true, sanitized }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Senha é obrigatória' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Senha deve ter pelo menos 8 caracteres' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Senha muito longa' }
  }

  return { valid: true }
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Telefone é obrigatório' }
  }

  const digits = phone.replace(/\D/g, '')

  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Telefone inválido' }
  }

  return { valid: true, sanitized: digits }
}

export function validateTitle(title: string): ValidationResult {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Título é obrigatório' }
  }

  const sanitized = sanitizeInput(title)

  if (sanitized.length < 3) {
    return { valid: false, error: 'Título muito curto' }
  }

  if (sanitized.length > 100) {
    return { valid: false, error: 'Título muito longo (máx 100 caracteres)' }
  }

  return { valid: true, sanitized }
}

export function validateDescription(description: string): ValidationResult {
  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Descrição é obrigatória' }
  }

  const sanitized = sanitizeInput(description)

  if (sanitized.length < 10) {
    return { valid: false, error: 'Descrição muito curta' }
  }

  if (sanitized.length > 5000) {
    return { valid: false, error: 'Descrição muito longa (máx 5000 caracteres)' }
  }

  return { valid: true, sanitized }
}

export function validatePrice(price: number | string): ValidationResult {
  let priceNum: number

  if (typeof price === 'string') {
    priceNum = parseFloat(price.replace(/\D/g, '')) / 100
  } else {
    priceNum = Number(price)
  }

  if (isNaN(priceNum) || priceNum <= 0) {
    return { valid: false, error: 'Preço inválido' }
  }

  if (priceNum > 1000000) {
    return { valid: false, error: 'Preço excede o limite máximo' }
  }

  return { valid: true, sanitized: String(priceNum) }
}

export function validateCategory(category: string): ValidationResult {
  const validCategories = [
    'promocao',
    'produtos',
    'eletronicos',
    'servicos',
    'veiculos',
    'vestuario',
    'outros',
  ]

  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Categoria é obrigatória' }
  }

  if (!validCategories.includes(category)) {
    return { valid: false, error: 'Categoria inválida' }
  }

  return { valid: true }
}

export function validateSlug(slug: string): ValidationResult {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug é obrigatório' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  if (slug.length > 60 || !slugRegex.test(slug)) {
    return { valid: false, error: 'Slug inválido' }
  }

  return { valid: true }
}

export function validateCode(code: string): ValidationResult {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Código é obrigatório' }
  }

  const codeRegex = /^[A-Z0-9]{4,8}$/

  if (!codeRegex.test(code.toUpperCase())) {
    return { valid: false, error: 'Código inválido' }
  }

  return { valid: true, sanitized: code.toUpperCase() }
}

export function validateURL(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL é obrigatória' }
  }

  try {
    const parsed = new URL(url)
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Protocolo inválido' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'URL inválida' }
  }
}

export function validateImageArray(images: unknown): ValidationResult {
  if (!Array.isArray(images)) {
    return { valid: false, error: 'Imagens deve ser um array' }
  }

  if (images.length > 5) {
    return { valid: false, error: 'Máximo de 5 imagens' }
  }

  for (const img of images) {
    if (typeof img !== 'string' || !img.startsWith('http')) {
      return { valid: false, error: 'Imagem inválida' }
    }
  }

  return { valid: true }
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  allowedFields: string[]
): Partial<T> {
  const sanitized: Record<string, unknown> = {}

  for (const key of allowedFields) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeInput(obj[key] as string)
      } else {
        sanitized[key] = obj[key]
      }
    }
  }

  return sanitized as Partial<T>
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown'
}