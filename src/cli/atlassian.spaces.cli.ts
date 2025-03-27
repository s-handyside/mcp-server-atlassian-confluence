import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';
import { ListSpacesOptions } from '../controllers/atlassian.spaces.types.js';
import { formatHeading, formatPagination } from '../utils/formatter.util.js';

/**
 * CLI module for managing Confluence spaces.
 * Provides commands for listing spaces and retrieving space details.
 * All commands require valid Atlassian credentials.
 */

/**
 * Register Confluence Spaces CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program: Command): void {
	const logPrefix = '[src/cli/atlassian.spaces.cli.ts@register]';
	logger.debug(`${logPrefix} Registering Confluence Spaces CLI commands...`);

	registerListSpacesCommand(program);
	registerGetSpaceCommand(program);

	logger.debug(`${logPrefix} CLI commands registered successfully`);
}

/**
 * Register the command for listing Confluence spaces
 * @param program - The Commander program instance
 */
function registerListSpacesCommand(program: Command): void {
	program
		.command('list-spaces')
		.description(
			`List Confluence spaces accessible to the authenticated user.

        PURPOSE: Discover available spaces, find their keys for use in other commands (like searching or listing pages), and get a high-level overview of space metadata.

        Use Case: Useful when you don't know the exact key of a space, or when exploring available spaces. Allows filtering by type (global/personal) and status (current/archived).

        Output: Formatted list including space name, key, ID, type, status, description snippet, and URL. Supports filtering and pagination.
        
        Sorting: By default, spaces are sorted by name in descending order.

        Examples:
  $ mcp-confluence list-spaces --type global --status current
  $ mcp-confluence list-spaces --limit 50
  $ mcp-confluence list-spaces --query "Documentation"`,
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of items to return (1-100)',
			'25',
		)
		.option(
			'-c, --cursor <string>',
			'Pagination cursor for retrieving the next set of results',
		)
		.option(
			'-q, --query <text>',
			'Filter spaces by name, key, or description (simple text search, not query language)',
		)
		.option(
			'-t, --type <type>',
			'Filter by space type: global, personal',
			'global',
		)
		.option(
			'-s, --status <status>',
			'Filter by space status: current, archived',
			'current',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.spaces.cli.ts@list-spaces]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				// Validate type if provided
				if (
					options.type &&
					!['global', 'personal'].includes(options.type)
				) {
					throw new Error(
						'Type must be either "global" or "personal"',
					);
				}

				// Validate status if provided
				if (
					options.status &&
					!['current', 'archived'].includes(options.status)
				) {
					throw new Error(
						'Status must be either "current" or "archived"',
					);
				}

				const filterOptions: ListSpacesOptions = {
					...(options.type && { type: options.type }),
					...(options.status && { status: options.status }),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
					...(options.query && { query: options.query }),
				};

				logger.debug(
					`${logPrefix} Fetching spaces with filters:`,
					filterOptions,
				);

				const result =
					await atlassianSpacesController.list(filterOptions);

				logger.debug(`${logPrefix} Successfully retrieved spaces`);

				// Print the main content
				console.log(formatHeading('Spaces', 2));
				console.log(result.content);

				// Print pagination information if available
				if (result.pagination) {
					console.log(
						'\n' +
							formatPagination(
								result.pagination.count ?? 0,
								result.pagination.hasMore,
								result.pagination.nextCursor,
							),
					);
				}
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
				handleCliError(error);
			}
		});
}

/**
 * Register the command for retrieving a specific Confluence space
 * @param program - The Commander program instance
 */
function registerGetSpaceCommand(program: Command): void {
	program
		.command('get-space')
		.description(
			`Get detailed information about a specific Confluence space using its key.

        PURPOSE: Retrieve comprehensive details for a *known* space, including its ID, name, description, labels, and homepage content snippet. Requires the space key.

        Use Case: Useful when you have a specific space key (often obtained via 'list-spaces') and need its full metadata or homepage overview.

        Output: Formatted details of the specified space, including a snippet of its homepage content. Fetches all available details by default.

        Examples:
  $ mcp-confluence get-space --space DEV`,
		)
		.requiredOption(
			'--space <key>',
			'Key of the space to retrieve (e.g., DEV, MARKETING)',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.spaces.cli.ts@get-space]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for space key: ${options.space}`,
				);

				// Validate that the space key is a proper Confluence space key
				// Space keys should be alphanumeric with no special characters except underscore
				if (!options.space.match(/^[A-Za-z0-9_]+$/)) {
					throw new Error(
						'Space key must contain only letters, numbers, and underscores. If you are using a space name, please use the list-spaces command to find the space key first.',
					);
				}

				const result = await atlassianSpacesController.get({
					key: options.space,
				});
				logger.debug(
					`${logPrefix} Successfully retrieved space details`,
				);

				console.log(result.content);
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
				handleCliError(error);
			}
		});
}

export default { register };
