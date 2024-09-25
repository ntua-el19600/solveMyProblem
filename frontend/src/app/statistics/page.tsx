'use client'

import {PieChart} from '@mui/x-charts/PieChart'
import {BarChart} from '@mui/x-charts/BarChart'
import {useUser} from '@clerk/nextjs'
import {useEffect, useState} from 'react'
import {
  CircularProgress,
  Box,
  Typography,
  Grid,
  capitalize
} from '@mui/material'

interface StatsData {
  averageTimelapse: number
  completedCount: number
  cancelledCount: number
  submittedCount: number
  problemsPerCategory: Record<string, number>
}

const STATS_API_URL =
  process.env.NEXT_PUBLIC_STATS_API_URL || '/api/stats-proxy'

export default function Statistics() {
  const {user} = useUser()
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    if (!user) return

    const payload = {
      userId: user.id
    }

    try {
      const response = await fetch(STATS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics data')
      }

      const data: StatsData = await response.json()
      setStatsData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [user])

  return (
    <div className="flex flex-col items-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <CircularProgress />
        </div>
      ) : statsData ? (
        <>
          <Grid
            container
            spacing={2}
            sx={{width: '100%', maxWidth: '1400px'}}
            alignItems="flex-start"
          >
            {/* Header for Statistics */}
            <Grid item xs={12}>
              <Typography variant="h5" sx={{textAlign: 'left'}}>
                Statistics
              </Typography>
            </Grid>

            {/* Display Average Timelapse */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{textAlign: 'left', mb: 2, width: '100%'}}
              >
                Average Timelapse: {statsData.averageTimelapse} ms
              </Typography>
            </Grid>

            {/* Pie Chart for Problem Status */}
            <Grid item xs={12} md={6}>
              <Box sx={{width: '100%'}}>
                <Typography variant="h6" sx={{textAlign: 'left', mb: 2}}>
                  Problem Status Distribution
                </Typography>
                <PieChart
                  series={[
                    {
                      data: [
                        {
                          id: 'Completed',
                          value: statsData.completedCount,
                          label: 'Completed'
                        },
                        {
                          id: 'Cancelled',
                          value: statsData.cancelledCount,
                          label: 'Cancelled'
                        },
                        {
                          id: 'Submitted',
                          value: statsData.submittedCount,
                          label: 'Submitted'
                        }
                      ]
                    }
                  ]}
                  width={700}
                  height={400}
                  colors={['#4CAF50', '#F44336', '#FFC107']}
                  sx={{mr: 12}}
                />
              </Box>
            </Grid>

            {/* Bar Chart for Problems Per Category */}
            <Grid item xs={12} md={6}>
              <Box sx={{width: '100%'}}>
                <Typography variant="h6" sx={{textAlign: 'left', mb: 2}}>
                  Problems Per Category
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      id: 'categories',
                      // Capitalize the first letter of each category
                      data: Object.keys(statsData.problemsPerCategory).map(
                        (category) => capitalize(category)
                      ),
                      label: 'Category',
                      scaleType: 'band'
                    }
                  ]}
                  series={[
                    {
                      data: Object.values(statsData.problemsPerCategory),
                      label: 'Problems'
                    }
                  ]}
                  width={700}
                  height={400}
                  colors={['#42A5F5']}
                />
              </Box>
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography variant="h6" color="error" className="mt-20">
          No data available.
          <br />
          It seems you haven&apos;t submitted any problems yet.
        </Typography>
      )}
    </div>
  )
}
