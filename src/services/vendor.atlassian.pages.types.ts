/**
 * Types for Atlassian Confluence Pages API
 */
import {
	ContentProperty,
	ContentRepresentation,
	Label,
	Operation,
	OptionalFieldMeta,
	OptionalFieldLinks,
	PaginatedResponse,
	Version,
} from './vendor.atlassian.types.js';

/**
 * Page status enum
 */
export type ContentStatus =
	| 'current'
	| 'trashed'
	| 'deleted'
	| 'draft'
	| 'archived'
	| 'historical';

/**
 * Parent content type enum
 */
export type ParentContentType = 'page' | 'blogpost';

/**
 * Page sort order enum
 */
export type PageSortOrder =
	| 'id'
	| '-id'
	| 'created-date'
	| '-created-date'
	| 'modified-date'
	| '-modified-date'
	| 'title'
	| '-title';

/**
 * Body format enum
 */
export type BodyFormat =
	| 'storage'
	| 'atlas_doc_format'
	| 'view'
	| 'export_view'
	| 'anonymous_export_view'
	| 'styled_view'
	| 'editor';

/**
 * Body type object - extends ContentRepresentation with no additional fields
 */
export type BodyType = ContentRepresentation;

/**
 * Body bulk object
 */
export interface BodySingle {
	storage?: BodyType;
	atlas_doc_format?: BodyType;
	view?: BodyType;
}

/**
 * Page links object
 */
export interface PageLinks {
	webui: string;
	editui?: string;
	tinyui?: string;
	base?: string;
}

/**
 * Like object
 */
export interface Like {
	userId: string;
	createdAt: string;
}

/**
 * Page object returned from the API (basic fields)
 */
export interface Page {
	id: string;
	status: ContentStatus;
	title: string;
	spaceId: string;
	parentId: string | null;
	parentType?: ParentContentType;
	position?: number | null;
	authorId: string;
	ownerId?: string | null;
	lastOwnerId?: string | null;
	createdAt: string;
	version?: Version;
	body?: BodySingle;
	_links: PageLinks;
}

/**
 * Extended page object with optional fields
 */
export interface PageDetailed extends Page {
	labels?: {
		results: Label[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	properties?: {
		results: ContentProperty[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	operations?: {
		results: Operation[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	likes?: {
		results: Like[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	versions?: {
		results: Version[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	isFavoritedByCurrentUser?: boolean;
}

/**
 * Parameters for listing pages
 */
export interface ListPagesParams {
	id?: string[];
	spaceId?: string[];
	parentId?: string;
	sort?: PageSortOrder;
	status?: ContentStatus[];
	title?: string;
	bodyFormat?: BodyFormat;
	cursor?: string;
	limit?: number;
}

/**
 * Parameters for getting a page by ID
 */
export interface GetPageByIdParams {
	bodyFormat?: BodyFormat;
	getDraft?: boolean;
	status?: ContentStatus[];
	version?: number;
	includeLabels?: boolean;
	includeProperties?: boolean;
	includeOperations?: boolean;
	includeLikes?: boolean;
	includeVersions?: boolean;
	includeVersion?: boolean;
	includeFavoritedByCurrentUserStatus?: boolean;
	includeWebresources?: boolean;
	includeCollaborators?: boolean;
}

/**
 * API response for listing pages
 */
export type PagesResponse = PaginatedResponse<Page>;
