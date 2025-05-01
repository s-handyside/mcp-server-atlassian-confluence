import { PaginationOptions, EntityIdentifier } from '../types/common.types.js';

/**
 * Search identifier for retrieving specific search results
 * Note: Search operations don't typically use identifiers, but this is included
 * for consistency with other controllers
 */
export interface SearchIdentifier extends EntityIdentifier {
	/**
	 * The CQL query to use for searching
	 */
	cql: string;
}

/**
 * Options for the Confluence search controller.
 * Defines filtering and pagination parameters for CQL searches.
 */
export interface SearchOptions extends PaginationOptions {
	/**
	 * The Confluence Query Language (CQL) string to execute.
	 * Example: 'type=page AND space=DEV AND text ~ "release notes"'
	 * If provided alongside specific filters (title, spaceKey, etc.),
	 * the specific filters will be combined with this CQL using AND.
	 */
	cql?: string;

	/**
	 * Filter results to content where the title contains this text (case-insensitive).
	 */
	title?: string;

	/**
	 * Filter results to content within a specific space, identified by its key.
	 * Example: "DEV", "HR"
	 */
	spaceKey?: string;

	/**
	 * Filter results to content tagged with specific labels.
	 */
	label?: string[];

	/**
	 * Filter results by specific content type.
	 */
	contentType?: 'page' | 'blogpost';
}
