'use client'
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {useRouter} from 'next/navigation'
import {useState, useEffect} from 'react'

export default function Home() {
  const router = useRouter()
  const [dateTime, setDateTime] = useState('')

  const handleClick = (route: string) => router.push(route)

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString())
    updateTime() // Set initial date/time on mount
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // async get rows
  // const rows = ...

  return (
    <>
      <div className="absolute top-4 right-4 text-right">
        <p>{`Current Date/Time: ${dateTime}` || 'Loading...'}</p>
      </div>
      <TableContainer
        component={Paper}
        className="rounded-50 border border-blue-500 mt-14"
      >
        <Table sx={{minWidth: 650}} aria-label="submissions table">
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">Name</TableCell>
              <TableCell className="font-bold">Created on</TableCell>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell className="font-bold">Edit</TableCell>
              <TableCell className="font-bold">Run</TableCell>
              <TableCell className="font-bold">View results</TableCell>
              <TableCell className="font-bold">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{'&:last-child td, &:last-child th': {border: 0}}}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{row.created_on}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.results}</TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        className=" outline outline-1 outline-blue-500 hover:outline-2 text-blue-500 mt-6"
        onClick={() => handleClick('/submissions/new')}
      >
        Create new
      </Button>
    </>
  )
}
