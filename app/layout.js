import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = {
  title: 'The Spot — Leads',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body style={{
        margin: 0,
        fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
        background: '#050810',
        color: '#f5f6f8',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {children}
      </body>
    </html>
  )
}
