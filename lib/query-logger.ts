/**
 * Query Logger - Utility for tracking Supabase queries in development
 *
 * Usage:
 * - Set NEXT_PUBLIC_ENABLE_QUERY_LOGGING=true in .env.local to enable
 * - Or it's automatically enabled in development mode
 * - All queries will be logged to server console with timing information
 */

type QueryOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'COUNT';

interface QueryLog {
  operation: QueryOperation;
  table: string;
  filters?: Record<string, unknown>;
  duration?: number;
  timestamp: string;
  error?: unknown;
  data?: unknown; // Raw data from backend
  rowCount?: number; // Number of rows returned
}

const ENABLE_QUERY_LOGGING =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_ENABLE_QUERY_LOGGING === 'true';

const logs: QueryLog[] = [];

export function logQuery(
  operation: QueryOperation,
  table: string,
  filters?: Record<string, unknown>,
  duration?: number,
  data?: unknown, // Optional: raw data from backend
) {
  if (!ENABLE_QUERY_LOGGING) return;

  const timestamp = new Date().toISOString();
  const filterStr = filters
    ? ` [${Object.entries(filters)
        .map(([k, v]) => {
          // Truncate long values for readability
          const val = JSON.stringify(v);
          return `${k}=${val?.length > 50 ? val.substring(0, 50) + '...' : val}`;
        })
        .join(', ')}]`
    : '';
  const durationStr = duration !== undefined ? ` (${duration}ms)` : '';

  // Calculate row count if data is an array
  const rowCount = Array.isArray(data) ? data.length : data ? 1 : 0;

  const log: QueryLog = {
    operation,
    table,
    filters,
    duration,
    timestamp,
    data,
    rowCount,
  };

  logs.push(log);

  // Keep only last 100 logs to avoid memory issues
  if (logs?.length > 100) {
    logs.shift();
  }

  // Color coding for console
  const emoji = {
    SELECT: '🔍',
    INSERT: '➕',
    UPDATE: '✏️',
    DELETE: '🗑️',
    COUNT: '🔢',
  }[operation];

  // Log basic info
  const rowCountStr =
    rowCount > 0 ? ` → ${rowCount} row${rowCount === 1 ? '' : 's'}` : '';
  console.log(
    `${emoji} [${timestamp}] ${operation} ${table}${filterStr}${durationStr}${rowCountStr}`,
  );

  // Log data if available
  if (data !== undefined && data !== null) {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      // Truncate very long data (more than 2000 chars)
      if (dataStr.length > 2000) {
        console.log(`   📦 Data (truncated, ${dataStr.length} chars):`);
        console.log(dataStr.substring(0, 2000) + '\n   ... (truncated)');
      } else {
        console.log(`   📦 Data:`);
        console.log(dataStr);
      }
    } catch {
      console.log(`   📦 Data (non-serializable):`, data);
    }
  }
}

export function logError(
  operation: QueryOperation,
  table: string,
  error: unknown,
) {
  if (!ENABLE_QUERY_LOGGING) return;

  const timestamp = new Date().toISOString();
  const errorMsg =
    error instanceof Error ? error.message : JSON.stringify(error);

  const log: QueryLog = {
    operation,
    table,
    timestamp,
    error,
  };

  logs.push(log);

  if (logs?.length > 100) {
    logs.shift();
  }

  console.error(`❌ [${timestamp}] ${operation} ${table} - Error: ${errorMsg}`);
}

export function getQueryLogs(): QueryLog[] {
  return [...logs];
}

export function clearQueryLogs(): void {
  logs.length = 0;
}

export function getQueryStats(): {
  total: number;
  byOperation: Record<QueryOperation, number>;
  byTable: Record<string, number>;
  averageDuration: number;
  errors: number;
} {
  const stats = {
    total: logs.length,
    byOperation: {} as Record<QueryOperation, number>,
    byTable: {} as Record<string, number>,
    averageDuration: 0,
    errors: 0,
  };

  let totalDuration = 0;
  let durationCount = 0;

  logs.forEach((log) => {
    // Count by operation
    stats.byOperation[log.operation] =
      (stats.byOperation[log.operation] || 0) + 1;

    // Count by table
    stats.byTable[log.table] = (stats.byTable[log.table] || 0) + 1;

    // Count errors
    if (log.error) {
      stats.errors++;
    }

    // Calculate average duration
    if (log.duration !== undefined) {
      totalDuration += log.duration;
      durationCount++;
    }
  });

  stats.averageDuration =
    durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

  return stats;
}
