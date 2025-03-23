import atlassianPagesService from '../services/vendor.atlassian.pages.service.js';
import { logger } from '../utils/logger.util.js';
import { BodyFormat } from '../services/vendor.atlassian.pages.types.js';
import {
	ListPagesOptions,
	GetPageOptions,
	ControllerResponse,
} from './atlassian.pages.type.js';
import { McpError, createUnexpectedError } from '../utils/error.util.js';
import {
	formatPagesList,
	formatPageDetails,
} from './atlassian.pages.formatter.js';

/**
 * Controller for managing Confluence pages.
 * Provides functionality for listing pages and retrieving page details.
 */

/**
 * List Confluence pages with optional filtering
 * @param options - Optional filter options for the pages list
 * @param options.spaceId - Filter by space ID
 * @param options.status - Filter by page status
 * @param options.limit - Maximum number of pages to return
 * @param options.cursor - Pagination cursor for retrieving the next set of results
 * @returns Promise with formatted page list content and pagination information
 */
async function list(
	options: ListPagesOptions = {},
): Promise<ControllerResponse> {
	logger.debug(
		`[src/controllers/atlassian.pages.controller.ts@list] Listing Confluence pages...`,
		options,
	);

	try {
		// Set default filters and hardcoded values
		const filters = {
			// Optional filters with defaults
			spaceId: options.spaceId,
			status: options.status || ['current'],
			limit: options.limit,
			cursor: options.cursor,
			// Hardcoded values for content format
			bodyFormat: 'storage' as BodyFormat,
			includeLabels: true,
			includeProperties: true,
			includeWebresources: true,
			includeCollaborators: true,
			includeVersions: false,
		};

		logger.debug(
			`[src/controllers/atlassian.pages.controller.ts@list] Using filters:`,
			filters,
		);

		const pagesData = await atlassianPagesService.list(filters);
		// Log only the count of pages returned instead of the entire response
		logger.debug(
			`[src/controllers/atlassian.pages.controller.ts@list] Retrieved ${pagesData.results?.length || 0} pages`,
		);

		// Extract pagination information
		let nextCursor: string | undefined;
		if (pagesData._links.next) {
			// Extract cursor from the next URL
			const nextUrl = pagesData._links.next;
			const cursorMatch = nextUrl.match(/cursor=([^&]+)/);
			if (cursorMatch && cursorMatch[1]) {
				nextCursor = decodeURIComponent(cursorMatch[1]);
				logger.debug(
					`[src/controllers/atlassian.pages.controller.ts@list] Next cursor: ${nextCursor}`,
				);
			}
		}

		// Format the pages data for display using the formatter
		const formattedPages = formatPagesList(pagesData.results, nextCursor);

		return {
			content: formattedPages,
			pagination: {
				nextCursor,
				hasMore: !!nextCursor,
			},
		};
	} catch (error) {
		logger.error(
			`[src/controllers/atlassian.pages.controller.ts@list] Error listing pages`,
			error,
		);

		// Pass through McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap other errors
		throw createUnexpectedError(
			`Error listing Confluence pages: ${error instanceof Error ? error.message : String(error)}`,
			error,
		);
	}
}

/**
 * Get details of a specific Confluence page
 * @param id - The ID of the page to retrieve
 * @param options - Optional parameters for the request
 * @returns Promise with formatted page details content
 * @throws Error if page retrieval fails
 */
async function get(
	id: string,
	options: GetPageOptions = {},
): Promise<ControllerResponse> {
	logger.debug(
		`[src/controllers/atlassian.pages.controller.ts@get] Getting Confluence page with ID: ${id}...`,
		options,
	);

	try {
		// Hardcoded parameters for the service call
		const params = {
			// Content format
			bodyFormat: 'view' as BodyFormat,
			// Include additional data
			includeLabels: true,
			includeProperties: true,
			includeWebresources: true,
			includeCollaborators: true,
			includeVersions: false,
		};

		logger.debug(
			`[src/controllers/atlassian.pages.controller.ts@get] Using params:`,
			params,
		);

		const pageData = await atlassianPagesService.get(id, params);
		// Log only key information instead of the entire response
		logger.debug(
			`[src/controllers/atlassian.pages.controller.ts@get] Retrieved page: ${pageData.title} (${pageData.id})`,
		);

		// Format the page data for display using the formatter
		const formattedPage = formatPageDetails(pageData);

		return {
			content: formattedPage,
		};
	} catch (error) {
		logger.error(
			`[src/controllers/atlassian.pages.controller.ts@get] Error getting page`,
			error,
		);

		// Pass through McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap other errors
		throw createUnexpectedError(
			`Error getting Confluence page: ${error instanceof Error ? error.message : String(error)}`,
			error,
		);
	}
}

export default { list, get };
