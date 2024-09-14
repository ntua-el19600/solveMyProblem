// src/app/components/NavBar.tsx
'use client'
import {FC} from 'react'
import {Logo} from './Logo'
import {SignInButton, SignedIn, SignedOut, UserButton} from '@clerk/nextjs'
import {Button, Chip} from '@mui/material'
import {useRouter} from 'next/navigation'
import {useUserContext} from '../../context/UserContext'
import {Router} from 'next/router'

export const NavBar: FC = () => {
  const router = useRouter()
  const {credits} = useUserContext()

  const handleClick = (route: string) => router.push(route)

  return (
    <div className="h-12 w-full bg-blue-500 text-white px-4 flex items-center gap-12">
      <Logo />
      <SignedOut>
        <SignInButton>
          <Button className="!text-white hover:outline hover:outline-1 hover:outline-white !capitalize">
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="w-full justify-between flex items-center gap-4">
          <div className="flex gap-4">
            <Button
              className="!text-white hover:outline hover:outline-1 hover:outline-white !capitalize"
              onClick={() => handleClick('/submissions/list')}
            >
              My submissions
            </Button>
            <Button
              className="!text-white hover:outline hover:outline-1 hover:outline-white !capitalize"
              onClick={() => handleClick('/submissions/new')}
            >
              New submission
            </Button>
          </div>
          <div className="flex align-middle gap-4">
            <Chip
              className={
                '!text-white !border-white hover:outline hover:outline-1 hover:outline-white'
              }
              label={'Credits: ' + credits}
              onClick={() => handleClick('/credits')}
              variant="outlined"
            />
            <UserButton />
          </div>
        </div>
      </SignedIn>
    </div>
  )
}
