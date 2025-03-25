import atlassianPagesService from '../services/vendor.atlassian.pages.service.js';
import { Logger } from '../utils/logger.util.js';
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

// Default values for options
const DEFAULT_PAGE_LIMIT = 25;
const DEFAULT_BODY_FORMAT = 'view' as BodyFormat;
const DEFAULT_INCLUDE_LABELS = true;
const DEFAULT_INCLUDE_PROPERTIES = true;
const DEFAULT_INCLUDE_WEBRESOURCES = true;
const DEFAULT_INCLUDE_COLLABORATORS = true;
const DEFAULT_INCLUDE_VERSION = false;

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.pages.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Confluence pages controller initialized');

/**
 * Lists Confluence pages with pagination and filtering options
 * @param options - Options for listing pages
 * @returns Formatted list of pages with pagination information
 */
async function list(
	options: ListPagesOptions = {
		limit: DEFAULT_PAGE_LIMIT,
	},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'list',
	);
	methodLogger.debug('Listing Confluence pages...', options);

	try {
		// Map controller options to service parameters
		const serviceParams = {
			// Optional filters
			spaceId: options.spaceId,
			status: options.status,
			// Pagination with defaults
			limit: options.limit || DEFAULT_PAGE_LIMIT,
			cursor: options.cursor,
		};

		methodLogger.debug('Using service parameters:', serviceParams);

		const pagesData = await atlassianPagesService.list(serviceParams);
		// Log only the count of pages returned instead of the entire response
		methodLogger.debug(`Retrieved ${pagesData.results?.length || 0} pages`);

		// Extract pagination information using the utility
		const pagination = extractPaginationInfo(
			pagesData,
			PaginationType.CURSOR,
			'controllers/atlassian.pages.controller.ts@list',
		);

		// Format the pages data for display using the formatter
		const formattedPages = formatPagesList(pagesData.results);

		return {
			content: formattedPages,
			pagination,
		};
	} catch (error) {
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Pages',
			operation: 'listing',
			source: 'controllers/atlassian.pages.controller.ts@list',
			additionalInfo: { options },
		});
	}
}

/**
 * Gets details of a specific Confluence page
 * @param identifier - The page identifier
 * @param options - Options for retrieving page details
 * @returns Formatted page details
 */
async function get(
	identifier: PageIdentifier,
	options: GetPageOptions = {
		bodyFormat: DEFAULT_BODY_FORMAT,
		includeLabels: DEFAULT_INCLUDE_LABELS,
		includeProperties: DEFAULT_INCLUDE_PROPERTIES,
		includeWebresources: DEFAULT_INCLUDE_WEBRESOURCES,
		includeCollaborators: DEFAULT_INCLUDE_COLLABORATORS,
		includeVersion: DEFAULT_INCLUDE_VERSION,
	},
): Promise<ControllerResponse> {
	const { id } = identifier;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'get',
	);

	methodLogger.debug(`Getting Confluence page with ID: ${id}...`, options);

	try {
		// Map controller options to service parameters
		const serviceParams = {
			bodyFormat: options.bodyFormat,
			includeLabels: options.includeLabels,
			includeProperties: options.includeProperties,
			includeWebresources: options.includeWebresources,
			includeCollaborators: options.includeCollaborators,
			includeVersions: options.includeVersion, // Note: Mapping includeVersion → includeVersions
		};

		methodLogger.debug('Using service parameters:', serviceParams);

		const pageData = await atlassianPagesService.get(id, serviceParams);
		// Log only key information instead of the entire response
		methodLogger.debug(
			`Retrieved page: ${pageData.title} (${pageData.id})`,
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
			source: 'controllers/atlassian.pages.controller.ts@get',
			additionalInfo: { options },
		});
	}
}

export default { list, get };
