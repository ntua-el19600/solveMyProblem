import {ClerkProvider} from '@clerk/nextjs'
import './globals.css'
import {NavBar} from './components/NavBar'
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
