import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';
import { ListSpacesToolArgsType } from '../tools/atlassian.spaces.types.js';

/**
 * CLI module for managing Confluence spaces.
 * Provides commands for listing spaces and retrieving space details.
 * All commands require valid Atlassian credentials.
 */

/**
 * Register Confluence Spaces CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program: Command): void {
	const cliLogger = Logger.forContext(
		'cli/atlassian.spaces.cli.ts',
		'register',
	);
	cliLogger.debug('Registering Confluence Spaces CLI commands...');

	registerListSpacesCommand(program);
	registerGetSpaceCommand(program);

	cliLogger.debug('CLI commands registered successfully');
}

/**
 * Register the command for listing Confluence spaces
 * @param program - The Commander program instance
 */
function registerListSpacesCommand(program: Command): void {
	program
		.command('ls-spaces')
		.description(
			'List Confluence spaces accessible to the user, with filtering and pagination.',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence API caps results at 100 items per request.',
			'25',
		)
		.option(
			'-c, --cursor <string>',
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		)
		.option(
			'-t, --type <type>',
			'Filter spaces by type. Options include: "global" (team spaces), "personal" (user spaces), or "archived" (archived spaces). If omitted, returns all types.',
			'global',
		)
		.option(
			'-s, --status <status>',
			'Filter spaces by status. Options include: "current" (active spaces) or "archived" (archived spaces). If omitted, returns spaces with all statuses.',
			'current',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.spaces.cli.ts',
				'ls-spaces',
			);
			try {
				actionLogger.debug('Processing command options:', options);

				// Validate type if provided
				if (
					options.type &&
					!['global', 'personal', 'archived'].includes(options.type)
				) {
					throw new Error(
						'Type must be one of: "global", "personal", or "archived"',
					);
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

				// Validate limit if provided
				if (options.limit) {
					const limit = parseInt(options.limit, 10);
					if (isNaN(limit) || limit <= 0) {
						throw new Error(
							'Invalid --limit value: Must be a positive integer.',
						);
					}
				}

				const filterOptions: ListSpacesToolArgsType = {
					...(options.type && {
						type: options.type as
							| 'global'
							| 'personal'
							| 'archived',
					}),
					...(options.status && {
						status: options.status as 'current' | 'archived',
					}),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
				};

				actionLogger.debug(
					'Fetching spaces with filters:',
					filterOptions,
				);

				const result =
					await atlassianSpacesController.list(filterOptions);

				actionLogger.debug('Successfully retrieved spaces');

				// Print the main content (which now includes pagination information)
				console.log(result.content);
			} catch (error) {
				actionLogger.error('Operation failed:', error);
				handleCliError(error);
			}
		});
}

/**
 * Register the command for retrieving a specific Confluence space
 * @param program - The Commander program instance
 */
function registerGetSpaceCommand(program: Command): void {
	program
		.command('get-space')
		.description(
			'Get detailed information about a specific Confluence space using its key.',
		)
		.requiredOption(
			'-k, --space-key <key>',
			'The key of the Confluence space to retrieve (e.g., "DEV" or "MARKETING"). The space key is a unique identifier for a space, typically a short uppercase code.',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.spaces.cli.ts',
				'get-space',
			);
			try {
				actionLogger.debug('Processing command options:', options);

				// Validate space key format (typically uppercase alphanumeric)
				if (!options.spaceKey.match(/^[A-Za-z0-9_]+$/)) {
					throw new Error(
						'Space key must contain only letters, numbers, and underscores.',
					);
				}

				actionLogger.debug(`Fetching space: ${options.spaceKey}`);

				const result = await atlassianSpacesController.get({
					spaceKey: options.spaceKey,
				});

				// Print the main content (already includes all information)
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});
}

export default { register };
