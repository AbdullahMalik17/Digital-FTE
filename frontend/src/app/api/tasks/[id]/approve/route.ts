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

    // Find the task file in Drafts folder
    const draftsPath = path.join(VAULT_PATH, 'Drafts');
    const approvedPath = path.join(VAULT_PATH, 'Approved');

    // List all files in Drafts
    const files = await fs.readdir(draftsPath);
    const taskFile = files.find((f) => f.includes(taskId) || f === `${taskId}.md`);

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
