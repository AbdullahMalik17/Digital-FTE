'use client';

import { useState } from 'react';
import { submitTask } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const QUICK_COMMANDS = [
  { icon: '📧', label: 'Check Emails', prompt: 'Check and summarize my latest unread emails' },
  { icon: '📋', label: 'Task Status', prompt: 'Show me the status of all pending tasks' },
  { icon: '📊', label: 'Daily Report', prompt: 'Generate a comprehensive daily activity report' },
  { icon: '🔔', label: 'Follow-ups', prompt: 'What follow-ups need my attention today?' },
];

export default function AgentChat() {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setSending(true);

    const formData = new FormData();
    formData.set('title', 'Quick Command');
    formData.set('content', input);
    formData.set('priority', priority);

    await submitTask(formData);

    setInput('');
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="glass-card border-primary/10 overflow-hidden relative group">
      {/* Top shimmer border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Animated AI Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-primary/30">
              🤖
            </div>
            <div className="absolute inset-0 rounded-xl ring-2 ring-primary/30 animate-pulse" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-foreground tracking-tight">Command Interface</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-green-400/80 font-bold uppercase tracking-widest">Neural Link Active</p>
            </div>
          </div>
        </div>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50 border-white/5 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="low" className="text-xs">🟢 Low</SelectItem>
            <SelectItem value="medium" className="text-xs">🟡 Medium</SelectItem>
            <SelectItem value="high" className="text-xs">🔴 High Priority</SelectItem>
            <SelectItem value="urgent" className="text-xs">🚨 Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Commands */}
      <div className="px-5 pt-4 pb-2 grid grid-cols-2 gap-2">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.label}
            onClick={() => setInput(cmd.prompt)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all group/btn',
              'bg-white/[0.03] border border-white/5',
              'hover:bg-primary/10 hover:border-primary/20',
              input === cmd.prompt && 'bg-primary/15 border-primary/30'
            )}
          >
            <span className="text-sm group-hover/btn:scale-110 transition-transform">{cmd.icon}</span>
            <span className="text-[11px] font-bold text-muted-foreground group-hover/btn:text-primary transition-colors truncate">
              {cmd.label}
            </span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-5 pt-3 space-y-3">
        <div className="relative">
          <Textarea
            placeholder="What should Abdullah Junior execute next? Press Enter to transmit..."
            className={cn(
              'bg-background/40 border-white/[0.08] min-h-[100px] resize-none rounded-xl',
              'focus-visible:ring-primary/40 focus-visible:border-primary/30',
              'placeholder:text-muted-foreground/40 text-sm transition-all duration-300 pr-16'
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            maxLength={500}
          />
          <div
            className={cn(
              'absolute bottom-3 right-3 text-[10px] font-mono transition-colors',
              input.length > 450 ? 'text-red-400/70' : 'text-muted-foreground/30'
            )}
          >
            {input.length}/500
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
        </div>

        {/* Status bar + Send button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {sent ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">
                  Command Received!
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                  {sending ? 'Transmitting...' : 'Ready'}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={sending || !input.trim()}
            className={cn(
              'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500',
              'text-white font-bold shadow-lg shadow-primary/25 px-6 rounded-xl h-10',
              'transition-all active:scale-95 disabled:opacity-40'
            )}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Transmit
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
