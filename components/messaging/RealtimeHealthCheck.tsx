'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { RealtimeStatus } from '@/lib/hooks/useBookingMessagesRealtime';

interface RealtimeHealthCheckProps {
  status: RealtimeStatus;
  error: string | null;
  lastEventAt: Date | null;
  messageCount: number;
  bookingId?: string;
}

/**
 * Development UI to monitor realtime subscription health.
 * Shows connection status, last event time, and message count.
 */
export function RealtimeHealthCheck({
  status,
  error,
  lastEventAt,
  messageCount,
  bookingId,
}: RealtimeHealthCheckProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'subscribed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'subscribing':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'closed':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'subscribed':
        return 'bg-emerald-50 border-emerald-200';
      case 'subscribing':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'closed':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'subscribed':
        return 'Connected';
      case 'subscribing':
        return 'Connecting...';
      case 'error':
        return 'Error';
      case 'closed':
        return 'Disconnected';
      default:
        return 'Idle';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg border p-3 shadow-lg ${getStatusColor()} max-w-sm`}
    >
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold text-slate-900">
              Realtime Status
            </p>
            <span className="text-xs text-slate-600">{getStatusLabel()}</span>
          </div>

          {bookingId && (
            <p className="text-[10px] text-slate-500 font-mono truncate mb-1">
              {bookingId}
            </p>
          )}

          <div className="space-y-0.5 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Messages:</span>
              <span className="font-semibold">{messageCount}</span>
            </div>

            {lastEventAt ? (
              <div className="flex justify-between">
                <span>Last event:</span>
                <span className="font-semibold">
                  {formatDistanceToNow(lastEventAt, { addSuffix: true })}
                </span>
              </div>
            ) : (
              <div className="text-slate-400">No events yet</div>
            )}

            {error && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200">
        <p className="text-[10px] text-slate-500">
          💡 This panel only shows in development
        </p>
      </div>
    </div>
  );
}
