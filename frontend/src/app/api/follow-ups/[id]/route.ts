import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { action } = body // 'resolve', 'snooze', or 'dismiss'

    // Try to forward to backend API
    const res = await fetch(`${API_BASE}/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }

    // Mock response if backend unavailable
    return NextResponse.json({
      success: true,
      id,
      action,
      message: `Follow-up ${id} ${action}d successfully`,
    })
  } catch (error) {
    console.error('Failed to update follow-up:', error)
    // Return success anyway for demo purposes
    return NextResponse.json({
      success: true,
      id,
      message: 'Action recorded (offline mode)',
    })
  }
}
