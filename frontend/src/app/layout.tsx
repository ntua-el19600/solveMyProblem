import {ClerkProvider} from '@clerk/nextjs'
import './globals.css'
import {Footer, NavBar} from './components'
import {UserProvider} from '../context/UserContext'

export const metadata = {
  title: 'solveMyProblem',
  description: 'Solve problems fast!'
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider>
      <UserProvider>
        <html lang="en">
          <body className="!flex !flex-col !min-h-screen">
            <NavBar />
            <main className="!flex-grow !p-4">{children}</main>
            <Footer />
          </body>
        </html>
      </UserProvider>
    </ClerkProvider>
  )
}
