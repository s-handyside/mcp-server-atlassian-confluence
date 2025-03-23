import { ControllerResponse, PaginationOptions } from './atlassian.type.js';

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
