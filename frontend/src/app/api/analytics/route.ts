import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '7d'

  try {
    const res = await fetch(`${API_BASE}/api/analytics?range=${range}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json(getMockAnalytics(range))
  } catch (error) {
    console.error('Failed to fetch analytics from backend:', error)
    return NextResponse.json(getMockAnalytics(range))
  }
}

function getMockAnalytics(range: string) {
  const m = range === '90d' ? 12 : range === '30d' ? 4 : 1

  return {
    tasksToday: 8,
    tasksThisWeek: 47,
    avgResponseTime: '2.3 hours',
    topCategories: [
      { category: 'urgent_action', count: 12 * m },
      { category: 'high_priority', count: 28 * m },
      { category: 'normal', count: 45 * m },
      { category: 'newsletter', count: 18 * m },
      { category: 'meeting', count: 15 * m },
    ],
    approvalRate: 94,
    trends: {
      tasksCompletedTrend: '+12%',
      responseTimeTrend: '-8%',
      emailVolumeTrend: '+5%',
    },
    hourlyActivity: [
      { hour: '6AM', count: 2 },
      { hour: '8AM', count: 8 },
      { hour: '10AM', count: 15 },
      { hour: '12PM', count: 12 },
      { hour: '2PM', count: 18 },
      { hour: '4PM', count: 14 },
      { hour: '6PM', count: 8 },
      { hour: '8PM', count: 4 },
    ],
    sourceBreakdown: [
      { source: 'gmail', count: 45 * m, percentage: 45 },
      { source: 'linkedin', count: 28 * m, percentage: 28 },
      { source: 'whatsapp', count: 18 * m, percentage: 18 },
      { source: 'manual', count: 9 * m, percentage: 9 },
    ],
    weeklyData: [
      { day: 'Mon', tasks: 12, completed: 10 },
      { day: 'Tue', tasks: 16, completed: 15 },
      { day: 'Wed', tasks: 14, completed: 13 },
      { day: 'Thu', tasks: 18, completed: 16 },
      { day: 'Fri', tasks: 20, completed: 18 },
      { day: 'Sat', tasks: 8, completed: 7 },
      { day: 'Sun', tasks: 5, completed: 4 },
    ],
  }
}
