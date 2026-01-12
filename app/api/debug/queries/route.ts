import { NextResponse } from 'next/server';
import { getQueryLogs, getQueryStats, clearQueryLogs } from '@/lib/query-logger';

/**
 * API endpoint to view query logs in development
 * GET /api/debug/queries - Get all query logs
 * DELETE /api/debug/queries - Clear query logs
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 },
    );
  }

  const logs = getQueryLogs();
  const stats = getQueryStats();

  return NextResponse.json({
    logs,
    stats,
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 },
    );
  }

  clearQueryLogs();

  return NextResponse.json({ message: 'Query logs cleared' });
}
