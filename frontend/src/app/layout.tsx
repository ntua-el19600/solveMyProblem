// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Footer, NavBar } from './components';
import { UserProvider } from '../context/UserContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <UserProvider>
        <html lang="en">
          <body>
            <NavBar />
            <main className="relative h-[calc(100vh-6rem)] p-4">{children}</main>
            <Footer />
          </body>
        </html>
      </UserProvider>
    </ClerkProvider>
  );
}
