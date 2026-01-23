import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Vault path - adjust based on environment
const VAULT_PATH = process.env.VAULT_PATH || path.join(process.cwd(), '..', 'Vault');

export async function GET() {
  try {
    const draftsPath = path.join(VAULT_PATH, 'Drafts');

    // Ensure directory exists
    await fs.mkdir(draftsPath, { recursive: true });

    // List all files in Drafts
    const files = await fs.readdir(draftsPath);
    const drafts = [];

    for (const file of files) {
      if (file.endsWith('.md') && !file.startsWith('.')) {
        const filePath = path.join(draftsPath, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        // Parse basic info from content
        const lines = content.split('\n');
        const title = lines[0]?.replace(/^#\s*/, '') || file;

        // Extract priority if present
        let priority = 'medium';
        const priorityMatch = content.match(/priority:\s*(high|medium|low|urgent)/i);
        if (priorityMatch) {
          priority = priorityMatch[1].toLowerCase();
        }

        // Extract action type if present
        let actionType = 'unknown';
        const actionMatch = content.match(/action[_-]?type:\s*(\w+)/i);
        if (actionMatch) {
          actionType = actionMatch[1];
        }

        drafts.push({
          id: file.replace('.md', ''),
          filename: file,
          title,
          priority,
          actionType,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          preview: content.substring(0, 200),
        });
      }
    }

    // Sort by creation date (newest first)
    drafts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      drafts,
      count: drafts.length,
    });
  } catch (error) {
    console.error('[API] Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts', drafts: [], count: 0 },
      { status: 500 }
    );
  }
}
