'use client'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField
} from '@mui/material'
import React, {useState, useEffect, ChangeEvent} from 'react'

const LINEAR = 'linear'
const LINEAR_COST = 50

const VRP = 'vrp'
const VRP_COST = 150

const modelToCostMap = {
  [LINEAR]: LINEAR_COST,
  [VRP]: VRP_COST
}

export default function Home() {
  const [dateTime, setDateTime] = useState('')
  const [model, setModel] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [helperText, setHelperText] = useState('')

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString())
    updateTime() // Set initial date/time on mount
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async () => {
    try {
    } catch {}
  }

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

  return (
    <>
      <div className="absolute top-4 right-4 text-right">
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
            className="!outline !outline-1 !outline-blue-500 hover:!outline-2 !text-blue-500 !mt-2 disabled:!outline-current"
            disabled={!model || !!helperText}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  )
}
