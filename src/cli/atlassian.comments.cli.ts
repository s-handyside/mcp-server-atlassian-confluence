/**
 * CLI commands for interacting with Confluence comments
 */
import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import { atlassianCommentsController } from '../controllers/atlassian.comments.controller.js';
import { formatPagination } from '../utils/formatter.util.js';
import { DEFAULT_PAGE_SIZE } from '../utils/defaults.util.js';

// Create logger for this CLI module
const logger = Logger.forContext('cli/atlassian.comments.cli.ts');

/**
 * Register comments-related commands with the CLI
 *
 * @param program - Commander program to register commands with
 */
function register(program: Command): void {
	// Register the command to list comments for a page
	program
		.command('ls-page-comments')
		.description('List comments for a Confluence page')
		.requiredOption(
			'--page-id <pageId>',
			'ID of the page to get comments for',
		)
		.option(
			'--limit <limit>',
			'Maximum number of results to return',
			(val) => parseInt(val, 10),
			DEFAULT_PAGE_SIZE,
		)
		.option(
			'--start <start>',
			'Starting point for pagination',
			(val) => parseInt(val, 10),
			0,
		)
		.action(async (options) => {
			const methodLogger = logger.forMethod('ls-page-comments');

			try {
				methodLogger.debug('CLI ls-page-comments', options);

				// Call the controller
				const result =
					await atlassianCommentsController.listPageComments({
						pageId: options.pageId,
						limit: options.limit,
						start: options.start,
						// Use the default format (ADF) for best results
						bodyFormat: 'atlas_doc_format',
					});

				// Output the content
				console.log(result.content);

				// Output pagination information if available
				if (result.pagination) {
					console.log('\n' + formatPagination(result.pagination));
				}
			} catch (error) {
				handleCliError(error);
			}
		});

	logger.debug('Registered Confluence comments CLI commands');
}

export default { register };
