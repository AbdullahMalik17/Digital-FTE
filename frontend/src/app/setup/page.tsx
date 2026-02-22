'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  CheckCircle2, ArrowRight, ArrowLeft,
  Mail, MessageSquare, Linkedin, Smartphone,
  MessageCircle, Hash, Zap, Bot, Sparkles,
  Twitter, Facebook, Camera
} from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Set up your Digital FTE',
    icon: Sparkles,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    id: 'gmail',
    title: 'Gmail',
    description: 'Connect your inbox',
    icon: Mail,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    steps: [
      'Go to Google Cloud Console and create a new project',
      'Enable the Gmail API under APIs & Services',
      'Create OAuth 2.0 credentials (Desktop App type)',
      'Download credentials.json to the project root',
      'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env',
    ],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Monitor messages',
    icon: MessageSquare,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    steps: [
      'Ensure Chrome is installed on your machine',
      'Set WHATSAPP_ENABLED=true in .env',
      'Run: python src/watchers/whatsapp_watcher.py',
      'Scan the QR code that appears in the browser window',
      'The agent will now monitor your WhatsApp messages',
    ],
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    description: 'Automate social posting',
    icon: Linkedin,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    steps: [
      'Add LINKEDIN_EMAIL and LINKEDIN_PASSWORD to .env',
      'Browser automation is used — no API key required',
      'First run will prompt for 2FA verification if enabled',
      'LinkedIn session is saved to avoid repeated logins',
    ],
  },
  {
    id: 'telegram',
    title: 'Telegram',
    description: 'Command bot interface',
    icon: Smartphone,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    steps: [
      'Open Telegram and message @BotFather',
      'Send /newbot and follow the prompts to create your bot',
      'Copy the bot token → add TELEGRAM_BOT_TOKEN to .env',
      'Add your Telegram user ID as TELEGRAM_ALLOWED_USERS',
      'Start the bot: python src/telegram_bot.py',
    ],
  },
  {
    id: 'twitter',
    title: 'Twitter / X',
    description: 'Tweet & thread automation',
    icon: Twitter,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
    steps: [
      'Go to developer.twitter.com and create a new Project + App',
      'Generate API Key, API Secret, Access Token, Access Token Secret',
      'Add TWITTER_API_KEY and TWITTER_API_SECRET to config/integrations.env',
      'Add TWITTER_ACCESS_TOKEN and TWITTER_ACCESS_TOKEN_SECRET too',
      'Run: python src/integrations/twitter_client.py to verify',
    ],
  },
  {
    id: 'facebook',
    title: 'Facebook',
    description: 'Post & page management',
    icon: Facebook,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    steps: [
      'Go to developers.facebook.com and create a new App (Business type)',
      'Add the Pages API product and generate a Page Access Token',
      'Add FACEBOOK_ACCESS_TOKEN to config/integrations.env',
      'Set your Facebook Page ID in the config as well',
      'Run: python src/integrations/facebook_poster.py to verify',
    ],
  },
  {
    id: 'instagram',
    title: 'Instagram',
    description: 'Media posting & insights',
    icon: Camera,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    steps: [
      'Instagram requires a connected Facebook Business Page',
      'In your Facebook App, add the Instagram Graph API product',
      'Generate an Instagram User Access Token',
      'Add INSTAGRAM_ACCESS_TOKEN to config/integrations.env',
      'Run: python src/integrations/instagram_poster.py to verify',
    ],
  },
  {
    id: 'discord',
    title: 'Discord',
    description: 'Coming soon',
    icon: Hash,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    comingSoon: true,
    steps: [
      'Discord integration is under active development',
      'Will support slash commands and DM interactions',
      'Set DISCORD_BOT_TOKEN in .env when ready',
    ],
  },
  {
    id: 'slack',
    title: 'Slack',
    description: 'Coming soon',
    icon: MessageCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    comingSoon: true,
    steps: [
      'Slack integration is under active development',
      'Will support Slack apps with workflow automation',
      'Set SLACK_BOT_TOKEN and SLACK_APP_TOKEN in .env when ready',
    ],
  },
  {
    id: 'done',
    title: 'Ready',
    description: 'Launch your agent',
    icon: Bot,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
] as const

type StepId = (typeof STEPS)[number]['id']

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted]     = useState<Set<StepId>>(new Set())

  const step     = STEPS[currentStep]
  const progress = Math.round((currentStep / (STEPS.length - 1)) * 100)
  const isFirst  = currentStep === 0
  const isLast   = currentStep === STEPS.length - 1

  function next() {
    if (!isFirst && !isLast && 'steps' in step) {
      setCompleted(prev => new Set(Array.from(prev).concat(step.id)))
    }
    setCurrentStep(i => Math.min(i + 1, STEPS.length - 1))
  }

  function back() {
    setCurrentStep(i => Math.max(i - 1, 0))
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-3xl space-y-8">

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Setup Wizard</span>
            <span className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step dots */}
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon      = s.icon
              const isDone    = completed.has(s.id) || idx < currentStep
              const isCurrent = idx === currentStep
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setCurrentStep(idx)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                      isDone    && 'bg-green-500 border-green-500 text-white',
                      isCurrent && !isDone && 'border-primary bg-primary/10 text-primary',
                      !isDone   && !isCurrent && 'border-border bg-background text-muted-foreground'
                    )}
                  >
                    {isDone
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <Icon className="w-3.5 h-3.5" />
                    }
                  </button>
                  <span className={cn(
                    'text-[9px] font-medium hidden sm:block',
                    isCurrent ? 'text-primary' : isDone ? 'text-green-500' : 'text-muted-foreground/40'
                  )}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main card */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center', step.bg)}>
                <step.icon className={cn('w-7 h-7', step.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                  {'comingSoon' in step && step.comingSoon && (
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  )}
                </div>
                <CardDescription className="text-base mt-0.5">{step.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Welcome screen */}
            {step.id === 'welcome' && (
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to <strong className="text-foreground">Abdullah Junior</strong> — your AI-powered Digital FTE.
                  This wizard connects your communication channels so your agent can monitor,
                  respond, and take action automatically.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STEPS.filter(s => 'steps' in s).map(s => (
                    <div key={s.id} className={cn('p-3 rounded-xl border flex items-center gap-3', s.bg)}>
                      <s.icon className={cn('w-5 h-5 flex-shrink-0', s.color)} />
                      <div>
                        <div className="text-sm font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  You can skip any integration and configure it later. Each step takes about 2–5 minutes.
                </p>
              </div>
            )}

            {/* Done screen */}
            {step.id === 'done' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your agent is ready!</h3>
                  <p className="text-muted-foreground mt-2">
                    {completed.size} integration{completed.size !== 1 ? 's' : ''} configured. Start the agent with:
                  </p>
                  <code className="block mt-2 bg-muted px-4 py-2 rounded-lg font-mono text-sm text-foreground">
                    python run_api.py
                  </code>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button asChild>
                    <Link href="/"><Zap className="w-4 h-4 mr-2" />Open Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/skills">View Skills</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Integration steps */}
            {'steps' in step && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Setup Steps</h4>
                <ol className="space-y-3">
                  {step.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold',
                        step.bg, step.color
                      )}>
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ol>
                {'comingSoon' in step && step.comingSoon && (
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
                    This integration is in development. Skip for now and check back in a future update.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {!isLast && (
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={isFirst}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <div className="flex gap-3">
              {!isFirst && 'steps' in step && (
                <Button variant="ghost" onClick={next} className="text-muted-foreground">
                  Skip
                </Button>
              )}
              <Button onClick={next}>
                {currentStep === STEPS.length - 2 ? 'Finish' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
