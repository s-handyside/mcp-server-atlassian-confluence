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
			`List Confluence pages, optionally filtering by space ID(s), status, or title/content/label query.

        PURPOSE: Discover pages within specific spaces or across your instance based on status or simple text matching. Useful for finding page IDs for 'get-page'.

        Use Case: Use this for browsing pages in a known space, finding archived pages, or doing simple text searches within titles/labels. For complex content searches, use the 'search' command with CQL.

        Output: Formatted list of pages including ID, title, space ID, status, author, creation date, and URL. Supports filtering and pagination.

        Sorting: By default, pages are sorted by modified date in descending order (most recently modified first).

        Note: --space-id requires numeric IDs. Use 'list-spaces' or 'get-space' first if you only have the space key.

        Examples:
  $ mcp-confluence list-pages --space-id 123456 --status current
  $ mcp-confluence list-pages --limit 50 --query "Project"
  $ mcp-confluence list-pages --space-id 123456,789012 --query "documentation"
  $ mcp-confluence list-pages --cursor "next-cursor-value"`,
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
		.option(
			'--space-id <id1,id2,...>',
			'Filter by space IDs (comma-separated list of numeric IDs)',
		)
		.option(
			'-s, --status <status>',
			'Filter by page status: current, archived',
			'current',
		)
		.option(
			'--sort <sort>',
			'Sort order for pages (e.g., "title", "-modified-date"). Default is "-modified-date" (most recently modified first).',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@list-pages]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				// Validate space ID if provided
				if (options.spaceId) {
					const spaceIds = options.spaceId
						.split(',')
						.map((id: string) => id.trim());
					for (const id of spaceIds) {
						if (!/^\d+$/.test(id)) {
							throw new Error(
								'Invalid --space-id: Must contain only numeric space IDs. Use list-spaces to find the IDs if you only have the keys.',
							);
						}
					}
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
						spaceId: options.spaceId
							.split(',')
							.map((id: string) => id.trim()),
					}),
					...(options.status && {
						status: [options.status as ContentStatus],
					}),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
					...(options.query && { query: options.query }),
					...(options.sort && { sort: options.sort }),
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
			`Get detailed information about a specific Confluence page using its numeric ID.

        PURPOSE: Retrieve the full content (converted to Markdown) and comprehensive metadata for a *known* page, including labels, properties, and links. Requires the numeric page ID.

        Use Case: Essential for reading, analyzing, or summarizing the content of a specific page identified via 'list-pages' or 'search'.

        Output: Formatted details of the specified page, including its full body content in Markdown. Fetches all available details by default.

        Examples:
  $ mcp-confluence get-page --page 123456`,
		)
		.requiredOption('--page <id>', 'ID of the page to retrieve (numeric)')
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
