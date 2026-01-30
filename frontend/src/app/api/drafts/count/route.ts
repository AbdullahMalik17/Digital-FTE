import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Vault path - adjust based on environment
const VAULT_PATH = process.env.VAULT_PATH || path.join(process.cwd(), '..', 'Vault');

// IMPORTANT: This API route uses file system access which won't work in serverless environments
// For production deployment (Vercel, Netlify), consider:
// 1. Using a database to store draft metadata
// 2. Deploying with Node.js runtime (not Edge runtime)
// 3. Using an external storage service (S3, R2, etc.)

export async function GET() {
  try {
    const draftsPath = path.join(VAULT_PATH, 'Drafts');

    // Ensure directory exists
    await fs.mkdir(draftsPath, { recursive: true });

    // List all .md files in Drafts
    const files = await fs.readdir(draftsPath);
    const draftFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('.'));
    const currentCount = draftFiles.length;

    // Note: "newCount" tracking removed - was using module-level state
    // which doesn't persist in serverless/multi-instance environments.
    // To track new drafts, implement client-side localStorage or server-side DB tracking.

    return NextResponse.json({
      count: currentCount,
      // Legacy field for backwards compatibility - always 0 now
      newCount: 0,
    });
  } catch (error) {
    console.error('[API] Error counting drafts:', error);
    return NextResponse.json(
      { count: 0, newCount: 0 },
      { status: 500 }
    );
  }
}
