import {
	ControllerResponse,
	PaginationOptions,
	EntityIdentifier,
} from '../types/common.types.js';

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
 * Options for searching Confluence content
 */
export interface SearchOptions extends PaginationOptions {
	/**
	 * Confluence Query Language (CQL) query
	 */
	cql: string;
}

// Re-export ControllerResponse for backward compatibility
export { ControllerResponse };
