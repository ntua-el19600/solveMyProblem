'use client'
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {useRouter} from 'next/navigation'
import {useUser} from '@clerk/nextjs'
import {useState, useEffect} from 'react'

interface Problem {
  status: string
  timestamp: string
  problem_data: object
  category: string
  solution: string
  timelapse: number
}

const PROBLEM_HANDLER_API_URL = process.env.NEXT_PUBLIC_PROBLEM_HANDLER_API_URL

export default function Home() {
  const router = useRouter()
  const {user} = useUser()
  const [dateTime, setDateTime] = useState('')
  const [rows, setRows] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedProblemData, setSelectedProblemData] = useState<object | null>(
    null
  )
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null)

  const handleClick = (route: string) => router.push(route)

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString())
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const getProblems = async () => {
    if (!user) return

    const payload = {
      userId: user.id
    }

    const response = await fetch('/api/list-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    try {
      if (!response.ok) {
        throw new Error('Failed to fetch problem data')
      }

      const data = await response.json()
      setRows(data.problems)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching problems:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getProblems()
  }, [user])

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const getChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'warning'
      case 'complete':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const handleOpen = (problemData: object) => {
    setSelectedProblemData(problemData)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setSelectedProblemData(null)
      setSelectedSolution(null)
    }, 200)
  }

  const handleSolutionClick = (solution: string) => {
    setSelectedSolution(solution)
    setOpen(true)
  }

  const renderSolution = (solution: string) => {
    return solution.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ))
  }

  return (
    <>
      <div className="absolute top-16 right-4 text-right">
        <p>{`Current Date/Time: ${dateTime}` || 'Loading...'}</p>
      </div>
      <Button
        className="!mt-6"
        onClick={() => handleClick('/submissions/new')}
        variant="outlined"
      >
        Create new
      </Button>
      <TableContainer
        component={Paper}
        className="!rounded-50 !border !border-blue-500 !mt-6"
      >
        <Table sx={{minWidth: 650}} aria-label="submissions table">
          <TableHead>
            <TableRow>
              <TableCell className="!font-bold">Category</TableCell>
              <TableCell className="!font-bold">Created on</TableCell>
              <TableCell className="!font-bold">Timelapse (ms)</TableCell>
              <TableCell className="!font-bold">Status</TableCell>
              <TableCell className="!font-bold">View Problem Data</TableCell>
              <TableCell className="!font-bold">Solution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.timestamp}
                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
                >
                  <TableCell component="th" scope="row">
                    {capitalize(row.category)}
                  </TableCell>
                  <TableCell>
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{row.timelapse}</TableCell>
                  <TableCell>
                    <Chip
                      label={capitalize(row.status)}
                      color={getChipColor(row.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpen(row.problem_data)}
                    >
                      View Data
                    </Button>
                  </TableCell>
                  <TableCell>
                    {row.status.toLowerCase() === 'complete' ? (
                      <Button
                        variant="outlined"
                        onClick={() => handleSolutionClick(row.solution)}
                      >
                        View Solution
                      </Button>
                    ) : (
                      capitalize(row.solution)
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        {selectedProblemData && <DialogTitle>Problem Data</DialogTitle>}
        {selectedSolution && <DialogTitle>Solution</DialogTitle>}
        <DialogContent>
          {selectedProblemData ? (
            <pre>{JSON.stringify(selectedProblemData, null, 2)}</pre>
          ) : selectedSolution ? (
            <div>{renderSolution(selectedSolution)}</div>
          ) : (
            <p>No data available</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
