import chalk from 'chalk';
import type Client from '../../util/client';
import { parseArguments } from '../../util/get-args';
import { getFlagsSpecification } from '../../util/get-flags-specification';
import { printError } from '../../util/error';
import { getLinkedProject } from '../../util/projects/link';
import { getCommandName } from '../../util/pkg-name';
import output from '../../output-manager';
import type { Command } from '../help';
import type {
  RoutingRule,
  RouteType,
  RouteVersion,
} from '../../util/routes/types';

export interface ParsedSubcommand {
  args: string[];
  flags: { [key: string]: any };
}

export async function parseSubcommandArgs(
  argv: string[],
  command: Command
): Promise<ParsedSubcommand | number> {
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(command.options);

  try {
    // @ts-expect-error - TypeScript complains about the flags specification type
    parsedArgs = parseArguments(argv, flagsSpecification);
  } catch (err) {
    printError(err);
    return 1;
  }

  return parsedArgs;
}

export async function ensureProjectLink(client: Client) {
  const link = await getLinkedProject(client);

  if (link.status === 'error') {
    return link.exitCode;
  } else if (link.status === 'not_linked') {
    output.error(
      `Your codebase isn't linked to a project on Vercel. Run ${getCommandName('link')} to begin.`
    );
    return 1;
  }

  client.config.currentTeam =
    link.org.type === 'team' ? link.org.id : undefined;

  return link;
}

export async function confirmAction(
  client: Client,
  skipConfirmation: boolean,
  message: string,
  details?: string
): Promise<boolean> {
  if (skipConfirmation) return true;

  if (details) {
    output.print(`  ${details}\n`);
  }

  return await client.input.confirm(message, false);
}

export function validateRequiredArgs(
  args: string[],
  required: string[]
): string | null {
  for (let i = 0; i < required.length; i++) {
    if (!args[i]) {
      return `Missing required argument: ${required[i]}`;
    }
  }
  return null;
}

/**
 * Print a summary of route changes for diff display.
 * Shows route name, type, and change action (added/deleted/modified/reordered).
 */
export function printDiffSummary(routes: RoutingRule[], maxDisplay = 10): void {
  const displayRoutes = routes.slice(0, maxDisplay);

  for (const route of displayRoutes) {
    const symbol = getDiffSymbol(route);
    const label = getDiffLabel(route);
    const routeType = getPrimaryRouteType(route);

    output.print(
      `  ${symbol} ${route.name}${routeType ? ` ${chalk.gray(`(${routeType})`)}` : ''} ${chalk.gray(`- ${label}`)}\n`
    );
  }

  if (routes.length > maxDisplay) {
    output.print(
      chalk.gray(`\n  ... and ${routes.length - maxDisplay} more changes\n`)
    );
  }
}

/**
 * Get the colored symbol for a diff action.
 */
export function getDiffSymbol(route: RoutingRule): string {
  if (route.action === '+') return chalk.green('+');
  if (route.action === '-') return chalk.red('-');
  return chalk.yellow('~');
}

/**
 * Get the human-readable label for a diff action.
 * Distinguishes between reordered and content-modified routes.
 */
export function getDiffLabel(route: RoutingRule): string {
  if (route.action === '+') return 'Added';
  if (route.action === '-') return 'Deleted';

  // Check if it's a reorder vs content modification
  const isReordered =
    route.previousIndex !== undefined && route.newIndex !== undefined;

  if (isReordered) {
    return `Reordered (${route.previousIndex! + 1} → ${route.newIndex! + 1})`;
  }

  return 'Modified';
}

/**
 * Get the primary route type label for display.
 */
export function getPrimaryRouteType(route: RoutingRule): string | null {
  const types = route.routeTypes ?? [];
  if (types.length === 0) return null;

  const typeLabels: Record<RouteType, string> = {
    header: 'Header',
    rewrite: 'Rewrite',
    redirect: 'Redirect',
    terminate: 'Terminate',
    transform: 'Transform',
  };

  return typeLabels[types[0]] ?? null;
}

/**
 * Find a version by ID, supporting partial ID matching.
 * Returns the matched version or an error message.
 */
export function findVersionById(
  versions: RouteVersion[],
  identifier: string
):
  | { version: RouteVersion; error?: undefined }
  | { version?: undefined; error: string } {
  const matchingVersions = versions.filter(v => v.id.startsWith(identifier));

  if (matchingVersions.length === 0) {
    return {
      error: `Version "${identifier}" not found. Run ${chalk.cyan(
        getCommandName('routes list-versions')
      )} to see available versions.`,
    };
  }

  if (matchingVersions.length > 1) {
    return {
      error: `Multiple versions match "${identifier}". Please provide a more specific ID:\n${matchingVersions
        .map(v => `  ${v.id}`)
        .join('\n')}`,
    };
  }

  return { version: matchingVersions[0] };
}
