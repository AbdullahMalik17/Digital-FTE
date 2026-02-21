'use client';

import { useState } from 'react';
import { submitTask } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgentChat() {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sending, setSending] = useState(false);

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
  };

  return (
    <div className="glass-card p-6 space-y-6 group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl animate-pulse">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-foreground tracking-tight">Direct Command</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Neural Interface Active</p>
          </div>
        </div>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[140px] h-9 bg-background/50 border-white/5 backdrop-blur-md hover:bg-background/80 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="urgent">Urgent 🚨</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative">
        <Textarea 
          placeholder="What should Abdullah Junior execute next?"
          className="bg-background/30 border-white/5 min-h-[120px] resize-none pr-4 rounded-xl focus-visible:ring-primary/30 focus-visible:border-primary/30 placeholder:text-muted-foreground/50 transition-all duration-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">↵</span> Enter
          </kbd>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Ready for transmission</span>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={sending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 px-8 rounded-xl h-11 transition-all active:scale-95"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Transmitting...
            </span>
          ) : 'Transmit Order'}
        </Button>
      </div>
    </div>
  );
}
