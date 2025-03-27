import atlassianSearchService from '../services/vendor.atlassian.search.service.js';
import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { ControllerResponse } from '../types/common.types.js';
import { SearchOptions } from './atlassian.search.types.js';
import {
	formatSearchResults,
	processCqlQuery,
} from './atlassian.search.formatter.js';
import { ExcerptStrategy } from '../services/vendor.atlassian.types.js';
import { DEFAULT_PAGE_SIZE, applyDefaults } from '../utils/defaults.util.js';

/**
 * Controller for searching Confluence content.
 * Provides functionality for searching content using CQL.
 */

/**
 * Search Confluence content using CQL
 * @param options - Search options including CQL query, cursor, and limit
 * @returns Promise with formatted search results and pagination information
 */
async function search(options: SearchOptions): Promise<ControllerResponse> {
	const controllerLogger = Logger.forContext(
		'controllers/atlassian.search.controller.ts',
		'search',
	);
	controllerLogger.debug('Searching Confluence with CQL:', options);

	try {
		if (!options.cql) {
			// Instead of throwing createApiError directly, use handleControllerError
			handleControllerError(
				new Error('CQL query is required for search'),
				{
					entityType: 'Search',
					operation: 'validating',
					source: 'controllers/atlassian.search.controller.ts@search',
				},
			);
		}

		// Create defaults object with proper typing
		const defaults: Partial<SearchOptions> = {
			limit: DEFAULT_PAGE_SIZE,
		};

		// Apply defaults
		const mergedOptions = applyDefaults<SearchOptions>(options, defaults);

		// Set up search parameters
		const searchParams = {
			cql: processCqlQuery(mergedOptions.cql || ''),
			cursor: mergedOptions.cursor,
			limit: mergedOptions.limit,
			excerpt: 'highlight' as ExcerptStrategy, // Always include highlighted excerpts in search results
		};

		controllerLogger.debug('Using search params:', searchParams);

		const searchData = await atlassianSearchService.search(searchParams);
		controllerLogger.debug(
			`Retrieved ${searchData.results?.length || 0} results`,
		);

		// Extract pagination information using the utility
		const pagination = extractPaginationInfo(
			searchData,
			PaginationType.CURSOR,
		);

		// Format the search results for display using the formatter
		const formattedResults = formatSearchResults(searchData.results);

		return {
			content: formattedResults,
			pagination,
		};
	} catch (error) {
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Search',
			operation: 'searching',
			source: 'controllers/atlassian.search.controller.ts@search',
			additionalInfo: { options, cql: options.cql },
		});
	}
}

export default { search };
