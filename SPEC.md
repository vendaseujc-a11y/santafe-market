# SantaFé Marketplace - Especificação Técnica

## 1. Conceito & Visão

Marketplace local para Santa Fé do Sul com identidade visual que remete ao sertão verdejante do interior Paulista. Sistema robusto mas acessível, onde vendedores locais cadastram produtos/serviços e compradores passam por validação de identidade via selfie antes de acessar o WhatsApp do vendedor - criando um ambiente seguro e reduzindo fraudes.

A experiência deve transmitir **confiança, simplicidade e pertencimento local**.

## 2. Design Language

### Estética
Inspiração: **Sertão Moderno** - Tons terrosos do cerrado com acentos vibrantes de ipê amarelo. Interface limpa que evoca o calor do interior com sofisticação digital.

### Paleta de Cores
```
Primária:      #2D5016 (Verde Sertão)
Secundária:    #8B4513 (Terra Roxa)
Accent:        #FFB800 (Ipê Dourado)
Success:       #22C55E
Error:         #DC2626
Background:    #FEFDF8 (Creme)
Surface:       #FFFFFF
Text Primary:  #1A1A1A
Text Secondary:#6B6B6B
Border:        #E5E5E5
```

### Tipografia
- **Headings**: `'Plus Jakarta Sans', sans-serif` - Bold, moderna
- **Body**: `'Inter', sans-serif` - Legibilidade máxima
- **Fallback**: `system-ui, -apple-system, sans-serif`

### Sistema Espacial
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 8px (cards), 12px (buttons), 16px (modals)
- Max content width: 1280px

### Filosofia de Motion
- **Page transitions**: Fade 300ms ease-out
- **Hover states**: Scale 1.02, 200ms ease
- **Loading states**: Skeleton pulse animation 1.5s infinite
- **Success feedback**: Checkmark bounce 400ms with spring

### Assets Visuais
- **Icons**: Lucide React (outline style, 1.5px stroke)
- **Images**: WebP otimizado, lazy loading com blur placeholder
- **Patterns**: Gradientes sutis inspired by cerrado

## 3. Layout & Estrutura

### Arquitetura de Páginas
```
/                       → Index (Vitrine pública)
/login                  → Login de vendedores
/cadastro               → Cadastro de vendedores
/anuncio/[slug]         → Página individual do anúncio
/dashboard              → Painel do vendedor
/dashboard/produtos    → Lista de produtos
/dashboard/produtos/novo → Cadastrar produto
/dashboard/produtos/[id]/editar → Editar produto
/validar               → Página de validação facial (ao clicar WhatsApp)
```

### Estrutura Visual
- **Header**: Logo à esquerda, botão "Entrar/Vender" à direita, sticky
- **Hero Index**: Banner com título do marketplace, busca centralizada
- **Grid Produtos**: 4 colunas (desktop), 2 (tablet), 1 (mobile)
- **Footer**: Links, copyright, badge de segurança

### Responsividade
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch targets mínimo 44x44px

## 4. Features & Interações

### 4.1 Sistema de Autenticação

#### Cadastro (Vendedores)
- **Campos**: Nome, Email, Telefone (WhatsApp), Senha, Confirmação de Senha
- **Validação**: Email único, telefone brasileiro, senha mínimo 8 caracteres
- **Sucesso**: Redireciona para dashboard, cria perfil
- **Erro**: Mensagem inline específica

#### Login
- **Campos**: Email, Senha
- **Validação**: Campos obrigatórios, formato email
- **Sucesso**: Redireciona para dashboard ou página anterior
- **Erro**: "Email ou senha incorretos"
- **Esqueci senha**: Link para recuperação via Supabase

### 4.2 Dashboard do Vendedor

#### Visão Geral
- Cards com estatísticas: Anúncios ativos, visualizações, mensagens
- Lista de produtos recentes
- Quick actions

#### Gestão de Produtos
- **Lista**: Cards com thumbnail, título, preço, status
- **Ações por card**: 
  - Editar (ícone lápis) → /dashboard/produtos/[id]/editar
  - Excluir (ícone lixeira) → Modal de confirmação
  - Marcar Vendido (badge verde) → Toggle status
  - Divulgar → Modal com QR Code e link copiável

#### Cadastro de Produto
- **Campos**:
  - Título (obrigatório, max 100 chars)
  - Descrição (obrigatório, max 2000 chars)
  - Preço (obrigatório, formato BRL)
  - Categoria (select: Animais, Eletrônicos, Serviços, Veículos, Vestuário, Outros)
  - Imagens (até 5, drag-drop ou click, até 10MB cada)
  - WhatsApp (preenchido automaticamente se logado)
  - Local (bairro/cidade)
- **Slug**: Auto-gerado a partir do título (lowercase, hyphenado)
- **Validação**: Preview antes de publicar
- **Sucesso**: Toast "Produto publicado!", redirect para lista

### 4.3 Index (Vitrine Pública)

#### Grid de Produtos
- **Card**:
  - Imagem 1:1 com aspect-ratio preservado
  - Título (truncado em 2 linhas)
  - Preço (destaque em verde)
  - Badge "Novo" se < 7 dias
  - Botão "Conhecer o Produto" proeminente
- **Filtros**: Categoria, faixa de preço, ordenar (novos, preço)
- **Busca**: Por título com debounce 300ms
- **Pagination**: Infinite scroll ou load more

### 4.4 Página Individual do Anúncio

#### Layout
- **Galeria**: Imagem principal + thumbnails clicáveis
- **Info**: Título, preço, descrição, local, vendedor (anonimizado)
- **CTA Principal**: "Comprar via WhatsApp" (bloqueado inicialmente)
- **Segurança**: Badge "Verificado com selfie" após validação

#### Fluxo de Compra Segura
1. Usuário clica "Comprar via WhatsApp"
2. Modal abre: "Valide sua identidade para continuar"
3. Webcam solicita selfie em tempo real (frente)
4. Selfie enviada ao Supabase (tabela verificacoes)
5. Hash de verificação gerado
6. Botão WhatsApp liberado com mensagem pré-formatada
7. Link wa.me abre em nova aba

### 4.5 Processamento de Imagens

#### Pipeline
```
Upload → Validação MIME/Size → Sharp Processing → Upload Bucket → URL
```

#### Especificações Output
- **Resolução**: 1024x1024 max (preserva aspect ratio)
- **Formato**: WebP (fallback JPEG)
- **Qualidade**: 80% (~206KB alvo)
- **Metadados**: Strip EXIF, color profile sRGB

### 4.6 QR Code & Compartilhamento

#### Gerador de QR
- **Conteúdo**: URL completa do anúncio (/anuncio/[slug])
- **Tamanho**: 256x256px
- **Formato**: PNG
- **Download**: Botão para baixar QR

#### Open Graph
```
og:title = [Título] - SantaFé Marketplace
og:description = [Primeiros 150 chars da descrição]
og:image = [Imagem principal em alta qualidade]
og:url = [URL canônica]
og:type = product
og:locale = pt_BR
product:price:amount = [Preço]
product:price:currency = BRL
```

## 5. Inventário de Componentes

### Buttons
| Estado | Primário | Secundário | Ghost |
|--------|----------|-------------|-------|
| Default | bg:#2D5016 text:#fff | bg:transparent border:#2D5016 | bg:transparent |
| Hover | bg:#1a3a0e | bg:#2D5016/10 | bg:#000/5 |
| Active | bg:#142d0b | bg:#2D5016/20 | bg:#000/10 |
| Disabled | bg:#ccc opacity:50 | border:#ccc | opacity:50 |
| Loading | spinner + "Carregando..." | - | - |

### Input Fields
- **Default**: border:#e5e5e5, bg:#fff
- **Focus**: border:#2D5016, ring:2px #2D5016/20
- **Error**: border:#DC2626, helper text vermelho
- **Success**: border:#22C55E, check icon

### Cards
- **Default**: bg:#fff, shadow-sm, radius:8px
- **Hover**: shadow-md, translateY(-2px)
- **Active**: ring:#2D5016

### Modals
- **Backdrop**: bg:#000/50, blur(4px)
- **Container**: bg:#fff, max-w:500px, padding:24px
- **Animation**: fade + scale from 95%

### Toasts
- **Success**: bg:#22C55E, icon check
- **Error**: bg:#DC2626, icon X
- **Info**: bg:#2D5016, icon info
- **Position**: bottom-right, stack

## 6. Abordagem Técnica

### Stack
- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage Bucket
- **Auth**: Supabase Auth
- **Image Processing**: Sharp (server-side)
- **QR Code**: qrcode library

### API Routes
```
POST /api/auth/signup        → Cadastro vendedor
POST /api/auth/login         → Login
POST /api/auth/logout       → Logout
GET  /api/produtos           → Lista pública
POST /api/produtos          → Criar produto
PUT  /api/produtos/[id]     → Editar produto
DELETE /api/produtos/[id]   → Excluir produto
POST /api/upload            → Processar e fazer upload de imagem
POST /api/verificar         → Registrar selfie e gerar hash
GET  /api/qr/[slug]         → Gerar QR code
```

### Modelo de Dados

#### perfis
```sql
id              UUID PRIMARY KEY REFERENCES auth.users
nome            TEXT NOT NULL
telefone        TEXT NOT NULL UNIQUE
avatar_url      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### produtos
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
vendedor_id     UUID REFERENCES perfis(id) ON DELETE CASCADE
slug            TEXT UNIQUE NOT NULL
titulo          TEXT NOT NULL
descricao       TEXT NOT NULL
preco           NUMERIC(10,2) NOT NULL
categoria       TEXT NOT NULL
imagens         TEXT[] NOT NULL
localizacao     TEXT
status          TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vendido', 'inativo'))
visualizacoes   INTEGER DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### verificacoes
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
sessao_id       TEXT NOT NULL
produto_id      UUID REFERENCES produtos(id)
selfie_url      TEXT NOT NULL
hash_validacao  TEXT UNIQUE NOT NULL
ip_address      TEXT
user_agent      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

#### avaliacoes
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
vendedor_id     UUID REFERENCES perfis(id)
produto_id      UUID REFERENCES produtos(id)
nota            INTEGER CHECK (nota BETWEEN 1 AND 5)
comentario      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### Segurança RLS

#### políticas_perfis
- SELECT: ANYONE (auth.uid() IS NOT NULL)
- UPDATE: auth.uid() = id

#### políticas_produtos
- SELECT: status = 'ativo' (público)
- INSERT: auth.uid() = vendedor_id
- UPDATE: auth.uid() = vendedor_id
- DELETE: auth.uid() = vendedor_id

#### políticas_verificacoes
- INSERT: ANYONE (público para validação)
- SELECT: auth.uid() IS NOT NULL

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 7. Estados e Edge Cases

### Empty States
- **Sem produtos**: Ilustração + "Nenhum anúncio ainda. Seja o primeiro!"
- **Busca sem resultados**: "Não encontramos '[termo]'. Tente outro termo."
- **Sem conexão**: "Ops! Problema de conexão. Recarregue a página."

### Loading States
- Skeleton cards durante fetch
- Spinner em botões durante submit
- Progress bar em uploads

### Error Handling
- **Network error**: Toast "Erro de conexão. Tente novamente."
- **Validation error**: Messages inline em campos
- **Auth error**: Redirect para login com returnUrl
- **Server error**: Página 500 genérica com suporte

### Rate Limiting
- Upload de imagens: 10 req/min
- Verificações: 5 req/sessão/anúncio
- Login: 5 tentativas/15min