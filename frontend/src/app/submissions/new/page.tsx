'use client'
import React, {useState, useEffect} from 'react'

export default function Home() {
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString())
    updateTime() // Set initial date/time on mount
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <div className="absolute top-4 right-4 text-right">
        <p>{`Current Date/Time: ${dateTime}` || 'Loading...'}</p>
      </div>
      {/* Solver model */}
    </>
  )
}
