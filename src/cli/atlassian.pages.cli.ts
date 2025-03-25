import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianPagesController from '../controllers/atlassian.pages.controller.js';
import {
	ContentStatus,
	PageSortOrder,
	ListPagesParams,
} from '../services/vendor.atlassian.pages.types.js';

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
		.description('List Confluence pages with optional filtering')
		.option('-s, --space-id <spaceIds...>', 'Filter pages by space IDs')
		.option(
			'--status <statuses...>',
			'Filter by status (current, trashed, deleted, draft, archived, historical)',
		)
		.option(
			'--sort <order>',
			'Sort by field (id, -id, created-date, -created-date, modified-date, -modified-date, title, -title)',
		)
		.option('-l, --limit <number>', 'Maximum number of pages to return')
		.option(
			'-c, --cursor <cursor>',
			'Pagination cursor for retrieving the next set of results',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@list-pages]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				const filterOptions: ListPagesParams = {
					...(options.spaceId && { spaceId: options.spaceId }),
					...(options.status && {
						status: options.status as ContentStatus[],
					}),
					...(options.sort && {
						sort: options.sort as PageSortOrder,
					}),
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
					`${logPrefix} Successfully retrieved ${result.content.length} pages`,
				);

				console.log(result.content);
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
			'Get detailed information about a specific Confluence page',
		)
		.argument('<id>', 'ID of the page to retrieve')
		.action(async (id: string) => {
			const logPrefix = '[src/cli/atlassian.pages.cli.ts@get-page]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for page ID: ${id}`,
				);
				const result = await atlassianPagesController.get({ id });
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
