import atlassianSearchService from '../services/vendor.atlassian.search.service.js';
import { logger } from '../utils/logger.util.js';
import {
	McpError,
	createUnexpectedError,
	createApiError,
} from '../utils/error.util.js';
import { SearchOptions, ControllerResponse } from './atlassian.search.type.js';
import {
	formatSearchResults,
	processCqlQuery,
} from './atlassian.search.formatter.js';
import { ExcerptStrategy } from '../services/vendor.atlassian.types.js';

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
	logger.debug(
		`[src/controllers/atlassian.search.controller.ts@search] Searching Confluence with CQL: ${options.cql}`,
		options,
	);

	try {
		// Process the CQL query to handle reserved keywords
		const processedCql = processCqlQuery(options.cql);

		// If the query was modified, log the change
		if (processedCql !== options.cql) {
			logger.debug(
				`[src/controllers/atlassian.search.controller.ts@search] Modified CQL query to handle reserved keywords: ${processedCql}`,
			);
		}

		// Set up search parameters
		const searchParams = {
			cql: processedCql,
			cursor: options.cursor,
			limit: options.limit || 25,
			excerpt: 'highlight' as ExcerptStrategy, // Always include highlighted excerpts in search results
		};

		logger.debug(
			`[src/controllers/atlassian.search.controller.ts@search] Using search params:`,
			searchParams,
		);

		const searchData = await atlassianSearchService.search(searchParams);
		logger.debug(
			`[src/controllers/atlassian.search.controller.ts@search] Retrieved ${searchData.results?.length || 0} results`,
		);

		// Extract pagination information
		let nextCursor: string | undefined;
		if (searchData._links.next) {
			// Extract cursor from the next URL
			const nextUrl = searchData._links.next;
			const cursorMatch = nextUrl.match(/cursor=([^&]+)/);
			if (cursorMatch && cursorMatch[1]) {
				nextCursor = decodeURIComponent(cursorMatch[1]);
				logger.debug(
					`[src/controllers/atlassian.search.controller.ts@search] Next cursor: ${nextCursor}`,
				);
			}
		}

		// Format the search results for display using the formatter
		const formattedResults = formatSearchResults(
			searchData.results,
			nextCursor,
		);

		return {
			content: formattedResults,
			pagination: {
				nextCursor,
				hasMore: !!nextCursor,
			},
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		// Check for reserved keyword errors
		if (
			errorMessage.includes('Could not parse cql') &&
			(errorMessage.includes('reserved keyword') ||
				errorMessage.includes('reserved word'))
		) {
			logger.warn(
				`[src/controllers/atlassian.search.controller.ts@search] Reserved keyword error detected, suggesting proper format`,
			);

			// Create a specific API error for reserved keywords
			const userMessage =
				'Your search contains a reserved keyword that needs to be quoted. ' +
				'For example, if searching for space=IN, use space="IN" instead.';

			// Use just the error message that includes the user-friendly message
			throw createApiError(`${errorMessage}: ${userMessage}`, 400, error);
		}

		logger.error(
			`[src/controllers/atlassian.search.controller.ts@search] Error searching Confluence`,
			error,
		);

		// Pass through McpErrors (they already have userMessage)
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap other errors
		throw createUnexpectedError(
			`Error searching Confluence: ${errorMessage}. Search error details: ${errorMessage}`,
			error,
		);
	}
}

export default { search };
