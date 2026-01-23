import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Vault path - adjust based on environment
const VAULT_PATH = process.env.VAULT_PATH || path.join(process.cwd(), '..', 'Vault');

// Store last known count for detecting new drafts
let lastKnownCount = 0;

export async function GET() {
  try {
    const draftsPath = path.join(VAULT_PATH, 'Drafts');

    // Ensure directory exists
    await fs.mkdir(draftsPath, { recursive: true });

    // List all .md files in Drafts
    const files = await fs.readdir(draftsPath);
    const draftFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('.'));
    const currentCount = draftFiles.length;

    // Calculate new drafts since last check
    const newCount = Math.max(0, currentCount - lastKnownCount);
    lastKnownCount = currentCount;

    return NextResponse.json({
      count: currentCount,
      newCount,
    });
  } catch (error) {
    console.error('[API] Error counting drafts:', error);
    return NextResponse.json(
      { count: 0, newCount: 0 },
      { status: 500 }
    );
  }
}
