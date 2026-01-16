'use client';

import { useEffect } from 'react';

type ClientDebugProps = {
  label: string;
  payload: Record<string, unknown>;
};

/**
 * Tiny client-side logger to surface server debug info in the browser console.
 * Only renders a null span.
 */
export function ClientDebug({ label, payload }: ClientDebugProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`[${label}]`, payload);
  }, [label, payload]);

  return null;
}
