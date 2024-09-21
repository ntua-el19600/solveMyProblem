'use client'
import {Box, Button, Typography} from '@mui/material'
import {useRouter} from 'next/navigation'
import React, {useState, useEffect} from 'react'

export default function Home() {
  const [dateTime, setDateTime] = useState('')
  const router = useRouter()

  const handleClick = (route: string) => router.push(route)

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString())
    updateTime() // Set initial date/time on mount
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid justify-items-center p-10">
      <h1 className="text-xl">Welcome to solveMyProblem!</h1>
      <h2 className="text-lg">Check out the types of problems you can solve</h2>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={4}
        width="100%"
      >
        <Box
          sx={{
            width: '45%',
            border: '1px solid gray',
            padding: 2,
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <img
            src="/linear.png"
            alt="Linear"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '45vh',
              borderRadius: '8px'
            }}
          />
          <Typography variant="h6" mt={2}>
            Linear
          </Typography>
        </Box>

        <Box
          sx={{
            width: '45%',
            border: '1px solid gray',
            padding: 2,
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <img
            src="/vrp.png"
            alt="VRP"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '45vh',
              borderRadius: '8px'
            }}
          />
          <Typography variant="h6" mt={2}>
            VRP
          </Typography>
        </Box>
      </Box>
      <Button
        className="outline outline-1 outline-blue-500 hover:outline-2 text-blue-500 mt-4 disabled:outline-current !capitalize"
        onClick={() => handleClick('/submissions/new')}
      >
        Submit your problem now!
      </Button>
      <div className="absolute top-4 right-4 text-right">
        <p>{`Current Date/Time: ${dateTime}` || 'Loading...'}</p>
      </div>
    </div>
  )
}
