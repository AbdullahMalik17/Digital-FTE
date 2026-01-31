import { NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Try to fetch from backend API
    const res = await fetch(`${API_BASE}/api/digest`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }

    // Fallback to mock data if backend unavailable
    return NextResponse.json(getMockDigest())
  } catch (error) {
    console.error('Failed to fetch digest from backend:', error)
    // Return mock data as fallback
    return NextResponse.json(getMockDigest())
  }
}

function getMockDigest() {
  const now = new Date()
  const hour = now.getHours()

  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17) greeting = 'Good evening'

  return {
    date: now.toISOString(),
    greeting: `${greeting}, Abdullah`,
    urgentCount: 2,
    actionCount: 5,
    followUpsCount: 3,
    pendingDrafts: 1,
    todayEvents: [
      {
        id: '1',
        title: 'Team Standup',
        start: new Date(now.setHours(10, 0, 0, 0)).toISOString(),
        end: new Date(now.setHours(10, 30, 0, 0)).toISOString(),
      },
      {
        id: '2',
        title: 'Product Review',
        start: new Date(now.setHours(14, 0, 0, 0)).toISOString(),
        end: new Date(now.setHours(15, 0, 0, 0)).toISOString(),
      },
    ],
    recommendations: [
      'Review 2 urgent emails from clients',
      'Follow up on pending invoice from last week',
      'Consider scheduling a break - you\'ve been active for 4 hours',
    ],
    yesterdaySummary: {
      tasksCompleted: 12,
      emailsSent: 8,
      draftsApproved: 3,
      timeActive: '6h 23m',
    },
  }
}
