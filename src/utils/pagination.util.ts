import { Logger } from './logger.util.js';

const paginationLogger = Logger.forContext('utils/pagination.util.ts');

/**
 * Available pagination types supported by the application
 */
export enum PaginationType {
	/**
	 * Offset-based pagination (startAt, maxResults, total)
	 * Used by Jira APIs
	 */
	OFFSET = 'offset',

	/**
	 * Cursor-based pagination (cursor in URL)
	 * Used by Confluence APIs
	 */
	CURSOR = 'cursor',

	/**
	 * Page-based pagination (page parameter in URL)
	 * Used by Bitbucket APIs
	 */
	PAGE = 'page',
}

/**
 * Generic interface for all paginated API response data that may include
 * pagination information in different formats
 */
export interface PaginationData {
	_links?: {
		next?: string;
	};
}

/**
 * Response structure for offset-based pagination (start-at, max-results)
 */
export interface OffsetPaginationData extends PaginationData {
	startAt?: number;
	maxResults?: number;
	total?: number;
	isLast?: boolean;
}

/**
 * Response structure for cursor-based pagination
 */
// Unused interface - commented out
// export interface CursorPaginationData extends PaginationData {
// 	_links: {
// 		next?: string;
// 	};
// }

/**
 * Response structure for page-based pagination
 */
export interface PagePaginationData extends PaginationData {
	page?: number;
	size?: number;
	totalElements?: number;
	totalPages?: number;
	last?: boolean;
}

/**
 * Adapter function to convert Zod-validated API responses to pagination data
 * @param data Any API response with potential pagination properties
 * @returns A PaginationData compatible object
 */
export function adaptResponseForPagination(data: unknown): PaginationData {
	// Create a basic pagination data structure
	const paginationData: PaginationData = {};

	// Handle _links for cursor-based pagination
	if (data && typeof data === 'object' && '_links' in data) {
		const typedData = data as { _links?: { next?: string } };
		paginationData._links = { next: typedData._links?.next };
	}

	// For offset-based pagination
	if (data && typeof data === 'object' && 'startAt' in data) {
		(paginationData as OffsetPaginationData).startAt = (
			data as { startAt?: number }
		).startAt;
	}
	if (data && typeof data === 'object' && 'maxResults' in data) {
		(paginationData as OffsetPaginationData).maxResults = (
			data as { maxResults?: number }
		).maxResults;
	}
	if (data && typeof data === 'object' && 'total' in data) {
		(paginationData as OffsetPaginationData).total = (
			data as { total?: number }
		).total;
	}
	if (data && typeof data === 'object' && 'isLast' in data) {
		(paginationData as OffsetPaginationData).isLast = (
			data as { isLast?: boolean }
		).isLast;
	}

	// For page-based pagination
	if (data && typeof data === 'object' && 'page' in data) {
		(paginationData as PagePaginationData).page = (
			data as { page?: number }
		).page;
	}
	if (data && typeof data === 'object' && 'size' in data) {
		(paginationData as PagePaginationData).size = (
			data as { size?: number }
		).size;
	}
	if (data && typeof data === 'object' && 'totalElements' in data) {
		(paginationData as PagePaginationData).totalElements = (
			data as { totalElements?: number }
		).totalElements;
	}
	if (data && typeof data === 'object' && 'totalPages' in data) {
		(paginationData as PagePaginationData).totalPages = (
			data as { totalPages?: number }
		).totalPages;
	}
	if (data && typeof data === 'object' && 'last' in data) {
		(paginationData as PagePaginationData).last = (
			data as { last?: boolean }
		).last;
	}

	return paginationData;
}

/**
 * Standardized pagination format for controller responses
 */
export interface ResponsePagination {
	/**
	 * Number of items in the current response
	 */
	count: number;
	/**
	 * Whether more items are available
	 */
	hasMore: boolean;
	/**
	 * Cursor to use for the next page, if applicable
	 */
	nextCursor?: string;
	/**
	 * Total number of items, if available
	 */
	total?: number;
}

/**
 * Extract pagination information from an API response and convert it to a standardized format
 * @param data The API response data containing pagination information
 * @param type The type of pagination used in the response
 * @param entityType Optional entity type for logging
 * @returns Standardized pagination object or undefined if no pagination info is available
 */
export function extractPaginationInfo(
	data: unknown,
	type: PaginationType,
	entityType?: string,
): ResponsePagination | undefined {
	// First adapt the response to ensure it has a compatible structure
	const adaptedData = adaptResponseForPagination(data);

	// Apply normal extraction logic to the adapted data
	const logger = paginationLogger.forMethod('extractPaginationInfo');

	// Extract the results array for counting items
	let resultsArray: Array<unknown> = [];
	if (
		data &&
		typeof data === 'object' &&
		'results' in data &&
		Array.isArray((data as { results: unknown[] }).results)
	) {
		resultsArray = (data as { results: unknown[] }).results;
	} else if (data && Array.isArray(data)) {
		resultsArray = data as unknown[];
	}

	// Count of items in the current response
	const count = resultsArray.length;

	// Default to undefined - will be populated based on pagination type
	let hasMore = false;
	let nextCursor: string | undefined = undefined;
	let total: number | undefined = undefined;

	try {
		switch (type) {
			case PaginationType.CURSOR:
				// Cursor-based pagination (Confluence API v2 style)
				if (adaptedData._links?.next) {
					hasMore = true;
					// Extract cursor from next link if it exists
					const cursorMatch =
						adaptedData._links.next.match(/cursor=([^&]+)/);
					if (cursorMatch && cursorMatch[1]) {
						nextCursor = cursorMatch[1];
					}
				} else {
					hasMore = false;
				}
				break;

			case PaginationType.OFFSET: {
				// Offset-based pagination (Jira API style)
				const offsetData = adaptedData as OffsetPaginationData;
				if (
					offsetData.startAt !== undefined &&
					offsetData.maxResults !== undefined &&
					offsetData.total !== undefined
				) {
					const endAt = offsetData.startAt + count;
					hasMore = endAt < offsetData.total;
					nextCursor = hasMore ? endAt.toString() : undefined;
					total = offsetData.total;
				} else if (offsetData.isLast !== undefined) {
					hasMore = !offsetData.isLast;
				}
				break;
			}

			case PaginationType.PAGE: {
				// Page-based pagination
				const pageData = adaptedData as PagePaginationData;
				if (pageData.last !== undefined) {
					hasMore = !pageData.last;
					if (hasMore && pageData.page !== undefined) {
						nextCursor = (pageData.page + 1).toString();
					}
				}
				if (pageData.totalElements !== undefined) {
					total = pageData.totalElements;
				}
				break;
			}

			default:
				logger.warn(
					`Unknown pagination type: ${type} for ${entityType || 'entity'}`,
				);
				return undefined;
		}

		// Return the standardized pagination object
		return {
			count,
			hasMore,
			...(nextCursor && { nextCursor }),
			...(total !== undefined && { total }),
		};
	} catch (error) {
		logger.warn(
			`Error extracting pagination info for ${entityType || 'entity'}: ${String(error)}`,
		);
		// If error occurred, return basic info without next cursor
		return {
			count,
			hasMore: false,
		};
	}
}
