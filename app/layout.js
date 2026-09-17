export const metadata = {
  title: 'The Spot — Leads',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#0a0e17',
        color: '#fff',
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  )
}