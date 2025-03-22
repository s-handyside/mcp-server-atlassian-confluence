import ipApiService from '../services/vendor.ip-api.com.service.js';
import { logger } from '../utils/logger.util.js';
import { McpError, createUnexpectedError } from '../utils/error.util.js';

async function get(ipAddress?: string) {
	logger.debug(
		`[src/controllers/ipaddress.controller.ts@get] Getting IP address details...`,
	);

	try {
		const ipData = await ipApiService.get(ipAddress);
		logger.debug(
			`[src/controllers/ipaddress.controller.ts@get] Got the response from the service`,
			ipData,
		);
		const lines: string[] = [];
		for (const [key, value] of Object.entries(ipData)) {
			lines.push(`${key}: ${value}`);
		}
		return {
			content: lines.join('\n'),
		};
	} catch (error) {
		// Log the error
		logger.error(
			`[src/controllers/ipaddress.controller.ts@get] Error getting IP details`,
			error,
		);

		// Pass McpErrors through
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap other errors
		throw createUnexpectedError('Failed to get IP address details', error);
	}
}

export default { get };
