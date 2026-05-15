import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SantaFé Marketplace | Anúncios Locais em Santa Fé do Sul',
  description: 'Encontre produtos, serviços e oportunidades em Santa Fé do Sul. Marketplace local seguro com verificação de identidade.',
  keywords: ['marketplace', 'santa fé do sul', 'anúncios', 'compras', 'vendas', 'comercio local'],
  openGraph: {
    title: 'SantaFé Marketplace',
    description: 'Encontre produtos e serviços em Santa Fé do Sul',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'SantaFé Marketplace',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-cream-50">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.history.replaceState) {
                  window.history.replaceState(null, null, window.location.href);
                }
                
                document.addEventListener('contextmenu', function(e) {
                  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}