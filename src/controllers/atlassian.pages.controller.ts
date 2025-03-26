import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { ControllerResponse } from '../types/common.types.js';
import {
	GetPageOptions,
	ListPagesOptions,
	PageIdentifier,
} from './atlassian.pages.types.js';
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
		// Map controller options to service parameters
		const serviceParams: ListPagesParams = {
			// Optional filters
			spaceId: options.spaceId,
			status: options.status,
			// Pagination
			limit: options.limit || DEFAULT_PAGE_SIZE,
			cursor: options.cursor,
		};

		const pagesData = await atlassianPagesService.list(serviceParams);
		methodLogger.debug(`Retrieved ${pagesData.results?.length || 0} pages`);

		// Extract pagination information
		const pagination = extractPaginationInfo(
			pagesData,
			PaginationType.CURSOR,
			'controllers/atlassian.pages.controller.ts@list',
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
 * Gets details of a specific Confluence page
 * @param identifier The page identifier
 * @param options Options for retrieving page details
 * @returns Formatted page details
 */
async function get(
	identifier: PageIdentifier,
	options: GetPageOptions = {},
): Promise<ControllerResponse> {
	const { id } = identifier;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'get',
	);

	methodLogger.debug(`Getting Confluence page with ID: ${id}...`);

	try {
		// Apply default values to options
		const optionsWithDefaults = applyDefaults(options, {
			bodyFormat: PAGE_DEFAULTS.BODY_FORMAT,
			includeLabels: PAGE_DEFAULTS.INCLUDE_LABELS,
			includeProperties: PAGE_DEFAULTS.INCLUDE_PROPERTIES,
			includeWebresources: PAGE_DEFAULTS.INCLUDE_WEBRESOURCES,
			includeCollaborators: PAGE_DEFAULTS.INCLUDE_COLLABORATORS,
			includeVersion: PAGE_DEFAULTS.INCLUDE_VERSION,
		});

		// Map controller options to service parameters
		const serviceParams: GetPageByIdParams = {
			bodyFormat: optionsWithDefaults.bodyFormat as BodyFormat,
		};

		// Map boolean options to the appropriate service parameters
		if (optionsWithDefaults.includeLabels) {
			serviceParams.includeLabels = true;
		}

		if (optionsWithDefaults.includeProperties) {
			serviceParams.includeProperties = true;
		}

		if (optionsWithDefaults.includeWebresources) {
			serviceParams.includeWebresources = true;
		}

		if (optionsWithDefaults.includeCollaborators) {
			serviceParams.includeCollaborators = true;
		}

		if (optionsWithDefaults.includeVersion) {
			serviceParams.includeVersion = true;
		}

		const pageData = await atlassianPagesService.get(id, serviceParams);
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
			entityId: identifier,
			operation: 'retrieving',
			source: 'controllers/atlassian.pages.controller.ts@get',
			additionalInfo: { options },
		});
	}
}

export default { list, get };
