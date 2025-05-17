import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianPagesController from '../controllers/atlassian.pages.controller.js';
import { ListPagesToolArgsType } from '../tools/atlassian.pages.types.js';
import { formatPagination } from '../utils/formatter.util.js';

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
			'Pagination cursor for retrieving the next set of results. Obtain this opaque string from the pagination.nextCursor field of a previous response. Confluence uses cursor-based pagination rather than offset-based pagination.',
		)
		.option(
			'-t, --title <text>',
			'Filter pages by title. IMPORTANT: This performs an EXACT match on the page title, not a partial or contains match. For partial title matching or full-text content search, use the `search` command instead.',
		)
		.option(
			'-S, --space-ids <ids...>',
			'Filter pages by space IDs. Provide one or more space IDs (e.g., "123456" "789012") to only show pages from specific spaces. Use either this or --space-keys, not both together.',
		)
		.option(
			'-k, --space-keys <keys...>',
			'Filter pages by space keys. Provide one or more space keys (e.g., "DEV" "HR" "MARKETING") to only show pages from specific spaces. More user-friendly than space IDs. Use either this or --space-ids, not both together.',
		)
		.option(
			'-s, --status <status>',
			'Filter pages by status. Options include: "current" (published pages), "archived" (archived pages), "trashed" (pages in trash), or "deleted" (permanently deleted). Defaults to "current" if not specified.',
			'current',
		)
		.option(
			'-o, --sort <sort>',
			'Property to sort pages by. Default is "-modified-date" which displays the most recently modified pages first. The "-" prefix indicates descending order. Valid values: "id", "-id", "created-date", "-created-date", "modified-date", "-modified-date", "title", "-title".',
		)
		.option(
			'-p, --parent-id <id>',
			'Filter to show only child pages of the specified parent page ID.',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.pages.cli.ts',
				'ls-pages',
			);
			try {
				actionLogger.debug('Processing command options:', options);

				// Create filter options for controller
				const filterOptions: ListPagesToolArgsType = {
					// Map directly to spaceIds (plural)
					...(options.spaceIds && { spaceIds: options.spaceIds }),
					// Map spaceKeys to spaceKeys (plural)
					...(options.spaceKeys && { spaceKeys: options.spaceKeys }),
					...(options.status && { status: [options.status] }),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
					...(options.title && { title: options.title }),
					...(options.sort && { sort: options.sort }),
					...(options.parentId && { parentId: options.parentId }),
				};

				actionLogger.debug(
					'Fetching pages with filters:',
					filterOptions,
				);

				const result =
					await atlassianPagesController.list(filterOptions);

				actionLogger.debug('Successfully retrieved pages');

				// Print the main content (already includes timestamp footer from formatter)
				console.log(result.content);

				// Conditionally print the standardized pagination footer
				if (result.pagination) {
					// Use the updated formatPagination which takes the object
					console.log('\n' + formatPagination(result.pagination));
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

				// Print the main content (already includes timestamp footer from formatter)
				console.log(result.content);

				// No separate CLI pagination footer needed for 'get' commands
			} catch (error) {
				handleCliError(error);
			}
		});
}

export default { register };
