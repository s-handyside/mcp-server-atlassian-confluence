import {
	SpaceType,
	SpaceStatus,
} from '../services/vendor.atlassian.spaces.types.js';
import {
	ControllerResponse,
	PaginationOptions,
	EntityIdentifier,
} from './atlassian.type.js';

/**
 * Space identifier for retrieving specific spaces
 */
export interface SpaceIdentifier extends EntityIdentifier {
	/**
	 * The ID or key of the space to retrieve
	 */
	idOrKey: string;
}

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
