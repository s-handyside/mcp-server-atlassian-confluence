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

	try {
		controllerLogger.debug('Searching content with options:', options);

		// Apply defaults and set a default query if none provided
		const mergedOptions = applyDefaults<SearchOptions>(options, {
			limit: DEFAULT_PAGE_SIZE,
			cql: 'type IN (page, blogpost) ORDER BY lastmodified DESC',
		});

		// Process CQL query: escape special characters, add any filters
		const processedCql = processCqlQuery(mergedOptions.cql);
		controllerLogger.debug('Processed CQL query:', { cql: processedCql });

		// Prepare search parameters for the service
		const searchParams = {
			cql: processedCql,
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
			excerpt: 'highlight' as ExcerptStrategy, // Show content matching search terms
		};

		// Call the service to perform the search
		const searchResponse =
			await atlassianSearchService.search(searchParams);
		controllerLogger.debug('Search returned results:', {
			count: searchResponse.results.length,
			hasMoreResults: !!searchResponse._links?.next,
		});

		// Extract pagination information for the response
		const pagination = extractPaginationInfo(
			searchResponse,
			PaginationType.CURSOR,
		);

		// Format the results for display
		const formattedContent = formatSearchResults(searchResponse.results);

		return {
			content: formattedContent,
			pagination,
		};
	} catch (error) {
		return handleControllerError(error, {
			entityType: 'content',
			operation: 'search',
			source: 'atlassian.search.controller.ts',
		});
	}
}

export default { search };
