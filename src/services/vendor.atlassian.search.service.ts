import { createApiError, createAuthMissingError } from '../utils/error.util.js';
import { Logger } from '../utils/logger.util.js';
import {
	fetchAtlassian,
	getAtlassianCredentials,
} from '../utils/transport.util.js';
import {
	SearchParams,
	SearchResponseSchema,
	SearchResponseType,
} from './vendor.atlassian.search.types.js';
import { z } from 'zod';

/**
 * Base API path for Confluence REST API v2
 * @see https://developer.atlassian.com/cloud/confluence/rest/v2/intro/
 * @constant {string}
 */
const API_PATH = '/wiki/api/v2';

/**
 * Search Confluence content using CQL
 *
 * @param {SearchParams} params - Parameters for the search query
 * @returns {Promise<SearchResponseType>} Promise containing the search results
 * @throws {Error} If Atlassian credentials are missing or API request fails
 */
async function search(params: SearchParams): Promise<SearchResponseType> {
	const serviceLogger = Logger.forContext(
		'services/vendor.atlassian.search.service.ts',
		'search',
	);
	serviceLogger.debug('Searching Confluence with params:', params);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			'Atlassian credentials are required for this operation',
		);
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	// Required CQL query
	queryParams.set('cql', params.cql);

	// Pagination
	if (params.cursor) {
		queryParams.set('cursor', params.cursor);
	}
	if (params.limit) {
		queryParams.set('limit', params.limit.toString());
	}

	// Additional options
	if (params.excerpt) {
		queryParams.set('excerpt', params.excerpt);
	}
	if (params.includeTotalSize !== undefined) {
		queryParams.set(
			'include-total-size',
			params.includeTotalSize.toString(),
		);
	}
	if (params.includeArchivedSpaces !== undefined) {
		queryParams.set(
			'include-archived-spaces',
			params.includeArchivedSpaces.toString(),
		);
	}

	const queryString = queryParams.toString()
		? `?${queryParams.toString()}`
		: '';
	const path = `${API_PATH}/search${queryString}`;

	serviceLogger.debug(`Sending request to: ${path}`);

	try {
		// Get the raw response data from the API
		const rawData = await fetchAtlassian<unknown>(credentials, path);

		// Validate the response data using the Zod schema
		try {
			const validatedData = SearchResponseSchema.parse(rawData);
			serviceLogger.debug(
				`Successfully validated search results for ${validatedData.results.length} items`,
			);
			return validatedData;
		} catch (validationError) {
			if (validationError instanceof z.ZodError) {
				serviceLogger.error(
					'API response validation failed:',
					validationError.format(),
				);
				throw createApiError(
					`API response validation failed: ${validationError.message}`,
					500,
					validationError,
				);
			}
			// Re-throw other errors
			throw validationError;
		}
	} catch (error) {
		serviceLogger.error('Error searching content:', error);
		throw error; // Rethrow to be handled by the error handler util
	}
}

export default { search };
