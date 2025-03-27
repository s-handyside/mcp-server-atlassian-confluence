import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { ControllerResponse } from '../types/common.types.js';
import { ListPagesOptions, PageIdentifier } from './atlassian.pages.types.js';
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
	BodyFormat,
	GetPageByIdParams,
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
 * Lists Confluence pages with pagination and filtering options
 * @param options Options for listing pages
 * @returns Formatted list of pages with pagination information
 */
async function list(
	options: ListPagesOptions = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'list',
	);
	methodLogger.debug('Listing Confluence pages...', options);

	try {
		// Create defaults object with proper typing
		const defaults: Partial<ListPagesOptions> = {
			limit: DEFAULT_PAGE_SIZE,
			sort: '-modified-date',
		};

		// Apply defaults
		const mergedOptions = applyDefaults<ListPagesOptions>(
			options,
			defaults,
		);

		// Map controller options to service parameters
		const serviceParams: ListPagesParams = {
			// Optional filters
			spaceId: mergedOptions.spaceId,
			status: mergedOptions.status,
			// Pagination
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
			// Sort order
			sort: mergedOptions.sort,
		};

		const pagesData = await atlassianPagesService.list(serviceParams);
		methodLogger.debug(`Retrieved ${pagesData.results?.length || 0} pages`);

		// Extract pagination information
		const pagination = extractPaginationInfo(
			pagesData,
			PaginationType.CURSOR,
		);

		// Extract the base URL from response links
		const baseUrl = pagesData._links?.base || '';

		// Format the pages data for display
		const formattedPages = formatPagesList(
			pagesData.results || [],
			baseUrl,
		);

		return {
			content: formattedPages,
			pagination,
		};
	} catch (error) {
		handleControllerError(error, {
			entityType: 'Pages',
			operation: 'listing',
			source: 'controllers/atlassian.pages.controller.ts@list',
			additionalInfo: { options },
		});
	}
}

/**
 * Gets details of a specific Confluence page by ID
 * @param identifier The page identifier containing ID
 * @returns Formatted page details
 */
async function get(identifier: PageIdentifier): Promise<ControllerResponse> {
	const { id } = identifier;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'get',
	);

	methodLogger.debug(`Getting Confluence page by ID: ${id}...`);

	try {
		// Create defaults object with proper typing for page details
		const defaults = {
			bodyFormat: PAGE_DEFAULTS.BODY_FORMAT as BodyFormat,
			includeLabels: PAGE_DEFAULTS.INCLUDE_LABELS,
			includeProperties: PAGE_DEFAULTS.INCLUDE_PROPERTIES,
			includeWebResources: PAGE_DEFAULTS.INCLUDE_WEBRESOURCES,
			includeCollaborators: PAGE_DEFAULTS.INCLUDE_COLLABORATORS,
			includeVersion: PAGE_DEFAULTS.INCLUDE_VERSION,
		};

		// Map controller options to service parameters
		const params: GetPageByIdParams = defaults;

		methodLogger.debug('Using service params:', params);

		// Get page data from the API
		const pageData = await atlassianPagesService.get(id, params);

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
		handleControllerError(error, {
			entityType: 'Page',
			entityId: id,
			operation: 'retrieving',
			source: 'controllers/atlassian.pages.controller.ts@get',
		});
	}
}

export default { list, get };
