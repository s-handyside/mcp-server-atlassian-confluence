import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import atlassianSearchController from '../controllers/atlassian.search.controller.js';
import { handleCliError } from '../utils/error.util.js';
import { formatPagination } from '../utils/formatter.util.js';

/**
 * CLI module for searching Confluence content.
 * Provides commands for searching content using Confluence Query Language (CQL).
 * All commands require valid Atlassian credentials.
 */

/**
 * Register Confluence Search CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program: Command): void {
	const cliLogger = Logger.forContext(
		'cli/atlassian.search.cli.ts',
		'register',
	);
	cliLogger.debug('Registering Confluence Search CLI commands...');

	registerSearchCommand(program);

	cliLogger.debug('CLI commands registered successfully');
}

/**
 * Register the command for searching Confluence content
 * @param program - The Commander program instance
 */
function registerSearchCommand(program: Command): void {
	program
		.command('search')
		.description(
			`Search for Confluence content (pages, blog posts, attachments, etc.) using CQL (Confluence Query Language).

        PURPOSE: Perform powerful, targeted searches across your entire Confluence instance using the flexible CQL syntax. Find content based on text, labels, space, type, dates, and more.`,
		)
		.option(
			'-q, --cql <query>',
			'Filter content using Confluence Query Language (CQL) syntax (e.g., "text ~ \'project plan\' AND space = DEV")',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of items to return (1-100)',
		)
		.option(
			'-c, --cursor <string>',
			'Pagination cursor for retrieving the next set of results',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.search.cli.ts',
				'search',
			);
			try {
				actionLogger.debug('Processing command options:', {
					...options,
				});

				// Parse limit if provided
				if (options.limit) {
					const limit = parseInt(options.limit, 10);
					if (isNaN(limit) || limit < 1 || limit > 100) {
						throw new Error(
							'Limit must be a number between 1 and 100.',
						);
					}
					options.limit = limit;
				}

				const result = await atlassianSearchController.search(options);
				console.log(result.content);

				if (result.pagination) {
					console.log(
						formatPagination(
							result.pagination.count || 0,
							result.pagination.hasMore,
							result.pagination.nextCursor,
						),
					);
				}
			} catch (error) {
				handleCliError(error);
			}
		});
}

export default { register };
