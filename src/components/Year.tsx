'use client';

import { useSyncExternalStore } from 'react';

/** Current year, rendered on the client so the statically built page never goes stale. */
export default function Year() {
  return <>{useSyncExternalStore(() => () => {}, () => new Date().getFullYear(), () => 2026)}</>;
}
