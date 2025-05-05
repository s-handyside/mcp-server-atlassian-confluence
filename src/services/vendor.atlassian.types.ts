/**
 * Common types for Atlassian Confluence API
 */

/**
 * Common response links
 */
export interface ResponseLinks {
	next?: string;
	base?: string;
	self?: string;
	context?: string;
}

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
	results: T[];
	_links: ResponseLinks;
}

/**
 * Common description format types
 */
export type DescriptionFormat = 'plain' | 'view';

/**
 * Generic content representation
 */
export interface ContentRepresentation {
	value: string;
	representation: string;
}
