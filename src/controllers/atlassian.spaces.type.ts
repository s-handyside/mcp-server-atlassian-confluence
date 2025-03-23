import {
	SpaceType,
	SpaceStatus,
} from '../services/vendor.atlassian.spaces.types.js';
import { ControllerResponse, PaginationOptions } from './atlassian.type.js';

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
}

// Re-export ControllerResponse for backward compatibility
export { ControllerResponse };
