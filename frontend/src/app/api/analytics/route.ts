import { NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Try to fetch from backend API
    const res = await fetch(`${API_BASE}/api/analytics`, {
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
    return NextResponse.json(getMockAnalytics())
  } catch (error) {
    console.error('Failed to fetch analytics from backend:', error)
    return NextResponse.json(getMockAnalytics())
  }
}

function getMockAnalytics() {
  return {
    tasksToday: 8,
    tasksThisWeek: 47,
    avgResponseTime: '2.3 hours',
    topCategories: [
      { category: 'urgent_action', count: 12 },
      { category: 'high_priority', count: 28 },
      { category: 'normal', count: 45 },
      { category: 'newsletter', count: 18 },
      { category: 'meeting', count: 15 },
    ],
    approvalRate: 94,
    trends: {
      tasksCompletedTrend: '+12%',
      responseTimeTrend: '-8%',
      emailVolumeTrend: '+5%',
    },
  }
}
