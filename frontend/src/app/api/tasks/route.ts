import { NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Try to fetch from backend API
    const [pendingRes, completedRes] = await Promise.all([
      fetch(`${API_BASE}/api/tasks?folder=Pending_Approval&limit=50`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${API_BASE}/api/tasks?folder=Done&limit=20`, {
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ])

    const pending = pendingRes.ok ? await pendingRes.json() : { tasks: [] }
    const completed = completedRes.ok ? await completedRes.json() : { tasks: [] }

    // Map API response to frontend format
    const pendingTasks = (pending.tasks || []).map((t: any) => ({
      id: t.id || t.filename,
      filename: t.filename,
      content: t.description || t.content_preview || t.content || '',
      title: t.title,
      status: 'pending' as const,
      timestamp: new Date(t.created || Date.now()).getTime(),
      importance: t.priority === 'urgent' ? 'high' : (t.priority || 'medium'),
      priority: t.priority,
      source: t.source,
      category: t.category,
      sentiment: t.sentiment,
      followUpDue: t.follow_up_due,
    }))

    const completedTasks = (completed.tasks || []).map((t: any) => ({
      id: t.id || t.filename,
      filename: t.filename,
      content: t.content_preview || t.content || '',
      status: 'done' as const,
      timestamp: new Date(t.created || Date.now()).getTime(),
      importance: 'medium' as const,
      source: t.source,
    }))

    return NextResponse.json({
      pending: pendingTasks,
      completed: completedTasks,
    })
  } catch (error) {
    console.error('Failed to fetch tasks from backend:', error)
    
    // Return mock data if backend unavailable
    return NextResponse.json(getMockTasks())
  }
}

function getMockTasks() {
  return {
    pending: [
      {
        id: 'task-001',
        filename: 'Inquiry_From_Potential_Client.md',
        content: 'New inquiry from John Doe regarding AI consulting services. Budget: $5000. Requires follow-up call.',
        title: 'Client Inquiry - AI Consulting',
        status: 'pending' as const,
        timestamp: Date.now() - 3600000,
        importance: 'high' as const,
        priority: 'urgent',
        source: 'gmail',
        category: 'urgent_action',
        sentiment: 'positive',
      },
      {
        id: 'task-002',
        filename: 'LinkedIn_Connection_Request.md',
        content: 'Sarah Johnson (CEO at TechCorp) wants to connect. Consider accepting and sending personalized message.',
        title: 'LinkedIn Connection - CEO',
        status: 'pending' as const,
        timestamp: Date.now() - 7200000,
        importance: 'medium' as const,
        priority: 'high',
        source: 'linkedin',
        category: 'high_priority',
        sentiment: 'neutral',
      },
      {
        id: 'task-003',
        filename: 'WhatsApp_Message_Group.md',
        content: 'Team meeting scheduled for tomorrow at 3 PM. Please confirm attendance.',
        title: 'Team Meeting Reminder',
        status: 'pending' as const,
        timestamp: Date.now() - 14400000,
        importance: 'medium' as const,
        priority: 'medium',
        source: 'whatsapp',
        category: 'meeting',
        sentiment: 'neutral',
      },
    ],
    completed: [
      {
        id: 'task-004',
        filename: 'Invoice_Sent_To_Client.md',
        content: 'Invoice #1234 sent to ABC Corp for $3500. Payment terms: Net 30.',
        status: 'done' as const,
        timestamp: Date.now() - 86400000,
        importance: 'medium' as const,
        source: 'gmail',
      },
      {
        id: 'task-005',
        filename: 'Social_Media_Post_Scheduled.md',
        content: 'LinkedIn post about new AI features scheduled for tomorrow 9 AM.',
        status: 'done' as const,
        timestamp: Date.now() - 172800000,
        importance: 'low' as const,
        source: 'linkedin',
      },
    ],
  }
}
