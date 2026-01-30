'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Draft {
  id: string;
  filename: string;
  title: string;
  priority: string;
  actionType: string;
  createdAt: string;
  modifiedAt: string;
  preview: string;
}

export default function DraftsView() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts');
      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDrafts();

    // Poll for new drafts every 30 seconds
    const interval = setInterval(fetchDrafts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (draft: Draft) => {
    try {
      const response = await fetch(`/api/tasks/${draft.id}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Approved: ${draft.title}`);
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve task');
    }
  };

  const handleReject = async (draft: Draft) => {
    try {
      const response = await fetch(`/api/tasks/${draft.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected via dashboard' }),
      });

      if (response.ok) {
        toast.success(`Rejected: ${draft.title}`);
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      toast.error('Failed to reject task');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDrafts();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Drafts Awaiting Approval
          </h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800 animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-zinc-800 rounded w-full mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Drafts Awaiting Approval
          {drafts.length > 0 && (
            <Badge variant="outline" className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
              {drafts.length}
            </Badge>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-zinc-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No drafts pending</p>
            <p className="text-sm">New drafts will appear here for your approval</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-medium text-zinc-200">
                    {draft.title}
                  </CardTitle>
                  <Badge className={getPriorityColor(draft.priority)}>
                    {draft.priority === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {draft.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700">
                    {draft.actionType}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(draft.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <p className="text-sm text-zinc-400 line-clamp-3 font-mono">
                  {draft.preview}...
                </p>
              </CardContent>

              <CardFooter className="pt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(draft)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(draft)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
