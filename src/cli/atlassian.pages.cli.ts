import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianPagesController from '../controllers/atlassian.pages.controller.js';
import {
	ListPagesOptions,
	GetPageOptions,
} from '../controllers/atlassian.pages.type.js';

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
			'List Confluence pages with optional filtering\n\n  Retrieves pages from your Confluence instance with filtering by space, status, and sorting options.',
		)
		.option(
			'-s, --space-id <id>',
			'Filter by space ID. Use this option to limit results to a specific space.',
		)
		.option(
			'-u, --status <status>',
			'Filter by page status (current, archived).',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of pages to return (1-100). Use this to control the response size. If omitted, defaults to 25.',
		)
		.option(
			'-c, --cursor <cursor>',
			'Pagination cursor for retrieving the next set of results. Obtain this value from the previous response when more results are available.',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@list-pages]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				const filterOptions: ListPagesOptions = {
					...(options.spaceId && {
						spaceId: [options.spaceId],
					}),
					...(options.status && { status: options.status }),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
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

				console.log(result.content);

				// Display pagination information if available
				if (result.pagination?.hasMore) {
					console.log('\n## Pagination');
					console.log(
						`*Showing ${result.pagination.count || ''} items. More results are available.*`,
					);
					console.log(
						`\nTo see more results, use --cursor "${result.pagination.nextCursor}"`,
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
			'Get detailed information about a specific Confluence page\n\n  Retrieves comprehensive details for a page including content, version history, and relationships.',
		)
		.argument('<id>', 'ID of the page to retrieve')
		.option(
			'-f, --body-format <format>',
			'Format for the body content (storage, view, editor). Defaults to view.',
		)
		.option(
			'-l, --include-labels',
			'Include labels associated with the page.',
			false,
		)
		.option(
			'-p, --include-properties',
			'Include properties associated with the page.',
			false,
		)
		.option(
			'-w, --include-webresources',
			'Include web resources associated with the page.',
			false,
		)
		.option(
			'-c, --include-collaborators',
			'Include collaborator information for the page.',
			false,
		)
		.option(
			'-v, --include-version',
			'Include version information for the page.',
			false,
		)
		.action(async (id: string, options) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@get-page]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for page ID: ${id}`,
				);

				const pageOptions: GetPageOptions = {
					...(options.bodyFormat && {
						bodyFormat: options.bodyFormat,
					}),
					...(options.includeLabels && {
						includeLabels: options.includeLabels,
					}),
					...(options.includeProperties && {
						includeProperties: options.includeProperties,
					}),
					...(options.includeWebresources && {
						includeWebresources: options.includeWebresources,
					}),
					...(options.includeCollaborators && {
						includeCollaborators: options.includeCollaborators,
					}),
					...(options.includeVersion && {
						includeVersion: options.includeVersion,
					}),
				};

				const result = await atlassianPagesController.get(
					{ id },
					pageOptions,
				);
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
