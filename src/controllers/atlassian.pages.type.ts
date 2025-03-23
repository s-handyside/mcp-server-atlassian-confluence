import {
	ContentStatus,
	BodyFormat,
} from '../services/vendor.atlassian.pages.types.js';
import { ControllerResponse, PaginationOptions } from './atlassian.type.js';

/**
 * Options for listing Confluence pages
 */
export interface ListPagesOptions extends PaginationOptions {
	/**
	 * Filter pages by space ID
	 */
	spaceId?: string[];

	/**
	 * Filter pages by status
	 */
	status?: ContentStatus[];
}

/**
 * Options for getting a specific page
 */
export interface GetPageOptions {
	/**
	 * Format of the page body to retrieve
	 */
	bodyFormat?: BodyFormat;

	/**
	 * Whether to include page labels
	 */
	includeLabels?: boolean;

	/**
	 * Whether to include page properties
	 */
	includeProperties?: boolean;

	/**
	 * Whether to include web resources
	 */
	includeWebresources?: boolean;

	/**
	 * Whether to include collaborators
	 */
	includeCollaborators?: boolean;

	/**
	 * Whether to include version information
	 */
	includeVersion?: boolean;
}

// Re-export ControllerResponse for backward compatibility
export { ControllerResponse };
