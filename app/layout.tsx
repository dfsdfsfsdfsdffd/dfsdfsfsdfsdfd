import './globals.css'

export const metadata = {
  title: 'softcard.cc',
  description: 'Claim your biolink',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}
