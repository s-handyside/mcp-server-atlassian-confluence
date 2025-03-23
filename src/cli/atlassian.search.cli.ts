import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import atlassianSearchController from '../controllers/atlassian.search.controller.js';
import { handleCliError } from '../utils/error.util.js';

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
	const logPrefix = '[src/cli/atlassian.search.cli.ts@register]';
	logger.debug(`${logPrefix} Registering Confluence Search CLI commands...`);

	registerSearchCommand(program);

	logger.debug(`${logPrefix} CLI commands registered successfully`);
}

/**
 * Register the command for searching Confluence content
 * @param program - The Commander program instance
 */
function registerSearchCommand(program: Command): void {
	program
		.command('search')
		.description(
			'Search for content in Confluence using Confluence Query Language (CQL)',
		)
		.argument(
			'<cql>',
			'Confluence Query Language (CQL) query to search for',
		)
		.option('-l, --limit <number>', 'Maximum number of results to return')
		.option(
			'-c, --cursor <cursor>',
			'Pagination cursor for retrieving the next set of results',
		)
		.action(async (cql: string, options) => {
			const logPrefix = '[src/cli/atlassian.search.cli.ts@search]';
			try {
				logger.debug(`${logPrefix} Processing command options:`, {
					cql,
					...options,
				});

				const searchOptions = {
					cql,
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
				};

				logger.debug(
					`${logPrefix} Searching with options:`,
					searchOptions,
				);
				const result =
					await atlassianSearchController.search(searchOptions);
				logger.debug(`${logPrefix} Search completed successfully`);

				console.log(result.content);
			} catch (error) {
				logger.error(
					`[src/cli/atlassian.search.cli.ts@handler] Error executing search command`,
					error,
				);
				handleCliError(error);
				process.exit(1);
			}
		});
}

export default { register };
