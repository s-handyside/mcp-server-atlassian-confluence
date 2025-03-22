import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';

import ipAddressController from '../controllers/ipaddress.controller.js';

/**
 * Register IP address CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	logger.debug(
		`[src/cli/ipaddress.cli.ts@register] Registering IP address CLI commands...`,
	);

	program
		.command('get-ip-details')
		.description(
			'Get details about a specific IP address or the current device',
		)
		.argument('[ipAddress]', 'IP address to lookup (optional)')
		.action(async (ipAddress?: string) => {
			try {
				logger.debug(
					`[src/cli/ipaddress.cli.ts@get-ip-details] Fetching IP details for ${ipAddress || 'current device'}...`,
				);
				const result = await ipAddressController.get(ipAddress);
				logger.debug(
					`[src/cli/ipaddress.cli.ts@get-ip-details] IP details fetched successfully`,
					result,
				);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});
}

export default { register };
