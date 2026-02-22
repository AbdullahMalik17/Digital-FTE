'use client'

import { useState } from 'react'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  gmail:    { label: 'Gmail',    color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  whatsapp: { label: 'WhatsApp', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  twitter:  { label: 'Twitter',  color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
}

function detectSource(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.includes('gmail'))    return 'gmail'
  if (lower.includes('whatsapp')) return 'whatsapp'
  if (lower.includes('linkedin')) return 'linkedin'
  if (lower.includes('twitter'))  return 'twitter'
  return ''
}

function formatTimestamp(ts: string | number | undefined): string {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  } catch { return '' }
}

export default function TaskBoard({
  initialPending,
  initialCompleted,
}: {
  initialPending: Task[]
  initialCompleted: Task[]
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filterTask = (task: Task) =>
    task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.filename.toLowerCase().includes(searchTerm.toLowerCase())

  const filteredPending   = initialPending.filter(filterTask)
  const filteredCompleted = initialCompleted.filter(filterTask)

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search operations matrix..."
            className="pl-9 h-9 bg-background/50 border-white/5 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/30 rounded-xl transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 h-9 bg-amber-500/5 rounded-xl border border-amber-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold text-amber-400/80 tracking-wide uppercase">
              {filteredPending.length} Pending
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 h-9 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-400/80 tracking-wide uppercase">
              {filteredCompleted.length} Done
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Pending Tasks Column ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Attention Required</h3>
            </div>
            <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 px-2.5 font-mono text-xs tabular-nums">
              {filteredPending.length}
            </Badge>
          </div>

          {filteredPending.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01] gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl opacity-30">📂</div>
              <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                {searchTerm ? 'No matching operations' : 'All systems nominal'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPending.map((task) => {
                const isHigh   = task.importance === 'high'
                const source   = detectSource(task.filename)
                const srcInfo  = SOURCE_LABELS[source]

                return (
                  <Card
                    key={task.id}
                    className={cn(
                      'relative overflow-hidden border transition-all duration-300 cursor-pointer group',
                      'bg-white/[0.02] hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-xl',
                      isHigh
                        ? 'border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/5'
                        : 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/5'
                    )}
                  >
                    {/* Priority accent strip */}
                    <div className={cn('absolute left-0 top-0 bottom-0 w-0.5', isHigh ? 'bg-red-500' : 'bg-amber-500')} />

                    {/* Hover execute button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors">
                        Execute →
                      </button>
                    </div>

                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-start gap-3 pr-24">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5', isHigh ? 'bg-red-500/10' : 'bg-amber-500/10')}>
                          {isHigh ? '🔴' : '🟡'}
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground leading-tight line-clamp-2" title={task.filename}>
                          {task.filename}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 pb-4">
                      <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
                        {task.content.substring(0, 120)}{task.content.length > 120 ? '...' : ''}
                      </p>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/15">
                          Draft Ready
                        </span>
                        {isHigh && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                            HIGH PRIORITY
                          </span>
                        )}
                        {srcInfo && (
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', srcInfo.color)}>
                            {srcInfo.label}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Completed Tasks Column ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Processed Ops</h3>
            </div>
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-2.5 font-mono text-xs tabular-nums">
              {filteredCompleted.length}
            </Badge>
          </div>

          {filteredCompleted.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01] gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl opacity-30">✅</div>
              <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                {searchTerm ? 'No matching records' : 'No operations log'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompleted.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    'relative overflow-hidden border transition-all duration-300 cursor-pointer group',
                    'bg-white/[0.01] border-white/5',
                    'hover:bg-white/[0.03] hover:-translate-y-0.5 hover:border-emerald-500/20',
                    'opacity-70 hover:opacity-100'
                  )}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500/60" />

                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✅</div>
                      <CardTitle className="text-sm font-bold text-muted-foreground/70 leading-tight line-clamp-2" title={task.filename}>
                        {task.filename}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardFooter className="pt-0 px-5 pb-4 justify-between items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Archived
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">FTE Executed</span>
                    </div>
                    {task.timestamp && (
                      <span className="text-[10px] font-bold text-muted-foreground/40 font-mono shrink-0">
                        {formatTimestamp(task.timestamp)}
                      </span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
