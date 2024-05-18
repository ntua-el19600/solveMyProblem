import {FC} from 'react'
import {Logo} from './Logo'
import {SignInButton, SignedIn, SignedOut, UserButton} from '@clerk/nextjs'

export const NavBar: FC = () => {
  return (
    <div className="h-12 w-full bg-blue-500 text-white px-4 justify-between flex items-center">
      <Logo />
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}
