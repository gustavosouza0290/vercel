import { join } from 'path';
import { unlinkSync } from 'fs';
import { readJSON, outputJSON, pathExists } from 'fs-extra';
import { VERCEL_DIR } from '../projects/link';

const DEV_LOCK_FILE = 'dev.lock';

export interface DevLockFile {
  pid: number;
  port: number;
  startedAt: number; // timestamp
  cwd: string; // absolute path
  version: 1; // for future compat
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0); // Signal 0 checks existence
    return true;
  } catch {
    return false;
  }
}

export async function acquireDevLock(
  projectRoot: string,
  port: number
): Promise<
  { acquired: true } | { acquired: false; existingLock: DevLockFile }
> {
  const lockPath = join(projectRoot, VERCEL_DIR, DEV_LOCK_FILE);

  // Check for existing lock
  if (await pathExists(lockPath)) {
    try {
      const existingLock: DevLockFile = await readJSON(lockPath);

      // Validate lock is still active
      if (isProcessRunning(existingLock.pid)) {
        return { acquired: false, existingLock };
      }
      // Stale lock - process no longer running, continue to acquire
    } catch {
      // Invalid lock file, continue to acquire
    }
  }

  // Write new lock
  const lockData: DevLockFile = {
    pid: process.pid,
    port,
    startedAt: Date.now(),
    cwd: projectRoot,
    version: 1,
  };

  await outputJSON(lockPath, lockData, { spaces: 2 });
  return { acquired: true };
}

export function releaseDevLock(projectRoot: string): void {
  const lockPath = join(projectRoot, VERCEL_DIR, DEV_LOCK_FILE);
  try {
    unlinkSync(lockPath);
  } catch {
    // Ignore errors (file may not exist)
  }
}
