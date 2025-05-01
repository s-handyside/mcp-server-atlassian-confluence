import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianPagesController from '../controllers/atlassian.pages.controller.js';
import { ListPagesOptions } from '../controllers/atlassian.pages.types.js';
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
	const cliLogger = Logger.forContext(
		'cli/atlassian.pages.cli.ts',
		'register',
	);
	cliLogger.debug('Registering Confluence Pages CLI commands...');

	registerListPagesCommand(program);
	registerGetPageCommand(program);

	cliLogger.debug('CLI commands registered successfully');
}

/**
 * Register the command for listing Confluence pages
 * @param program - The Commander program instance
 */
function registerListPagesCommand(program: Command): void {
	program
		.command('ls-pages')
		.description(
			'List Confluence pages, with filtering, sorting, and pagination.',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of items to return (1-250). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence API caps results at 250 items per request.',
			'25',
		)
		.option(
			'-c, --cursor <string>',
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		)
		.option(
			'-q, --query <text>',
			'Filter pages by title, content, or labels (text search). Use this to narrow down results to specific topics or content.',
		)
		.option(
			'-s, --space-id <ids...>',
			'Filter pages by space IDs. Provide an array of space IDs (e.g., ["123456", "789012"]) to only show pages from specific spaces. Useful when you want to focus on content from particular projects or teams.',
		)
		.option(
			'-S, --status <status>',
			'Filter pages by status. Options include: "current" (published pages), "trashed" (pages in trash), "deleted" (permanently deleted), "draft" (unpublished drafts), "archived" (archived pages), or "historical" (previous versions). Defaults to "current" if not specified. Provide as an array to include multiple statuses.',
			'current',
		)
		.option(
			'--sort <sort>',
			'Property to sort pages by. Default is "-modified-date" which displays the most recently modified pages first. The "-" prefix indicates descending order. Valid values: "id", "-id", "created-date", "-created-date", "modified-date", "-modified-date", "title", "-title".',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.pages.cli.ts',
				'ls-pages',
			);
			try {
				actionLogger.debug('Processing command options:', options);

				// Validate status if provided
				if (
					options.status &&
					!['current', 'archived'].includes(options.status)
				) {
					throw new Error(
						'Status must be either "current" or "archived"',
					);
				}

				// Validate limit if provided
				if (options.limit) {
					const limit = parseInt(options.limit, 10);
					if (isNaN(limit) || limit <= 0) {
						throw new Error(
							'Invalid --limit value: Must be a positive integer.',
						);
					}
				}

				// Create filter options for controller
				const filterOptions: ListPagesOptions = {
					// Map from CLI --space-id flag to the controller's standardized containerId parameter
					...(options.spaceId && { containerId: options.spaceId }),
					...(options.status && { status: [options.status] }),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
					...(options.query && { query: options.query }),
					...(options.sort && { sort: options.sort }),
				};

				actionLogger.debug(
					'Fetching pages with filters:',
					filterOptions,
				);

				const result =
					await atlassianPagesController.list(filterOptions);

				actionLogger.debug('Successfully retrieved pages');

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
				actionLogger.error('Operation failed:', error);
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
			'Get detailed info and content (as Markdown) for a Confluence page by ID.',
		)
		.requiredOption(
			'-p, --page-id <id>',
			'The numeric ID of the Confluence page to retrieve (e.g., "456789"). This is required and must be a valid page ID from your Confluence instance. The page content will be returned in Markdown format for easy reading.',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.pages.cli.ts',
				'get-page',
			);
			try {
				actionLogger.debug('Processing command options:', options);

				// Validate page ID format (numeric)
				if (!options.pageId.match(/^\d+$/)) {
					throw new Error('Page ID must be numeric.');
				}

				actionLogger.debug(`Fetching page: ${options.pageId}`);

				const result = await atlassianPagesController.get({
					pageId: options.pageId,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});
}

export default { register };
