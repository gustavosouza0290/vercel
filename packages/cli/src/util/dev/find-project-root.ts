import { stat } from 'fs/promises';
import { join, dirname } from 'path';
import { pathExists } from 'fs-extra';

const VERCEL_DIR = '.vercel';

/**
 * Search up the directory tree for a project root.
 * Returns the first PARENT directory that contains:
 *   - .vercel/ (project already initialized)
 *   - vercel.json (explicit project config)
 *   - .git (git repo root)
 *
 * Skips the starting directory since it may be a service subdirectory
 * with its own .vercel/.git that we want to look past.
 *
 * Stops at filesystem boundaries.
 */
export async function findProjectRoot(
  startDir: string
): Promise<string | null> {
  const cwdDev = (await stat(startDir)).dev; // filesystem device ID

  // Start from parent directory - skip startDir since it may be a service
  // subdirectory with its own .vercel/.git
  let dir = dirname(startDir);

  // Walk up the directory tree until we reach the filesystem root
  while (dir !== startDir && dirname(dir) !== dir) {
    // Stop if we've crossed filesystem boundary
    if ((await stat(dir)).dev !== cwdDev) {
      return null;
    }

    // Check for project root indicators
    if (
      (await pathExists(join(dir, VERCEL_DIR))) ||
      (await pathExists(join(dir, 'vercel.json'))) ||
      (await pathExists(join(dir, '.git')))
    ) {
      return dir;
    }

    dir = dirname(dir);
  }

  return null;
}
