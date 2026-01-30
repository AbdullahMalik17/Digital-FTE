import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Vault path - adjust based on environment
const VAULT_PATH = process.env.VAULT_PATH || path.join(process.cwd(), '..', 'Vault');

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // Security: Validate task ID to prevent path traversal
    // Only allow alphanumeric, hyphens, underscores, and dots
    if (!/^[a-zA-Z0-9_.-]+$/.test(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }

    // Additional security: Prevent path traversal attempts
    if (taskId.includes('..') || taskId.includes('/') || taskId.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid task ID - path traversal detected' },
        { status: 400 }
      );
    }

    // Find the task file in Drafts folder
    const draftsPath = path.join(VAULT_PATH, 'Drafts');
    const approvedPath = path.join(VAULT_PATH, 'Approved');

    // List all files in Drafts
    const files = await fs.readdir(draftsPath);

    // Security: Use exact match or safe pattern matching
    // Only match files that start with taskId and end with .md
    const taskFile = files.find((f) =>
      f === `${taskId}.md` ||
      f === taskId ||
      (f.startsWith(`${taskId}_`) && f.endsWith('.md'))
    );

    if (!taskFile) {
      return NextResponse.json(
        { error: 'Task not found in drafts' },
        { status: 404 }
      );
    }

    const sourcePath = path.join(draftsPath, taskFile);
    const destPath = path.join(approvedPath, taskFile);

    // Ensure Approved directory exists
    await fs.mkdir(approvedPath, { recursive: true });

    // Move file from Drafts to Approved (atomic rename)
    await fs.rename(sourcePath, destPath);

    // Log the approval
    console.log(`[API] Task approved: ${taskFile}`);

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} approved`,
      file: taskFile,
    });
  } catch (error) {
    console.error('[API] Error approving task:', error);
    return NextResponse.json(
      { error: 'Failed to approve task' },
      { status: 500 }
    );
  }
}
