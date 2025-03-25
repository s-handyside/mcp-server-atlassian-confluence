import atlassianPagesService from '../services/vendor.atlassian.pages.service.js';
import { logger } from '../utils/logger.util.js';
import { BodyFormat } from '../services/vendor.atlassian.pages.types.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import {
	ListPagesOptions,
	GetPageOptions,
	ControllerResponse,
	PageIdentifier,
} from './atlassian.pages.type.js';
import { handleControllerError } from '../utils/errorHandler.util.js';
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
	const source = `[src/controllers/atlassian.pages.controller.ts@list]`;
	logger.debug(`${source} Listing Confluence pages...`, options);

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

		logger.debug(`${source} Using filters:`, filters);

		const pagesData = await atlassianPagesService.list(filters);
		// Log only the count of pages returned instead of the entire response
		logger.debug(
			`${source} Retrieved ${pagesData.results?.length || 0} pages`,
		);

		// Extract pagination information using the utility
		const pagination = extractPaginationInfo(
			pagesData,
			PaginationType.CURSOR,
			source,
		);

		// Format the pages data for display using the formatter
		const formattedPages = formatPagesList(
			pagesData.results,
			pagination.nextCursor,
		);

		return {
			content: formattedPages,
			pagination,
		};
	} catch (error) {
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Pages',
			operation: 'listing',
			source: 'src/controllers/atlassian.pages.controller.ts@list',
			additionalInfo: { options },
		});
	}
}

/**
 * Get details of a specific Confluence page
 * @param identifier - Object containing the ID of the page to retrieve
 * @param identifier.id - The ID of the page
 * @param options - Optional parameters for the request
 * @returns Promise with formatted page details content
 * @throws Error if page retrieval fails
 */
async function get(
	identifier: PageIdentifier,
	options: GetPageOptions = {},
): Promise<ControllerResponse> {
	const { id } = identifier;

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
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Page',
			entityId: identifier,
			operation: 'retrieving',
			source: 'src/controllers/atlassian.pages.controller.ts@get',
			additionalInfo: { options },
		});
	}
}

export default { list, get };
