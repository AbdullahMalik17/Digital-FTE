import { NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Try to fetch from backend API
    const res = await fetch(`${API_BASE}/api/follow-ups`, {
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
    return NextResponse.json({ followUps: getMockFollowUps() })
  } catch (error) {
    console.error('Failed to fetch follow-ups from backend:', error)
    return NextResponse.json({ followUps: getMockFollowUps() })
  }
}

function getMockFollowUps() {
  const now = new Date()

  return [
    {
      id: 'fu-1',
      emailId: 'email-123',
      contact: 'John Smith',
      subject: 'Project Proposal Review',
      sentDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      reminderDate: now.toISOString(),
      status: 'pending' as const,
      priority: 'high' as const,
      daysSince: 4,
    },
    {
      id: 'fu-2',
      emailId: 'email-124',
      contact: 'Sarah Johnson',
      subject: 'Invoice #1234 - Payment Pending',
      sentDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reminderDate: now.toISOString(),
      status: 'pending' as const,
      priority: 'high' as const,
      daysSince: 2,
    },
    {
      id: 'fu-3',
      emailId: 'email-125',
      contact: 'Mike Chen',
      subject: 'Meeting Reschedule Request',
      sentDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reminderDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      priority: 'medium' as const,
      daysSince: 1,
    },
  ]
}
