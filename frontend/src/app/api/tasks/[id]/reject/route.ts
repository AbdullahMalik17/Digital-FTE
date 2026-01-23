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
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Rejected by user';

    // Find the task file in Drafts folder
    const draftsPath = path.join(VAULT_PATH, 'Drafts');
    const dlqPath = path.join(VAULT_PATH, 'Dead_Letter_Queue');

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

    // Read file content
    let content = await fs.readFile(sourcePath, 'utf-8');

    // Add rejection reason to file
    const rejectionNote = `\n\n---\n**REJECTED**: ${new Date().toISOString()}\n**Reason**: ${reason}\n`;
    content += rejectionNote;

    // Ensure DLQ directory exists
    await fs.mkdir(dlqPath, { recursive: true });

    // Write to DLQ with rejection note
    const destPath = path.join(dlqPath, `REJECTED_${taskFile}`);
    await fs.writeFile(destPath, content);

    // Remove from Drafts
    await fs.unlink(sourcePath);

    // Log the rejection
    console.log(`[API] Task rejected: ${taskFile} - Reason: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} rejected`,
      file: taskFile,
      reason,
    });
  } catch (error) {
    console.error('[API] Error rejecting task:', error);
    return NextResponse.json(
      { error: 'Failed to reject task' },
      { status: 500 }
    );
  }
}
