import {
	SpaceType,
	SpaceStatus,
	SpaceSortOrder,
} from '../services/vendor.atlassian.spaces.types.js';
import { PaginationOptions } from '../types/common.types.js';

/**
 * Options for listing Confluence spaces
 */
export interface ListSpacesOptions extends PaginationOptions {
	/**
	 * Filter spaces by type (defaults to global)
	 */
	type?: SpaceType;

	/**
	 * Filter spaces by status (defaults to current)
	 */
	status?: SpaceStatus;

	/**
	 * Property to sort by (e.g., 'name', '-id')
	 * Default: '-name' (name descending)
	 */
	sort?: SpaceSortOrder;
}
