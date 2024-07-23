'use client'
import {FC} from 'react'
import {Logo} from './Logo'
import {SignInButton, SignedIn, SignedOut, UserButton} from '@clerk/nextjs'
import {Button, Chip} from '@mui/material'
import {useRouter} from 'next/navigation'

export const NavBar: FC = () => {
  const router = useRouter()
  const credits = 0

  const handleClick = () => router.push('/credits')

  return (
    <div className="h-12 w-full bg-blue-500 text-white px-4 justify-between flex items-center">
      <Logo />
      <SignedOut>
        <Button className="text-white hover:outline hover:outline-1 hover:outline-white">
          <SignInButton />
        </Button>
      </SignedOut>
      <SignedIn>
        <div className="flex align-middle gap-4">
          <Chip
            className={'text-white'}
            label={'Credits: ' + credits}
            onClick={handleClick}
            variant="outlined"
          />
          <UserButton />
        </div>
      </SignedIn>
    </div>
  )
}
