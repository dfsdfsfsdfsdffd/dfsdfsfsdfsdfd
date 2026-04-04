import './globals.css'

export const metadata = {
  title: 'UnboundRPG',
  description: 'A UI-based Medieval Odyssey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}