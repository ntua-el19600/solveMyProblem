'use client'

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from 'react'
import {useUser} from '@clerk/nextjs'

interface UserContextProps {
  credits: number
  setCredits: React.Dispatch<React.SetStateAction<number>>
  refreshCredits: () => Promise<void>
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

export const UserProvider: React.FC<{children: React.ReactNode}> = ({
  children
}) => {
  const {user} = useUser()
  const [credits, setCredits] = useState<number>(0)

  const fetchCredits = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch(
        `http://localhost:3001/api/credits/${user.id}`
      )
      const data = await response.json()

      if (response.ok) {
        setCredits(data.credits)
      } else {
        console.error('Error fetching credits:', data.error)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }, [user])

  useEffect(() => {
    fetchCredits()
  }, [user, fetchCredits])

  return (
    <UserContext.Provider
      value={{credits, setCredits, refreshCredits: fetchCredits}}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
