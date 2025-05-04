import {
	ContentStatus,
	PageSortOrder,
} from '../services/vendor.atlassian.pages.types.js';
import { PaginationOptions } from '../types/common.types.js';

/**
 * Options for listing Confluence pages.
 * These options control filtering and pagination of page listings.
 */
export interface ListPagesOptions extends PaginationOptions {
	/**
	 * Filter pages by space ID.
	 * Limits results to pages in the specified spaces.
	 */
	spaceIds?: string[];

	/**
	 * Filter pages by space key.
	 * More user-friendly alternative to spaceId that uses readable space keys
	 * like "DEV" or "HR" instead of numeric IDs.
	 */
	spaceKeys?: string[];

	/**
	 * Filter pages by status.
	 * Examples: 'current', 'draft', 'archived'
	 */
	status?: ContentStatus[];

	/**
	 * Text-based filter for pages.
	 * Search by title, content, or labels.
	 */
	query?: string;

	/**
	 * Property to sort by (e.g., 'title', '-modified-date')
	 * Default: '-modified-date' (most recently modified first)
	 */
	sort?: PageSortOrder;
}
