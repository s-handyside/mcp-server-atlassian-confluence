import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';
import {
	SpaceStatus,
	SpaceType,
	ListSpacesParams,
} from '../services/vendor.atlassian.spaces.types.js';

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
	const logPrefix = '[src/cli/atlassian.spaces.cli.ts@register]';
	logger.debug(`${logPrefix} Registering Confluence Spaces CLI commands...`);

	registerListSpacesCommand(program);
	registerGetSpaceCommand(program);

	logger.debug(`${logPrefix} CLI commands registered successfully`);
}

/**
 * Register the command for listing Confluence spaces
 * @param program - The Commander program instance
 */
function registerListSpacesCommand(program: Command): void {
	program
		.command('list-spaces')
		.description('List Confluence spaces with optional filtering')
		.option(
			'-t, --type <type>',
			'Filter by type (global, personal, collaboration, knowledge_base)',
		)
		.option('-s, --status <status>', 'Filter by status (current, archived)')
		.option(
			'-l, --limit <number>',
			'Maximum number of spaces to return (1-100). Use this to control the response size. If omitted, defaults to 25.',
		)
		.option(
			'-c, --cursor <cursor>',
			'Pagination cursor for retrieving the next set of results. Obtain this value from the previous response when more results are available.',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.spaces.cli.ts@list-spaces]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				const filterOptions: ListSpacesParams = {
					...(options.type && { type: options.type as SpaceType }),
					...(options.status && {
						status: options.status as SpaceStatus,
					}),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
				};

				logger.debug(
					`${logPrefix} Fetching spaces with filters:`,
					filterOptions,
				);
				const result =
					await atlassianSpacesController.list(filterOptions);
				logger.debug(
					`${logPrefix} Successfully retrieved ${result.content.length} spaces`,
				);

				console.log(result.content);
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
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
			'Get detailed information about a specific Confluence space',
		)
		.argument(
			'<spaceIdOrKey>',
			'ID or key of the space to retrieve (supports both numeric ID and space key)',
		)
		.action(async (spaceIdOrKey: string) => {
			const logPrefix = '[src/cli/atlassian.spaces.cli.ts@get-space]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for space ID/Key: ${spaceIdOrKey}`,
				);
				const result = await atlassianSpacesController.get({
					idOrKey: spaceIdOrKey,
				});
				logger.debug(
					`${logPrefix} Successfully retrieved space details`,
				);

				console.log(result.content);
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
				handleCliError(error);
			}
		});
}

export default { register };
