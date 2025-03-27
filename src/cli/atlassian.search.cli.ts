import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import atlassianSearchController from '../controllers/atlassian.search.controller.js';
import { handleCliError } from '../utils/error.util.js';
import { formatHeading, formatPagination } from '../utils/formatter.util.js';

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

        PURPOSE: Perform powerful, targeted searches across your entire Confluence instance using the flexible CQL syntax. Find content based on text, labels, space, type, dates, and more.

        Use Case: Ideal for complex searches, finding specific attachments, or querying content across multiple spaces when 'list-pages' is too limited.

        Output: Formatted list of search results including title, type, space, content snippet (excerpt), and URL. Supports pagination.

        Examples:
  $ mcp-confluence search --cql "space = TEAM AND title ~ Project"
  $ mcp-confluence search --cql "type = page AND label = documentation ORDER BY lastModified DESC" --limit 50
  $ mcp-confluence search --cql "text ~ 'security review' AND type = attachment" --cursor "next-cursor-value"`,
		)
		.requiredOption(
			'-q, --cql <cql>',
			'Filter content using Confluence Query Language (CQL) syntax',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of results to return (1-100). Use this to control the response size. If omitted, defaults to 25.',
		)
		.option(
			'-c, --cursor <cursor>',
			'Pagination cursor for retrieving the next set of results. Obtain this value from the previous response when more results are available.',
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

				// Validate CQL query
				if (!options.cql || options.cql.trim() === '') {
					throw new Error(
						'CQL query must not be empty. Please provide a valid Confluence Query Language (CQL) query.',
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

				const searchOptions = {
					cql: options.cql,
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
				};

				actionLogger.debug('Searching with options:', searchOptions);
				const result =
					await atlassianSearchController.search(searchOptions);
				actionLogger.debug('Search completed successfully');

				// Print the main content
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
				actionLogger.error('Error executing search command', error);
				handleCliError(error);
				process.exit(1);
			}
		});
}

export default { register };
