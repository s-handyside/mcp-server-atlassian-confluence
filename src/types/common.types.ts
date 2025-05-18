/**
 * Common type definitions shared across controllers.
 * These types provide a standard interface for controller interactions.
 * Centralized here to ensure consistency across the codebase.
 */

/**
 * Common pagination information for API responses.
 * This is used for providing consistent pagination details to clients.
 * Note: This is now only used internally by controllers and formatPagination.
 * The formatted pagination information will be integrated into the content string.
 */
export interface ResponsePagination {
	/**
	 * Cursor for the next page of results, if available.
	 * This should be passed to subsequent requests to retrieve the next page.
	 */
	nextCursor?: string;

	/**
	 * Whether more results are available beyond the current page.
	 * When true, clients should use the nextCursor to retrieve more results.
	 */
	hasMore: boolean;

	/**
	 * The number of items in the current result set.
	 * This helps clients track how many items they've received.
	 */
	count?: number;

	/**
	 * The start index of the current result set.
	 * This helps clients track the starting point of their results.
	 */
	start?: number;

	/**
	 * The total number of items available.
	 * This helps clients understand the total scope of their results.
	 */
	total?: number;
}

/*
// Common pagination options for API requests.
// These options control how many results are returned and which page is retrieved.
export interface PaginationOptions {
	// Maximum number of results to return per page.
	// Valid range: 1-100
	// If not specified, the default page size (typically 25) will be used.
	limit?: number;

	// Pagination cursor for retrieving a specific page of results.
	// Obtain this value from the previous response's pagination information.
	cursor?: string;

	// Starting index for pagination (often used with limit).
	start?: number;
}
*/

/**
 * Common response structure for controller operations.
 * All controller methods should return this structure.
 *
 * Note: All information, including what was previously in metadata or handled
 * as a separate pagination object, is now part of this single Markdown content string,
 * composed by the Controller and its Formatters.
 */
export interface ControllerResponse {
	/**
	 * Formatted content to be displayed to the user.
	 * A comprehensive Markdown-formatted string that includes all necessary information,
	 * including pagination details and any additional metadata.
	 */
	content: string;
}
