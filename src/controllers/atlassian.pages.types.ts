import {
	ContentStatus,
	BodyFormat,
} from '../services/vendor.atlassian.pages.types.js';
import { PaginationOptions, EntityIdentifier } from '../types/common.types.js';

/**
 * Page identifier for retrieving specific pages.
 * Used as the parameter to get() method.
 */
export interface PageIdentifier extends EntityIdentifier {
	/**
	 * The ID of the page to retrieve.
	 * This is the unique numeric identifier for the Confluence page.
	 */
	id: string;
}

/**
 * Options for listing Confluence pages.
 * These options control filtering and pagination of page listings.
 */
export interface ListPagesOptions extends PaginationOptions {
	/**
	 * Filter pages by space ID.
	 * Limits results to pages in the specified spaces.
	 */
	spaceId?: string[];

	/**
	 * Filter pages by status.
	 * Examples: 'current', 'draft', 'archived'
	 */
	status?: ContentStatus[];
}

/**
 * Options for getting detailed page information.
 * These options control what additional data is included in the response.
 */
export interface GetPageOptions {
	/**
	 * Format of the page body to retrieve.
	 * Controls how the page content is formatted in the response.
	 * Default: 'view'
	 */
	bodyFormat?: BodyFormat;

	/**
	 * Whether to include page labels.
	 * When true, retrieves the labels associated with the page.
	 * Default: true
	 */
	includeLabels?: boolean;

	/**
	 * Whether to include page properties.
	 * When true, retrieves the custom properties associated with the page.
	 * Default: true
	 */
	includeProperties?: boolean;

	/**
	 * Whether to include web resources.
	 * When true, retrieves web resources associated with the page.
	 * Default: true
	 */
	includeWebresources?: boolean;

	/**
	 * Whether to include collaborators.
	 * When true, retrieves information about page contributors.
	 * Default: true
	 */
	includeCollaborators?: boolean;

	/**
	 * Whether to include version information.
	 * When true, retrieves version history metadata for the page.
	 * Default: false
	 */
	includeVersion?: boolean;
}
