import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {}
  const vars: Record<string, string> = {}
  fs.readFileSync(filePath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#\s][^=]*)=(.*)$/)
    if (m) vars[m[1].trim()] = m[2].trim()
  })
  return vars
}

export async function GET() {
  // Load from config/integrations.env — project convention
  const configPath = path.resolve(process.cwd(), '..', 'config', 'integrations.env')
  const env = parseEnvFile(configPath)

  const integrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      color: 'red',
      description: 'Email monitoring & auto-reply',
      configured: !!(env.GOOGLE_CLIENT_ID),
      envKey: 'GOOGLE_CLIENT_ID',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'green',
      description: 'Message monitoring & automation',
      configured: env.WHATSAPP_ENABLED === 'true',
      envKey: 'WHATSAPP_ENABLED',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'blue',
      description: 'Social posting & networking',
      configured: !!(env.LINKEDIN_EMAIL),
      envKey: 'LINKEDIN_EMAIL',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      color: 'sky',
      description: 'Command bot interface',
      configured: !!(env.TELEGRAM_BOT_TOKEN),
      envKey: 'TELEGRAM_BOT_TOKEN',
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: '🐦',
      color: 'slate',
      description: 'Tweet & thread automation',
      configured: !!(env.TWITTER_API_KEY),
      envKey: 'TWITTER_API_KEY',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'blue',
      description: 'Post & page management',
      configured: !!(env.FACEBOOK_ACCESS_TOKEN),
      envKey: 'FACEBOOK_ACCESS_TOKEN',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'pink',
      description: 'Media posting & insights',
      configured: !!(env.INSTAGRAM_ACCESS_TOKEN),
      envKey: 'INSTAGRAM_ACCESS_TOKEN',
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '🎮',
      color: 'indigo',
      description: 'Bot commands & notifications',
      configured: !!(env.DISCORD_BOT_TOKEN),
      envKey: 'DISCORD_BOT_TOKEN',
      comingSoon: true,
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💡',
      color: 'amber',
      description: 'Workspace automation',
      configured: !!(env.SLACK_BOT_TOKEN),
      envKey: 'SLACK_BOT_TOKEN',
      comingSoon: true,
    },
  ]

  const configuredCount = integrations.filter(i => i.configured).length
  const activeCount = integrations.filter(i => i.configured && !i.comingSoon).length

  return NextResponse.json({ integrations, configuredCount, activeCount, total: integrations.length })
}
