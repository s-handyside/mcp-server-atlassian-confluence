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
			'List Confluence spaces with optional filtering\n\n' +
				'Retrieves spaces from your Confluence instance with filtering and pagination options.\n\n' +
				'Examples:\n' +
				'  $ list-spaces --type global\n' +
				'  $ list-spaces --limit 50 --status current\n' +
				'  $ list-spaces --query "Documentation"',
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
			'Filter spaces by name, key, or description (text search)',
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
			'Get detailed information about a specific Confluence space\n\n' +
				'Retrieves comprehensive details for a space including metadata, permissions, and content overview.\n\n' +
				'Examples:\n' +
				'  $ get-space DEV',
		)
		.argument(
			'<space-key>',
			'Key of the space to retrieve (e.g., DEV, MARKETING)',
		)
		.action(async (spaceKey: string) => {
			const logPrefix = '[src/cli/atlassian.spaces.cli.ts@get-space]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for space key: ${spaceKey}`,
				);

				// Validate that the space key is a proper Confluence space key
				// Space keys should be alphanumeric with no special characters except underscore
				if (!spaceKey.match(/^[A-Za-z0-9_]+$/)) {
					throw new Error(
						'Space key must contain only letters, numbers, and underscores. If you are using a space name, please use the list-spaces command to find the space key first.',
					);
				}

				const result = await atlassianSpacesController.get({
					key: spaceKey,
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
