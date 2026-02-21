'use client'

import { useState } from 'react'
import type { Task } from '@/types'
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function TaskBoard({ 
    initialPending, 
    initialCompleted 
}: { 
    initialPending: Task[], 
    initialCompleted: Task[] 
}) {
    const [searchTerm, setSearchTerm] = useState("")

    const filterTask = (task: Task) => {
        const matchesSearch = task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.filename.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }

    const filteredPending = initialPending.filter(filterTask)
    const filteredCompleted = initialCompleted.filter(filterTask)

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                        placeholder="Search operations matrix..." 
                        className="pl-10 h-10 bg-background/50 border-white/5 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/30 rounded-xl transition-all" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 px-4 h-10 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                        {filteredPending.length + filteredCompleted.length} Active Workflows
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Pending Tasks Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                               Attention Required
                            </h3>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 px-2 font-mono">{filteredPending.length}</Badge>
                    </div>
                    
                    {filteredPending.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-muted-foreground/50 text-sm bg-white/[0.01]">
                            <div className="text-2xl mb-2 opacity-20">📂</div>
                            {searchTerm ? "No matching operations." : "All systems nominal."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPending.map(task => (
                                <Card key={task.id} className={cn(
                                    "glass-card bg-white/[0.02] border-white/5 transition-all glass-card-hover group relative overflow-hidden",
                                    task.importance === 'high' ? "border-l-4 border-l-red-500/50" : "border-l-4 border-l-amber-500/50"
                                )}>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-xs font-bold text-primary hover:underline">Execute Now</button>
                                    </div>
                                    <CardHeader className="pb-3 pt-5 px-6">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-sm font-bold text-foreground truncate max-w-[80%]" title={task.filename}>
                                                {task.filename}
                                            </CardTitle>
                                            {task.importance === 'high' && (
                                                <span className="text-[10px] font-bold text-red-500 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">PRIORITY</span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-5">
                                        <div className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                            {task.content.substring(0, 150)}...
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            <span>Autonomous Draft</span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-primary" />
                                                Ready for Review
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Tasks Column */}
                <div className="space-y-6">
                     <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                               Processed Ops
                            </h3>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-2 font-mono">{filteredCompleted.length}</Badge>
                    </div>

                    {filteredCompleted.length === 0 ? (
                         <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-muted-foreground/50 text-sm bg-white/[0.01]">
                            <div className="text-2xl mb-2 opacity-20">✔️</div>
                            {searchTerm ? "No matching records." : "No operations log."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCompleted.map(task => (
                                <Card key={task.id} className="glass-card bg-white/[0.01] border-white/5 hover:bg-white/[0.03] transition-all opacity-70 hover:opacity-100 group">
                                    <CardHeader className="pb-3 pt-5 px-6">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-sm font-bold text-muted-foreground/70 truncate decoration-zinc-700" title={task.filename}>
                                                {task.filename}
                                            </CardTitle>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                                <span className="text-[10px] text-emerald-500 font-bold uppercase">Archived</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="pt-0 px-6 pb-4 justify-between items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                                            FTE EXECUTION SUCCESS
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/50 font-mono">
                                            {new Date(task.timestamp).toLocaleString('en-US', {
                                                month: 'short',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>
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
