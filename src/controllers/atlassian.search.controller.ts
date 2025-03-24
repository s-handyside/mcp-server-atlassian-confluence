import atlassianSearchService from '../services/vendor.atlassian.search.service.js';
import { logger } from '../utils/logger.util.js';
import { McpError, createApiError } from '../utils/error.util.js';
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

		// Already a McpError - pass it through without modification
		if (error instanceof McpError) {
			logger.debug(
				`[src/controllers/atlassian.search.controller.ts@search] Passing through McpError: ${errorMessage}`,
			);
			throw error;
		}

		// Check for specific error patterns and enhance them with helpful context

		// 1. Reserved keyword errors
		if (
			errorMessage.includes('Could not parse cql') &&
			(errorMessage.includes('reserved keyword') ||
				errorMessage.includes('reserved word'))
		) {
			logger.warn(
				`[src/controllers/atlassian.search.controller.ts@search] Reserved keyword error detected, providing guidance`,
			);

			// Provide specific guidance for fixing the query but preserve the original error
			const guidance =
				'Put quotes around reserved words like AND, OR, IN, etc. Example: space="IN" instead of space=IN.';

			// We create a new API error but maintain the original message as the prefix
			throw createApiError(`${errorMessage}. ${guidance}`, 400, error);
		}

		// 2. Syntax errors in CQL
		if (errorMessage.includes('Could not parse cql')) {
			logger.warn(
				`[src/controllers/atlassian.search.controller.ts@search] CQL syntax error detected`,
			);

			// General CQL syntax guidance while preserving the original message
			const guidance =
				'Check your CQL syntax. For complex queries, enclose terms with spaces in quotes.';

			throw createApiError(`${errorMessage}. ${guidance}`, 400, error);
		}

		// 3. Invalid cursor format
		if (
			errorMessage.includes('cursor') &&
			errorMessage.includes('invalid')
		) {
			logger.warn(
				`[src/controllers/atlassian.search.controller.ts@search] Invalid cursor detected`,
			);

			throw createApiError(
				`${errorMessage}. Use the exact cursor string returned from previous results.`,
				400,
				error,
			);
		}

		// Log the unhandled error
		logger.error(
			`[src/controllers/atlassian.search.controller.ts@search] Error searching Confluence`,
			error,
		);

		// Default: pass through with minimal wrapping to preserve original message
		throw createApiError(
			`${errorMessage}`,
			error instanceof Error && 'statusCode' in error
				? (error as { statusCode: number }).statusCode
				: undefined,
			error,
		);
	}
}

export default { search };
