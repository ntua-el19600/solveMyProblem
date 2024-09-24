'use client'
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField
} from '@mui/material'
import React, {useState, useEffect, ChangeEvent} from 'react'
import {useUser} from '@clerk/nextjs'
import {useRouter} from 'next/navigation'
import {useUserContext} from '@/context/UserContext'

const LINEAR = 'linear'
const LINEAR_COST = 3

const VRP = 'vrp'
const VRP_COST = 5

const modelToCostMap = {
  [LINEAR]: LINEAR_COST,
  [VRP]: VRP_COST
}

export default function Home() {
  const {user} = useUser()
  const {credits, refreshCredits} = useUserContext()
  const router = useRouter()
  const [dateTime, setDateTime] = useState('')
  const [model, setModel] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [helperText, setHelperText] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString())
    updateTime() // Set initial date/time on mount
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleJsonInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    setJsonInput(inputValue)

    try {
      if (inputValue.trim() === '') {
        throw new Error('empty-input')
      }
      const parsedJson = JSON.parse(inputValue)

      if (
        typeof parsedJson === 'object' &&
        parsedJson !== null &&
        Object.keys(parsedJson).length === 0
      ) {
        throw new Error('empty-json')
      }

      setHelperText('')
    } catch (e: any) {
      if (e.message === 'empty-input') {
        setHelperText('Json input cannot be empty')
      } else if (e.message === 'empty-json') {
        setHelperText('Json input cannot be an empty JSON object')
      } else {
        setHelperText('Invalid JSON format')
      }
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    if (
      (model === 'linear' && credits < LINEAR_COST) ||
      (model === 'vrp' && credits < VRP_COST)
    ) {
      setSnackbarMessage("You don't have enough credits!")
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }

    const userId = user.id
    const payload = {
      userId,
      category: model,
      json: JSON.parse(jsonInput)
    }

    const response = await fetch('/api/new-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    try {
      if (response.ok) {
        setSnackbarMessage('Problem submitted successfully!')
        setSnackbarSeverity('success')
        setTimeout(() => {
          refreshCredits()
        }, 200)
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorMessage = data.errors[0].message
          const errorField = data.errors[0].field
          setSnackbarMessage(
            `Error: ${errorMessage} for the ${errorField} field`
          )
        } else {
          setSnackbarMessage('Failed to submit problem')
        }
        setSnackbarSeverity('error')
      }
    } catch (error) {
      setSnackbarMessage('An error occurred. Please try again.')
      setSnackbarSeverity('error')
    } finally {
      setSnackbarOpen(true)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleClick = (route: string) => router.push(route)

  return (
    <>
      <div className="absolute top-16 right-4 text-right">
        <p>{`Current Date/Time: ${dateTime}` || 'Loading...'}</p>
      </div>
      <div className="!w-full !grid !place-items-center !mt-14">
        <div className="!w-2/3 !h-[calc(100%-6rem)]">
          <FormControl required fullWidth>
            <InputLabel id="select-solver-model-label">Model</InputLabel>
            <Select
              labelId="select-solver-model-label"
              id="demo-simple-select"
              value={model}
              label="Solver model"
              onChange={(event: SelectChangeEvent) =>
                setModel(event.target.value as string)
              }
              MenuProps={{
                classes: {
                  paper: '!shadow-md !shadow-gray-500 !rounded-md !p-1.5',
                  list: '!p-0'
                }
              }}
            >
              <MenuItem
                className="hover:!bg-gray-300 focus:!bg-gray-400 !rounded-md focus:!outline-none"
                value="linear"
              >
                Linear
              </MenuItem>
              <MenuItem
                className="hover:!bg-gray-300 focus:!bg-gray-400 !rounded-md focus:!outline-none"
                value="vrp"
              >
                Vehicle Routing Problem (VRP)
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            className="!mt-4"
            id="outlined-multiline-json-input"
            label="Json input"
            error={!!helperText}
            fullWidth
            helperText={helperText}
            rows={6}
            multiline
            required
            onChange={handleJsonInputChange}
            value={jsonInput}
          />
          {model ? (
            <div className="!text-lg !mt-4 !underline">
              Submitting costs{' '}
              {modelToCostMap[model as keyof typeof modelToCostMap]} credits!
            </div>
          ) : (
            <div className="!text-lg !mt-4 !italic">
              Please select a solver model
            </div>
          )}
          <Button
            className="!mt-2"
            disabled={!model || !!helperText || !jsonInput}
            onClick={handleSubmit}
            variant="outlined"
          >
            Submit
          </Button>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
      >
        <Alert
          action={
            snackbarSeverity === 'success' ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => handleClick('/submissions/list')}
              >
                See list
              </Button>
            ) : undefined
          }
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{width: '100%'}}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
