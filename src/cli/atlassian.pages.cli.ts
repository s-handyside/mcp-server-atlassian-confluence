import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianPagesController from '../controllers/atlassian.pages.controller.js';
import { ListPagesOptions } from '../controllers/atlassian.pages.types.js';
import { ContentStatus } from '../services/vendor.atlassian.pages.types.js';
import { formatHeading, formatPagination } from '../utils/formatter.util.js';

/**
 * CLI module for managing Confluence pages.
 * Provides commands for listing pages and retrieving page details.
 * All commands require valid Atlassian credentials.
 */

/**
 * Register Confluence Pages CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program: Command): void {
	const logPrefix = '[src/cli/atlassian.pages.cli.ts@register]';
	logger.debug(`${logPrefix} Registering Confluence Pages CLI commands...`);

	registerListPagesCommand(program);
	registerGetPageCommand(program);

	logger.debug(`${logPrefix} CLI commands registered successfully`);
}

/**
 * Register the command for listing Confluence pages
 * @param program - The Commander program instance
 */
function registerListPagesCommand(program: Command): void {
	program
		.command('list-pages')
		.description(
			'List Confluence pages with optional filtering\n\n' +
				'Retrieves pages from your Confluence instance with filtering and pagination options.\n\n' +
				'Examples:\n' +
				'  $ list-pages --space-id 59114294 --status current\n' +
				'  $ list-pages --limit 50 --query "title:Project"\n' +
				'  $ list-pages --space-id 59114294 --query "label:documentation"\n\n' +
				'Note: Space ID must be numeric. Use list-spaces to find the ID if you only have the key.',
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
			'Filter pages by title, content, or labels (simple text search, not query language)',
		)
		.option('--space-id <id>', 'Filter by space ID (must be numeric)')
		.option(
			'-s, --status <status>',
			'Filter by page status: current, archived',
			'current',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@list-pages]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				// Validate space ID if provided
				if (options.spaceId && !/^\d+$/.test(options.spaceId)) {
					throw new Error(
						'Invalid --space-id: Must be a numeric space ID. Use list-spaces to find the ID if you only have the key.',
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

				const filterOptions: ListPagesOptions = {
					...(options.spaceId && {
						spaceId: [options.spaceId],
					}),
					...(options.status && {
						status: [options.status as ContentStatus],
					}),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
					...(options.query && { query: options.query }),
				};

				logger.debug(
					`${logPrefix} Fetching pages with filters:`,
					filterOptions,
				);

				const result =
					await atlassianPagesController.list(filterOptions);

				logger.debug(
					`${logPrefix} Successfully retrieved ${
						result.pagination?.count || 'all'
					} pages`,
				);

				// Print the main content
				console.log(formatHeading('Pages', 2));
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
 * Register the command for retrieving a specific Confluence page
 * @param program - The Commander program instance
 */
function registerGetPageCommand(program: Command): void {
	program
		.command('get-page')
		.description(
			'Get detailed information about a specific Confluence page\n\n' +
				'Retrieves comprehensive details for a page including content, version history, and relationships.\n\n' +
				'Examples:\n' +
				'  $ get-page --page 123456',
		)
		.requiredOption('--page <id>', 'ID of the page to retrieve (numeric)')
		.option(
			'-f, --body-format <format>',
			'Format for the body content (storage, view, editor). Defaults to view.',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@get-page]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for page ID: ${options.page}`,
				);

				// Validate that the page ID is a proper Confluence ID (numeric)
				const pageId = options.page;
				if (!pageId.match(/^\d+$/)) {
					throw new Error(
						'Page ID must be a numeric string. If you are using a page title or key, please use the search command to find the page ID first.',
					);
				}

				const result = await atlassianPagesController.get({
					id: pageId,
				});

				logger.debug(
					`${logPrefix} Successfully retrieved page details`,
				);

				console.log(result.content);
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
				handleCliError(error);
			}
		});
}

export default { register };
