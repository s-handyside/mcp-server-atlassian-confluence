/**
 * Types for Atlassian Confluence Spaces API
 */
import {
	ContentProperty,
	ContentRepresentation,
	DescriptionFormat,
	Label,
	Operation,
	OptionalFieldMeta,
	OptionalFieldLinks,
	PaginatedResponse,
} from './vendor.atlassian.types.js';

/**
 * Space type enum
 */
export type SpaceType =
	| 'global'
	| 'personal'
	| 'collaboration'
	| 'knowledge_base';

/**
 * Space status enum
 */
export type SpaceStatus = 'current' | 'archived';

/**
 * Space sort order enum
 */
export type SpaceSortOrder = 'id' | '-id' | 'key' | '-key' | 'name' | '-name';

/**
 * Space description object
 */
export interface SpaceDescription {
	plain?: ContentRepresentation;
	view?: ContentRepresentation;
}

/**
 * Space icon object
 */
export interface SpaceIcon {
	path?: string;
	apiDownloadLink?: string;
}

/**
 * Space links object
 */
export interface SpaceLinks {
	webui: string;
	base?: string;
}

/**
 * Space property object - alias for ContentProperty with no additional fields
 */
export type SpaceProperty = ContentProperty;

/**
 * Permission subject object
 */
export interface PermissionSubject {
	type: 'user' | 'group';
	identifier: string;
}

/**
 * Space permission assignment object
 */
export interface SpacePermissionAssignment {
	id: string;
	subject: PermissionSubject;
	operation: Operation;
}

/**
 * Space role assignment object
 */
export interface SpaceRoleAssignment {
	id: string;
	role: string;
	subject: PermissionSubject;
}

/**
 * Space object returned from the API (basic fields)
 */
export interface Space {
	id: string;
	key: string;
	name: string;
	type: SpaceType;
	status: SpaceStatus;
	authorId: string;
	createdAt: string;
	homepageId: string;
	description?: SpaceDescription;
	icon?: SpaceIcon;
	_links: SpaceLinks;
	currentActiveAlias?: string;
}

/**
 * Extended space object with optional fields
 */
export interface SpaceDetailed extends Space {
	labels?: {
		results: Label[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	properties?: {
		results: SpaceProperty[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	operations?: {
		results: Operation[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	permissions?: {
		results: SpacePermissionAssignment[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	roleAssignments?: {
		results: SpaceRoleAssignment[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
}

/**
 * Parameters for listing spaces
 */
export interface ListSpacesParams {
	ids?: string[];
	keys?: string[];
	type?: SpaceType;
	status?: SpaceStatus;
	labels?: string[];
	favoritedBy?: string;
	notFavoritedBy?: string;
	sort?: SpaceSortOrder;
	descriptionFormat?: DescriptionFormat;
	includeIcon?: boolean;
	cursor?: string;
	limit?: number;
}

/**
 * Parameters for getting a space by ID
 */
export interface GetSpaceByIdParams {
	descriptionFormat?: DescriptionFormat;
	includeIcon?: boolean;
	includeOperations?: boolean;
	includeProperties?: boolean;
	includePermissions?: boolean;
	includeRoleAssignments?: boolean;
	includeLabels?: boolean;
}

/**
 * API response for listing spaces
 */
export type SpacesResponse = PaginatedResponse<Space>;
