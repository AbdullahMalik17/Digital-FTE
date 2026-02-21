'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare, Brain, Bell, Zap, Check, BarChart2,
  Globe, Cpu, Search, Settings2
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Skill } from '@/types'

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string }> = {
  'Communication': { icon: MessageSquare, color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  'Social Media':  { icon: Globe,         color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  'Intelligence':  { icon: Brain,         color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
  'Business':      { icon: BarChart2,     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  'Notifications': { icon: Bell,          color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  'System':        { icon: Cpu,           color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
}

const DEFAULT_META = { icon: Zap, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20' }

const SKILL_META: Record<string, { usage: number; version: string; active: boolean }> = {
  'Gmail Watcher':      { usage: 1240, version: '2.1.0', active: true },
  'WhatsApp Monitor':   { usage: 980,  version: '1.8.3', active: true },
  'LinkedIn Poster':    { usage: 756,  version: '1.5.0', active: true },
  'Twitter/X Poster':   { usage: 612,  version: '1.3.2', active: true },
  'Facebook Poster':    { usage: 340,  version: '1.1.0', active: true },
  'Instagram Poster':   { usage: 290,  version: '1.0.4', active: true },
  'Task Analyzer':      { usage: 2100, version: '3.0.1', active: true },
  'Sentiment Analyzer': { usage: 1870, version: '2.4.0', active: true },
  'Daily Digest':       { usage: 890,  version: '2.0.0', active: true },
  'Follow-up Tracker':  { usage: 670,  version: '1.6.1', active: true },
  'Email Categorizer':  { usage: 1540, version: '2.2.0', active: true },
  'Odoo ERP':           { usage: 430,  version: '1.4.0', active: true },
  'Firebase Push':      { usage: 780,  version: '1.9.0', active: true },
  'Telegram Bot':       { usage: 920,  version: '2.1.0', active: true },
  'Self Healer':        { usage: 310,  version: '1.2.0', active: true },
  'Desktop Bridge':     { usage: 180,  version: '0.9.1', active: false },
  'Discord Client':     { usage: 0,    version: '0.1.0', active: false },
  'Slack Client':       { usage: 0,    version: '0.1.0', active: false },
}

export default function SkillsClient({ skills }: { skills: Skill[] }) {
  const [search, setSearch]               = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(skills.map(s => s.category || 'Other')))
    return ['All', ...cats.sort()]
  }, [skills])

  const filtered = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch =
        search === '' ||
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase())
      const matchesCat = activeCategory === 'All' || skill.category === activeCategory
      return matchesSearch && matchesCat
    })
  }, [skills, search, activeCategory])

  const activeCount  = skills.filter(s => SKILL_META[s.name]?.active !== false).length
  const totalUsage   = Object.values(SKILL_META).reduce((sum, m) => sum + m.usage, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills Marketplace</h1>
          <p className="text-muted-foreground mt-1">AI capabilities powering your Digital FTE</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="text-center px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-2xl font-bold text-primary">{skills.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">{(totalUsage / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground">Runs</div>
          </div>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const meta  = CATEGORY_META[cat] || DEFAULT_META
            const count = cat === 'All' ? skills.length : skills.filter(s => s.category === cat).length
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {cat !== 'All' && <meta.icon className="w-3 h-3" />}
                {cat}
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', isActive ? 'bg-white/20' : 'bg-muted')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">No skills found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((skill, idx) => {
            const catMeta   = CATEGORY_META[skill.category] || DEFAULT_META
            const skillMeta = SKILL_META[skill.name] || { usage: 0, version: '1.0.0', active: true }
            const Icon      = catMeta.icon

            return (
              <Card
                key={idx}
                className={cn(
                  'group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
                  skillMeta.active
                    ? 'border-border hover:border-primary/40'
                    : 'border-border/50 opacity-70 hover:opacity-90'
                )}
              >
                {skillMeta.active && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  {/* Icon */}
                  <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', catMeta.bg)}>
                    <Icon className={cn('w-5 h-5', catMeta.color)} />
                  </div>

                  {/* Name + Category */}
                  <div>
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                      {skill.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                      {skill.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {skill.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">v{skillMeta.version}</span>
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      {skillMeta.usage.toLocaleString()} runs
                    </span>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant={skillMeta.active ? 'secondary' : 'outline'}
                    className="w-full h-7 text-xs"
                  >
                    {skillMeta.active
                      ? <><Check className="w-3 h-3 mr-1 text-green-500" />Active</>
                      : <><Settings2 className="w-3 h-3 mr-1" />Configure</>
                    }
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
