import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianSearchController from '../controllers/atlassian.search.controller.js';
import { formatHeading, formatPagination } from '../utils/formatter.util.js';
import { SearchToolArgsType } from '../tools/atlassian.search.types.js';

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
			'Search Confluence content using CQL (Confluence Query Language), with pagination.',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence search API caps results at 100 items per request.',
			'25',
		)
		.option(
			'-c, --cursor <string>',
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		)
		.option(
			'-q, --cql <cql>',
			'Optional: Full CQL query for advanced filtering. Combines with other options via AND.',
		)
		.option(
			'-t, --title <text>',
			'Optional: Filter by text contained in the title.',
		)
		.option(
			'-k, --space-key <key>',
			'Optional: Filter by space key (e.g., "DEV").',
		)
		.option(
			'--label <labels...>',
			'Optional: Filter by one or more labels (requires content to have ALL specified labels).',
		)
		.option(
			'--type <type>',
			'Optional: Filter by content type (page or blogpost).',
			(value) => {
				if (!['page', 'blogpost'].includes(value)) {
					throw new Error('Type must be either "page" or "blogpost"');
				}
				return value;
			},
		)
		.option(
			'-s, --query <text>',
			'Optional: Simple free-text search (maps to CQL text ~ "<text>").',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.search.cli.ts',
				'search',
			);
			try {
				actionLogger.debug('Processing command options:', options);

				// Validate limit if provided
				if (options.limit) {
					const limit = parseInt(options.limit, 10);
					if (isNaN(limit) || limit <= 0) {
						throw new Error(
							'Invalid --limit value: Must be a positive integer.',
						);
					}
				}

				const searchOptions: SearchToolArgsType = {
					...(options.cql && { cql: options.cql }),
					...(options.title && { title: options.title }),
					...(options.spaceKey && { spaceKey: options.spaceKey }),
					...(options.label && { labels: options.label }),
					...(options.type && {
						contentType: options.type as 'page' | 'blogpost',
					}),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
					...(options.query && { query: options.query }),
				};

				actionLogger.debug(
					'Executing search with options:',
					searchOptions,
				);

				const result =
					await atlassianSearchController.search(searchOptions);

				actionLogger.debug('Successfully received search results');

				// Print the executed CQL if available in metadata
				if (result.metadata?.executedCql) {
					console.log(formatHeading('Executed CQL Query', 3));
					console.log('`' + result.metadata.executedCql + '`\n');
				}

				console.log(formatHeading('Search Results', 2));
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

export default { register };
