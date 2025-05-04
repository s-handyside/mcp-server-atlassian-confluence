import { createApiError, createAuthMissingError } from '../utils/error.util.js';
import { Logger } from '../utils/logger.util.js';
import {
	fetchAtlassian,
	getAtlassianCredentials,
} from '../utils/transport.util.js';
import {
	PageDetailedSchema,
	PagesResponseSchema,
	ListPagesParams,
	GetPageByIdParams,
} from './vendor.atlassian.pages.types.js';
import { z } from 'zod';

/**
 * Base API path for Confluence REST API v2
 * @see https://developer.atlassian.com/cloud/confluence/rest/v2/intro/
 * @constant {string}
 */
const API_PATH = '/wiki/api/v2';

/**
 * @namespace VendorAtlassianPagesService
 * @description Service for interacting with Confluence Pages API.
 * Provides methods for listing pages and retrieving page details.
 * All methods require valid Atlassian credentials configured in the environment.
 */

/**
 * List Confluence pages with optional filtering and pagination
 *
 * Retrieves a list of pages from Confluence with support for various filters
 * and pagination options. Pages can be filtered by space, status, parent, etc.
 *
 * @async
 * @memberof VendorAtlassianPagesService
 * @param {ListPagesParams} params - Optional parameters to customize the request
 * @returns {Promise<PagesResponseType>} Promise containing the pages response with results and pagination info
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // List pages from a specific space
 * const response = await list({
 *   spaceId: ['123'],
 *   status: ['current'],
 *   limit: 25
 * });
 */
async function list(
	params: ListPagesParams,
): Promise<z.infer<typeof PagesResponseSchema>> {
	const serviceLogger = Logger.forContext(
		'services/vendor.atlassian.pages.service.ts',
		'list',
	);
	serviceLogger.debug('Listing Confluence pages with params:', params);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			'Atlassian credentials are required for this operation',
		);
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	// Content filters
	if (params.spaceId?.length) {
		queryParams.set('space-id', params.spaceId.join(','));
	}
	if (params.title) {
		queryParams.set('title', params.title);
	}
	if (params.status?.length) {
		queryParams.set('status', params.status.join(','));
	}
	if (params.query) {
		queryParams.set('query', params.query);
	}

	// Content format options
	if (params.bodyFormat) {
		queryParams.set('body-format', params.bodyFormat);
	}

	// Sort order
	if (params.sort) {
		queryParams.set('sort', params.sort);
	}

	// Pagination
	if (params.cursor) {
		queryParams.set('cursor', params.cursor);
	}
	if (params.limit) {
		queryParams.set('limit', params.limit.toString());
	}

	const queryString = queryParams.toString()
		? `?${queryParams.toString()}`
		: '';
	const path = `${API_PATH}/pages${queryString}`;

	serviceLogger.debug(`Sending request to: ${path}`);

	try {
		// Get the raw response data from the API
		const rawData = await fetchAtlassian<unknown>(credentials, path);

		// Validate the response data using the Zod schema
		try {
			const validatedData = PagesResponseSchema.parse(rawData);
			serviceLogger.debug(
				`Successfully validated pages list for ${validatedData.results.length} items`,
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
		serviceLogger.error('Error fetching pages:', error);
		throw error; // Rethrow to be handled by the error handler util
	}
}

/**
 * Get detailed information about a specific Confluence page
 *
 * Retrieves comprehensive details about a single page, including content,
 * metadata, and optional components like labels, properties, and versions.
 *
 * @async
 * @memberof VendorAtlassianPagesService
 * @param {string} id - The ID of the page to retrieve
 * @param {GetPageByIdParams} params - Optional parameters to customize the response
 * @returns {Promise<PageDetailedSchemaType>} Promise containing the detailed page information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get page details with labels and versions
 * const page = await get('123', {
 *   bodyFormat: 'storage',
 *   includeLabels: true,
 *   includeVersions: true
 * });
 */
async function get(
	pageId: string,
	params: GetPageByIdParams = {},
): Promise<z.infer<typeof PageDetailedSchema>> {
	const serviceLogger = Logger.forContext(
		'services/vendor.atlassian.pages.service.ts',
		'get',
	);
	serviceLogger.debug(
		`Getting Confluence page with ID: ${pageId}, params:`,
		params,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			'Atlassian credentials are required for this operation',
		);
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	// Content format
	if (params.bodyFormat) {
		queryParams.set('body-format', params.bodyFormat);
	}

	// Version
	if (params.version) {
		queryParams.set('version', params.version.toString());
	}
	if (params.getDraft !== undefined) {
		queryParams.set('get-draft', params.getDraft.toString());
	}

	// Include flags
	if (params.includeAncestors !== undefined) {
		queryParams.set(
			'include-ancestors',
			params.includeAncestors.toString(),
		);
	}
	if (params.includeBody !== undefined) {
		queryParams.set('include-body', params.includeBody.toString());
	}
	if (params.includeChildTypes !== undefined) {
		queryParams.set(
			'include-child-types',
			params.includeChildTypes.toString(),
		);
	}
	if (params.includeCollaborators !== undefined) {
		queryParams.set(
			'include-collaborators',
			params.includeCollaborators.toString(),
		);
	}
	if (params.includeLabels !== undefined) {
		queryParams.set('include-labels', params.includeLabels.toString());
	}
	if (params.includeOperations !== undefined) {
		queryParams.set(
			'include-operations',
			params.includeOperations.toString(),
		);
	}
	if (params.includeVersion !== undefined) {
		queryParams.set('include-version', params.includeVersion.toString());
	}
	if (params.includeWebresources !== undefined) {
		queryParams.set(
			'include-webresources',
			params.includeWebresources.toString(),
		);
	}

	const queryString = queryParams.toString()
		? `?${queryParams.toString()}`
		: '';
	const path = `${API_PATH}/pages/${pageId}${queryString}`;

	serviceLogger.debug(`Sending request to: ${path}`);

	try {
		// Get the raw response data from the API
		const rawData = await fetchAtlassian<unknown>(credentials, path);

		// Validate the response data using the Zod schema
		try {
			const validatedData = PageDetailedSchema.parse(rawData);
			serviceLogger.debug(
				`Successfully validated page details for ID: ${pageId}`,
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
		serviceLogger.error('Error fetching page details:', error);
		throw error; // Rethrow to be handled by the error handler util
	}
}

export default { list, get };
