import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { ControllerResponse } from '../types/common.types.js';
import atlassianSearchService from '../services/vendor.atlassian.search.service.js';
import { formatSearchResults } from './atlassian.search.formatter.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { DEFAULT_PAGE_SIZE, applyDefaults } from '../utils/defaults.util.js';
import { SearchParams } from '../services/vendor.atlassian.search.types.js';
import { SearchToolArgsType } from '../tools/atlassian.search.types.js';

const controllerLogger = Logger.forContext(
	'controllers/atlassian.search.controller.ts',
);
controllerLogger.debug('Search controller initialized');

/**
 * Escapes special characters in a string for safe use within CQL quotes.
 * Uses JSON.stringify to handle escaping and removes the outer quotes.
 * @param value The string to escape.
 * @returns Escaped string, suitable for placing inside CQL double quotes.
 */
function escapeCqlValue(value: string): string {
	// JSON.stringify correctly escapes quotes, backslashes, etc.
	const jsonString = JSON.stringify(value);
	// Remove the leading and trailing double quotes added by stringify
	return jsonString.slice(1, -1);
}

/**
 * Builds a CQL query string from provided options.
 * @param options SearchOptions containing filters.
 * @returns The constructed CQL string.
 */
function buildCqlQuery(options: SearchToolArgsType): string {
	const cqlParts: string[] = [];

	if (options.title) {
		cqlParts.push(`title ~ "${escapeCqlValue(options.title)}"`);
	}
	if (options.spaceKey) {
		cqlParts.push(`space = "${escapeCqlValue(options.spaceKey)}"`);
	}
	if (options.labels && options.labels.length > 0) {
		const escapedLabels = options.labels.map(escapeCqlValue);
		escapedLabels.forEach((label) => cqlParts.push(`label = "${label}"`));
	}
	if (options.contentType) {
		cqlParts.push(`type = ${options.contentType}`);
	}
	if (options.query) {
		cqlParts.push(`text ~ "${escapeCqlValue(options.query)}"`);
	}

	const generatedCql = cqlParts.join(' AND ');

	if (options.cql && options.cql.trim()) {
		if (generatedCql) {
			return `(${generatedCql}) AND (${options.cql})`;
		} else {
			return options.cql;
		}
	} else {
		return generatedCql || '';
	}
}

/**
 * Search Confluence content using CQL
 * @param options - Search options including CQL query and pagination
 * @returns Promise with formatted search results and pagination info
 * @throws Error if search operation fails
 */
async function search(
	options: SearchToolArgsType = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.search.controller.ts',
		'search',
	);
	methodLogger.debug('Searching Confluence with options:', options);

	try {
		const defaults: Partial<SearchToolArgsType> = {
			limit: DEFAULT_PAGE_SIZE,
		};
		const mergedOptions = applyDefaults<SearchToolArgsType>(
			options,
			defaults,
		);

		const finalCql = buildCqlQuery(mergedOptions);

		if (!finalCql || finalCql.trim() === '') {
			methodLogger.warn(
				'No CQL criteria provided for search. Returning empty.',
			);
			return {
				content:
					'Please provide search criteria (CQL, title, space, etc.).',
				pagination: { hasMore: false, count: 0 },
			};
		}

		methodLogger.debug(`Executing generated CQL: ${finalCql}`);

		const params: SearchParams = {
			cql: finalCql,
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
			excerpt: 'highlight',
			includeArchivedSpaces: false,
		};

		const searchData = await atlassianSearchService.search(params);

		methodLogger.debug(
			`Retrieved ${searchData.results.length} search results. Has more: ${searchData._links?.next ? 'yes' : 'no'}`,
		);

		const pagination = extractPaginationInfo(
			searchData,
			PaginationType.CURSOR,
		);

		// Pass search results directly to the formatter
		const formattedResults = formatSearchResults(searchData.results);

		return {
			content: formattedResults,
			pagination,
			metadata: { executedCql: finalCql },
		};
	} catch (error) {
		return handleControllerError(error, {
			entityType: 'Search Results',
			operation: 'searching',
			source: 'controllers/atlassian.search.controller.ts@search',
		});
	}
}

export default { search };
