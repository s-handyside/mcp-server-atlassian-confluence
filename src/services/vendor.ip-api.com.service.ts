import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';
import { IPDetail } from './vendor.ip-api.com.type.js';
import {
	createApiError,
	createUnexpectedError,
	McpError,
} from '../utils/error.util.js';

const ENDPOINT = 'http://ip-api.com/json';

async function get(ipAddress?: string): Promise<IPDetail> {
	logger.debug(`[src/services/vendor.ip-api.com.ts@get] Calling the API...`);

	// Get API token from configuration
	const apiToken = config.get('IPAPI_API_TOKEN');

	// Build URL with token if available
	let url = `${ENDPOINT}/${ipAddress ?? ''}`;
	if (apiToken) {
		url += `?key=${apiToken}`;
		logger.debug(`[src/services/vendor.ip-api.com.ts@get] Using API token`);
	}

	try {
		const response = await fetch(url);

		// Handle HTTP errors
		if (!response.ok) {
			throw createApiError(
				`IP API request failed: ${response.status} ${response.statusText}`,
				response.status,
			);
		}

		const data = (await response.json()) as {
			status: string;
			message?: string;
		};

		// Handle API-level errors
		if (data.status !== 'success') {
			throw createApiError(
				`IP API error: ${data.message || 'Unknown error'}`,
			);
		}

		return data as IPDetail;
	} catch (error) {
		// Rethrow McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Handle fetch errors
		if (error instanceof TypeError) {
			throw createApiError(
				'Network error while contacting IP API',
				undefined,
				error,
			);
		}

		// Handle unexpected errors
		throw createUnexpectedError(
			'Unexpected error while fetching IP data',
			error,
		);
	}
}

export default { get };
