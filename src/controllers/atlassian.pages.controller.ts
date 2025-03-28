import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { ControllerResponse } from '../types/common.types.js';
import { ListPagesOptions } from './atlassian.pages.types.js';
import {
	formatPageDetails,
	formatPagesList,
} from './atlassian.pages.formatter.js';
import atlassianPagesService from '../services/vendor.atlassian.pages.service.js';
import {
	DEFAULT_PAGE_SIZE,
	PAGE_DEFAULTS,
	applyDefaults,
} from '../utils/defaults.util.js';
import {
	ListPagesParams,
	GetPageByIdParams,
	BodyFormat,
} from '../services/vendor.atlassian.pages.types.js';

/**
 * Controller for managing Confluence pages.
 * Provides functionality for listing pages and retrieving page details.
 */

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.pages.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Confluence pages controller initialized');

/**
 * List pages from Confluence with filtering options
 * @param options - Options for filtering pages
 * @param options.spaceId - Filter by space ID(s)
 * @param options.containerId - Alternative form of spaceId for consistency across services
 * @param options.query - Filter by text in title, content or labels
 * @param options.status - Filter by page status
 * @param options.sort - Sort order for results
 * @param options.limit - Maximum number of pages to return
 * @param options.cursor - Pagination cursor for subsequent requests
 * @returns Promise with formatted pages list content
 * @throws Error if page listing fails
 */
async function list(
	options: ListPagesOptions & { containerId?: string[] } = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'list',
	);
	methodLogger.debug('Listing Confluence pages with options:', options);

	try {
		// Create defaults object with proper typing
		const defaults: Partial<ListPagesOptions> = {
			limit: DEFAULT_PAGE_SIZE,
			sort: '-modified-date',
			status: ['current'],
		};

		// Apply defaults to ensure all standard properties are set
		const mergedOptions = applyDefaults<ListPagesOptions>(
			options,
			defaults,
		);

		// Support containerId (standardized) or spaceId (Confluence-specific)
		const spaceId = options.containerId || options.spaceId;

		// Map controller options to service parameters
		const params: ListPagesParams = {
			...(spaceId && { spaceId }),
			...(mergedOptions.query && { query: mergedOptions.query }),
			...(mergedOptions.status && { status: mergedOptions.status }),
			...(mergedOptions.sort && { sort: mergedOptions.sort }),
			// Additional parameters with defaults
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
			bodyFormat: 'storage',
		};

		methodLogger.debug('Using service params:', params);

		// Get pages data from the API
		const pagesData = await atlassianPagesService.list(params);

		// Log only summary information instead of the entire response
		methodLogger.debug(
			`Retrieved ${pagesData.results.length} pages. Has more: ${pagesData._links?.next ? 'yes' : 'no'}`,
		);

		// The formatPagesList function expects a pagesData parameter with results
		// Extract the nextCursor from the links
		const nextCursor = pagesData._links?.next?.split('cursor=')[1] || '';
		const formattedPages = formatPagesList(pagesData.results);

		return {
			content: formattedPages,
			pagination: {
				count: pagesData.results.length,
				hasMore: !!pagesData._links?.next,
				nextCursor: nextCursor,
			},
		};
	} catch (error) {
		// Use the standardized error handler
		return handleControllerError(error, {
			entityType: 'Pages',
			operation: 'listing',
			source: 'controllers/atlassian.pages.controller.ts@list',
		});
	}
}

/**
 * Get details of a specific Confluence page
 * @param args - Object containing the ID of the page to retrieve
 * @param args.pageId - The ID of the page
 * @returns Promise with formatted page details content
 * @throws Error if page retrieval fails
 */
async function get(args: { pageId: string }): Promise<ControllerResponse> {
	const { pageId } = args;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'get',
	);
	methodLogger.debug(`Getting Confluence page with ID: ${pageId}...`);

	try {
		// Map controller options to service parameters
		const params: GetPageByIdParams = {
			bodyFormat: PAGE_DEFAULTS.BODY_FORMAT as BodyFormat,
			includeLabels: PAGE_DEFAULTS.INCLUDE_LABELS,
			includeProperties: PAGE_DEFAULTS.INCLUDE_PROPERTIES,
			includeWebresources: PAGE_DEFAULTS.INCLUDE_WEBRESOURCES,
			includeCollaborators: PAGE_DEFAULTS.INCLUDE_COLLABORATORS,
			includeVersion: PAGE_DEFAULTS.INCLUDE_VERSION,
		};

		methodLogger.debug('Using service params:', params);

		// Get page data from the API
		const pageData = await atlassianPagesService.get(pageId, params);

		// Log only key information instead of the entire response
		methodLogger.debug(
			`Retrieved page: ${pageData.title} (${pageData.id})`,
		);

		// Format the page data for display
		const formattedPage = formatPageDetails(pageData);

		return {
			content: formattedPage,
		};
	} catch (error) {
		return handleControllerError(error, {
			entityType: 'Page',
			entityId: pageId,
			operation: 'retrieving',
			source: 'controllers/atlassian.pages.controller.ts@get',
		});
	}
}

export default { list, get };
